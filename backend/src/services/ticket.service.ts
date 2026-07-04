import ticketRepository from '../repositories/ticket.repository';
import { isValidTransition } from '../utils/ticketStateMachine';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { Prisma, TicketStatus, TicketPriority } from '@prisma/client';

export class TicketService {
  /**
   * Helper: Calculates baseline SLAs. In an enterprise system, this connects to
   * a complex business-hours and tier matrix.
   */
  private calculateSLAs(priority: TicketPriority) {
    const now = new Date();
    let firstResponseHours = 4;
    let resolutionHours = 24;

    if (priority === 'URGENT') {
      firstResponseHours = 1;
      resolutionHours = 4;
    } else if (priority === 'CRITICAL') {
      firstResponseHours = 0.5; // 30 mins
      resolutionHours = 2;
    }

    return {
      firstResponseDueAt: new Date(now.getTime() + firstResponseHours * 60 * 60 * 1000),
      resolutionDueAt: new Date(now.getTime() + resolutionHours * 60 * 60 * 1000),
    };
  }

  /**
   * 1. createTicket
   * Creates a new ticket, assigns SLAs based on priority, delegates sequential ticket
   * number generation to the repository, and creates the genesis 'TICKET_CREATED' activity.
   */
  async createTicket(
    data: Omit<Prisma.TicketCreateInput, 'ticketNumber' | 'requester'>,
    requesterId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const priority = (data.priority as TicketPriority) || 'MEDIUM';
    const slas = this.calculateSLAs(priority);

    // Repository handles atomic ticket number generation via TicketSequence table
    const ticket = await ticketRepository.createTicket({
      ...data,
      requester: { connect: { id: requesterId } },
      firstResponseDueAt: slas.firstResponseDueAt,
      resolutionDueAt: slas.resolutionDueAt,
    });

    // Write genesis audit activity
    await ticketRepository.addActivity({
      action: 'TICKET_CREATED',
      ticketId: ticket.id,
      actorId: requesterId,
      ipAddress,
      userAgent,
      current: { status: ticket.status, priority: ticket.priority },
    });

    return ticket;
  }

  /**
   * 2. getTicketWithTimeline
   * Fetches the ticket details and orchestrates the merging of Comments and Activities
   * into a single, unified, chronologically sorted timeline for the frontend.
   */
  async getTicketWithTimeline(ticketId: string) {
    const ticket = await ticketRepository.findTicketById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');

    const { comments, activities } = await ticketRepository.getTicketTimeline(ticketId);

    const timeline = [
      ...comments.map(c => ({ ...c, timelineType: 'COMMENT' as const })),
      ...activities.map(a => ({ ...a, timelineType: 'ACTIVITY' as const })),
    ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return { ticket, timeline };
  }

  /**
   * 3. updateTicketStatus
   * The core state mutation method. Validates the state machine, records resolution times,
   * enforces Optimistic Locking to prevent agent collisions, and records the activity.
   */
  async updateTicketStatus(
    ticketId: string,
    newStatus: TicketStatus,
    currentVersion: number,
    actorId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const ticket = await ticketRepository.findTicketById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');

    if (ticket.status === newStatus) {
      return ticket;
    }

    // State Machine Enforcement
    if (!isValidTransition(ticket.status, newStatus)) {
      throw new BadRequestError(`Invalid status transition from ${ticket.status} to ${newStatus}`);
    }

    // Assign completion timestamps based on state
    const updateData: Prisma.TicketUpdateInput = { status: newStatus };
    const now = new Date();

    if (newStatus === 'RESOLVED' && !ticket.resolvedAt) {
      updateData.resolvedAt = now;
    }
    if (newStatus === 'CLOSED' && !ticket.closedAt) {
      updateData.closedAt = now;
    }
    // If reopened, clear the resolution timestamps to restart SLAs logically
    if (newStatus === 'REOPENED') {
      updateData.resolvedAt = null;
      updateData.closedAt = null;
    }

    // Execute via Optimistic Locking in the Repository
    const updatedTicket = await ticketRepository.updateTicketOptimistic(ticketId, currentVersion, updateData);

    // Audit Log (Event Sourcing)
    await ticketRepository.addActivity({
      action: 'STATUS_CHANGED',
      ticketId: ticket.id,
      actorId,
      ipAddress,
      userAgent,
      previous: { status: ticket.status },
      current: { status: newStatus },
    });

    return updatedTicket;
  }

  /**
   * 4. addComment
   * Adds a comment to the thread. If this is the first public comment by an agent,
   * it fulfills the `firstResponseAt` SLA condition automatically using optimistic locking.
   */
  async addComment(
    ticketId: string,
    content: string,
    isInternal: boolean,
    authorId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const ticket = await ticketRepository.findTicketById(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');

    const comment = await ticketRepository.addComment({
      content,
      isInternal,
      ticketId,
      authorId,
    });

    // Auto-fulfill First Response SLA
    if (!isInternal && ticket.requesterId !== authorId && !ticket.firstResponseAt) {
      await ticketRepository.updateTicketOptimistic(ticketId, ticket.version, {
        firstResponseAt: new Date(),
      });
    }

    await ticketRepository.addActivity({
      action: 'COMMENT_ADDED',
      ticketId,
      actorId: authorId,
      ipAddress,
      userAgent,
      current: { isInternal },
    });

    return comment;
  }
}

export default new TicketService();