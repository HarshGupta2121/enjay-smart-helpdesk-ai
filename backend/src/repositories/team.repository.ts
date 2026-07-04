import prisma from '../config/prisma';
import { Prisma, TeamRole, AssignmentStrategy } from '@prisma/client';

export class TeamRepository {
  async createTeam(data: Prisma.TeamCreateInput) {
    return prisma.team.create({
      data,
      include: { settings: true },
    });
  }

  async getTeamByName(name: string) {
    return prisma.team.findUnique({
      where: { name },
      include: { settings: true, queues: true },
    });
  }

  async createTeamSettings(teamId: string, strategy: AssignmentStrategy) {
    return prisma.teamSettings.upsert({
      where: { teamId },
      update: { assignmentStrategy: strategy },
      create: { teamId, assignmentStrategy: strategy },
    });
  }

  async addTeamMember(teamId: string, userId: string, role: TeamRole) {
    return prisma.teamMember.upsert({
      where: {
        teamId_userId: { teamId, userId },
      },
      update: { role },
      create: { teamId, userId, role },
    });
  }

  async getTeamMembers(teamId: string) {
    return prisma.teamMember.findMany({
      where: { teamId },
      include: { user: true },
    });
  }

  async createQueue(teamId: string, name: string) {
    return prisma.queue.upsert({
      where: {
        teamId_name: { teamId, name },
      },
      update: {},
      create: { teamId, name },
    });
  }
}

export default new TeamRepository();