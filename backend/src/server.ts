import app from './app';
import prisma from './config/prisma';

const PORT = process.env.PORT || 4000;

async function bootstrapDatabase() {
  try {
    console.log('Running production database bootstrap checks...');

    // 1. Ensure Teams exist
    let supportTeam = await prisma.team.findUnique({ where: { name: 'Level 1 Support' } });
    if (!supportTeam) {
      supportTeam = await prisma.team.create({
        data: { name: 'Level 1 Support', description: 'General support inquiries' }
      });
    }

    let itTeam = await prisma.team.findUnique({ where: { name: 'IT Infrastructure' } });
    if (!itTeam) {
      itTeam = await prisma.team.create({
        data: { name: 'IT Infrastructure', description: 'Internal IT requests' }
      });
    }

    // 2. Ensure Users are mapped to teams
    const manager = await prisma.user.findFirst({ where: { email: 'manager@enjay.com' } });
    const eng1 = await prisma.user.findFirst({ where: { email: 'engineer1@enjay.com' } });
    const eng2 = await prisma.user.findFirst({ where: { email: 'engineer2@enjay.com' } });

    if (manager) {
      const managerTeams = await prisma.teamMember.count({ where: { userId: manager.id } });
      if (managerTeams === 0) {
        await prisma.teamMember.createMany({
          data: [
            { teamId: supportTeam.id, userId: manager.id, role: 'MANAGER' },
            { teamId: itTeam.id, userId: manager.id, role: 'MANAGER' }
          ]
        });
        console.log('Manager successfully mapped to teams.');
      }
    }

    if (eng1) {
      const eng1Teams = await prisma.teamMember.count({ where: { userId: eng1.id } });
      if (eng1Teams === 0) {
        await prisma.teamMember.create({ data: { teamId: supportTeam.id, userId: eng1.id, role: 'ENGINEER' } });
      }
    }

    if (eng2) {
      const eng2Teams = await prisma.teamMember.count({ where: { userId: eng2.id } });
      if (eng2Teams === 0) {
        await prisma.teamMember.create({ data: { teamId: itTeam.id, userId: eng2.id, role: 'ENGINEER' } });
      }
    }

    // 3. Update existing tickets to belong to teams so Manager can see them
    const tickets = await prisma.ticket.findMany({ where: { teamId: null } });
    if (tickets.length > 0) {
      const supportTicketIds = tickets.filter((_, i) => i % 2 === 0).map(t => t.id);
      const itTicketIds = tickets.filter((_, i) => i % 2 !== 0).map(t => t.id);

      if (supportTicketIds.length > 0) {
        await prisma.ticket.updateMany({
          where: { id: { in: supportTicketIds } },
          data: { teamId: supportTeam.id }
        });
      }
      if (itTicketIds.length > 0) {
        await prisma.ticket.updateMany({
          where: { id: { in: itTicketIds } },
          data: { teamId: itTeam.id }
        });
      }
      console.log(`Updated ${tickets.length} tickets with team assignments.`);
    }

    console.log('Production bootstrap checks completed.');
  } catch (error) {
    console.error('Failed to bootstrap database:', error);
  }
}

bootstrapDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
});
