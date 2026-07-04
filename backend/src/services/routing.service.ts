import prisma from '../config/prisma';
import ticketRepository from '../repositories/ticket.repository';
import teamRepository from '../repositories/team.repository';
import { TicketCategory, AssignmentStrategy, Ticket } from '@prisma/client';

export class RoutingService {
  /**
   * Main entry point for the Routing Engine.
   * Intercepts a new ticket, determines its Team via Category, and Auto-Assigns it.
   */
  async routeNewTicket(ticket: Ticket) {
    // 1. Determine Target Team based on Ticket Category
    const teamName = this.mapCategoryToTeam(ticket.category);
    let team = await teamRepository.getTeamByName(teamName);

    // Auto-bootstrap teams if they don't exist yet (for seamless setup)
    if (!team) {
      const newTeam = await teamRepository.createTeam({ name: teamName });
      await teamRepository.createTeamSettings(newTeam.id, 'LEAST_OPEN');
      await teamRepository.createQueue(newTeam.id, 'General');
      team = await teamRepository.getTeamByName(teamName);
    }

    if (!team) throw new Error('Critical routing failure: Team could not be bootstrapped.');

    const defaultQueue = team.queues[0];

    // 2. Fetch Team Settings for Assignment Strategy
    const strategy = team.settings?.assignmentStrategy || 'MANUAL';

    // 3. Execute Assignment Algorithm
    const assigneeId = await this.executeAssignmentStrategy(team.id, strategy);

    // 4. Update the Ticket and Apply SLAs
    const firstResponseSlaHrs = team.settings?.firstResponseSlaHrs || 4;
    const resolutionSlaHrs = team.settings?.resolutionSlaHrs || 24;
    const now = new Date();

    const updateData: any = {
      teamId: team.id,
      queueId: defaultQueue?.id,
      firstResponseDueAt: new Date(now.getTime() + firstResponseSlaHrs * 60 * 60 * 1000),
      resolutionDueAt: new Date(now.getTime() + resolutionSlaHrs * 60 * 60 * 1000),
    };

    if (assigneeId) {
      updateData.assigneeId = assigneeId;
      updateData.status = 'OPEN'; // Auto-open if assigned
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: updateData,
    });

    // 5. Generate Audit Trails for Routing
    await ticketRepository.addActivity({
      action: 'ROUTING_APPLIED',
      ticketId: ticket.id,
      actorId: ticket.requesterId,
      current: { team: teamName, queue: defaultQueue?.name, strategy },
    });

    if (assigneeId) {
      await ticketRepository.addActivity({
        action: 'ASSIGNMENT_CHANGED',
        ticketId: ticket.id,
        actorId: ticket.requesterId, // System/Requester triggered the auto-assign
        current: { assigneeId, autoAssigned: true },
      });
    }

    return updatedTicket;
  }

  /**
   * Strategy Pattern for Auto-Assignment
   */
  private async executeAssignmentStrategy(teamId: string, strategy: AssignmentStrategy): Promise<string | null> {
    if (strategy === 'MANUAL') return null;

    const members = await teamRepository.getTeamMembers(teamId);
    if (members.length === 0) return null;

    const userIds = members.map((m) => m.userId);

    switch (strategy) {
      case 'LEAST_OPEN':
        return this.getAgentWithLeastOpenTickets(userIds);
      case 'LEAST_ACTIVE':
        return this.getLeastActiveAgent(userIds);
      case 'ROUND_ROBIN':
        // A stateless pseudo-round-robin: Pick the agent whose last assigned ticket is the oldest
        return this.getRoundRobinAgent(userIds);
      default:
        return null;
    }
  }

  private async getAgentWithLeastOpenTickets(userIds: string[]): Promise<string> {
    const agents = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        assignedTickets: {
          where: { status: { in: ['NEW', 'OPEN', 'PENDING'] } },
        },
      },
    });

    agents.sort((a, b) => a.assignedTickets.length - b.assignedTickets.length);
    return agents[0].id;
  }

  private async getLeastActiveAgent(userIds: string[]): Promise<string> {
    const agents = await prisma.user.findMany({
      where: { id: { in: userIds } },
      orderBy: { lastLoginAt: 'asc' }, // Oldest login first
    });
    return agents[0].id;
  }

  private async getRoundRobinAgent(userIds: string[]): Promise<string> {
    // Find who was assigned a ticket the longest time ago
    const agents = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        assignedTickets: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    agents.sort((a, b) => {
      const aTime = a.assignedTickets[0]?.createdAt.getTime() || 0;
      const bTime = b.assignedTickets[0]?.createdAt.getTime() || 0;
      return aTime - bTime;
    });

    return agents[0].id;
  }

  /**
   * Future-proof mapping for Routing
   */
  private mapCategoryToTeam(category: TicketCategory): string {
    switch (category) {
      case 'ACCOUNT':
      case 'EMAIL':
        return 'Billing & Account Services';
      case 'HARDWARE':
      case 'NETWORK':
        return 'IT Support';
      case 'SOFTWARE':
      case 'SECURITY':
        return 'Technical Engineering';
      default:
        return 'General Support';
    }
  }
}

export default new RoutingService();