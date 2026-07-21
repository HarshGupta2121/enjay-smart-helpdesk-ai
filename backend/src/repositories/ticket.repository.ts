import prisma from '../config/prisma';
import { Prisma, TicketStatus, TicketPriority } from '@prisma/client';
import { ConflictError } from '../utils/errors';

export class TicketRepository {
  // ==========================================
  //          TICKET NUMBER GENERATION
  // ==========================================
  /**
   * Generates a concurrency-safe, human-readable ticket number (e.g., HD-2026-000001).
   * Using Prisma's atomic increment ensures no two transactions get the same number,
   * even under high load.
   */
  async generateTicketNumber(): Promise<string> {
    const sequence = await prisma.ticketSequence.upsert({
      where: { id: 'TICKET_SEQ' },
      update: {
        lastValue: { increment: 1 },
      },
      create: {
        id: 'TICKET_SEQ',
        lastValue: 1,
      },
    });

    const year = new Date().getFullYear();
    const paddedValue = String(sequence.lastValue).padStart(6, '0');
    return `HD-${year}-${paddedValue}`;
  }

  // ==========================================
  //             TICKET OPERATIONS
  // ==========================================
  async createTicket(data: Omit<Prisma.TicketCreateInput, 'ticketNumber'>) {
    const ticketNumber = await this.generateTicketNumber();

    return prisma.ticket.create({
      data: {
        ...data,
        ticketNumber,
      },
      include: {
        requester: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        assignee: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
    });
  }

  async findTicketById(id: string) {
    return prisma.ticket.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        requester: { select: { id: true, fullName: true, email: true, avatar: true } },
        assignee: { select: { id: true, fullName: true, email: true, avatar: true } },
        tags: { include: { tag: true } },
      },
    });
  }

  /**
   * Uses Optimistic Locking via the 'version' field.
   * If two agents edit simultaneously, the second one to save will fail
   * because their known version won't match the DB version anymore.
   */
  async updateTicketOptimistic(
    id: string,
    currentVersion: number,
    data: Prisma.TicketUpdateInput
  ) {
    // We use updateMany because Prisma's normal update() doesn't allow 'version' in the where clause easily
    const result = await prisma.ticket.updateMany({
      where: {
        id,
        version: currentVersion,
        deletedAt: null,
      },
      data: {
        ...data,
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      throw new ConflictError(
        'The ticket was modified by another user. Please refresh and try again.'
      );
    }

    return this.findTicketById(id);
  }

  async findTickets(filters: {
    status?: string;
    priority?: string;
    category?: string;
    assigneeId?: string;
    requesterId?: string;
    searchTerm?: string;
    page: number;
    limit: number;
  }, enforcedWhere?: Prisma.TicketWhereInput) {
    const whereClause: Prisma.TicketWhereInput = {
      deletedAt: null,
    };

    if (filters.status) whereClause.status = filters.status as any;
    if (filters.priority) whereClause.priority = filters.priority as any;
    if (filters.category) whereClause.category = filters.category as any;
    if (filters.assigneeId) whereClause.assigneeId = filters.assigneeId;
    if (filters.requesterId) whereClause.requesterId = filters.requesterId;

    if (filters.searchTerm) {
      whereClause.OR = [
        { title: { contains: filters.searchTerm, mode: 'insensitive' } },
        { ticketNumber: { contains: filters.searchTerm, mode: 'insensitive' } },
      ];
    }

    
    const finalWhere: Prisma.TicketWhereInput = enforcedWhere 
      ? { AND: [whereClause, enforcedWhere] } 
      : whereClause;

    const skip = (filters.page - 1) * filters.limit;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where: finalWhere,
        skip,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          requester: { select: { id: true, fullName: true, avatar: true } },
          assignee: { select: { id: true, fullName: true, avatar: true } },
        },
      }),
      prisma.ticket.count({ where: finalWhere })
    ]);

    return { 
      tickets, 
      meta: { 
        total, 
        page: filters.page, 
        totalPages: Math.ceil(total / filters.limit) 
      } 
    };
  }

  // ==========================================
  //             AUDIT & COMMENTS
  // ==========================================
  async addActivity(data: Prisma.TicketActivityUncheckedCreateInput) {
    return prisma.ticketActivity.create({ data });
  }

  async addComment(data: Prisma.TicketCommentUncheckedCreateInput) {
    return prisma.ticketComment.create({
      data,
      include: {
        author: { select: { id: true, fullName: true, avatar: true, role: true } },
      },
    });
  }

  async getTicketTimeline(ticketId: string) {
    const [comments, activities] = await Promise.all([
      prisma.ticketComment.findMany({
        where: { ticketId, deletedAt: null },
        include: {
          author: { select: { id: true, fullName: true, avatar: true, role: true } },
          attachments: true,
        },
      }),
      prisma.ticketActivity.findMany({
        where: { ticketId },
        include: {
          actor: { select: { id: true, fullName: true, avatar: true, role: true } },
        },
      }),
    ]);

    // The Service layer will be responsible for merging and sorting these chronologically.
    return { comments, activities };
  }
  async getDashboardStats(enforcedWhere?: Prisma.TicketWhereInput) {
    const whereClause: Prisma.TicketWhereInput = { deletedAt: null };
    const finalWhere: Prisma.TicketWhereInput = enforcedWhere
      ? { AND: [whereClause, enforcedWhere] }
      : whereClause;

    const [total, open, pending, resolved, urgent] = await Promise.all([
      prisma.ticket.count({ where: finalWhere }),
      prisma.ticket.count({ where: { AND: [finalWhere, { status: TicketStatus.OPEN }] } }),
      prisma.ticket.count({ where: { AND: [finalWhere, { status: TicketStatus.PENDING }] } }),
      prisma.ticket.count({ where: { AND: [finalWhere, { status: TicketStatus.RESOLVED }] } }),
      prisma.ticket.count({
        where: {
          AND: [
            finalWhere,
            { OR: [{ priority: TicketPriority.URGENT }, { priority: TicketPriority.CRITICAL }] }
          ]
        }
      })
    ]);

    return { total, open, pending, resolved, urgent };
  }
}

export default new TicketRepository();