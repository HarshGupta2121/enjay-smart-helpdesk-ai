import app from './app';
import prisma from './config/prisma';

const PORT = process.env.PORT || 4000;

async function bootstrapDatabase() {
  try {
    const teamCount = await prisma.team.count();
    if (teamCount === 0) {
      console.log('No teams found in database. Running production bootstrap...');

      const supportTeam = await prisma.team.create({
        data: { name: 'Level 1 Support', description: 'General support inquiries' }
      });

      const itTeam = await prisma.team.create({
        data: { name: 'IT Infrastructure', description: 'Internal IT requests' }
      });

      const manager = await prisma.user.findFirst({ where: { email: 'manager@enjay.com' } });
      const eng1 = await prisma.user.findFirst({ where: { email: 'engineer1@enjay.com' } });
      const eng2 = await prisma.user.findFirst({ where: { email: 'engineer2@enjay.com' } });

      const teamMembers = [];
      if (manager) {
        teamMembers.push({ teamId: supportTeam.id, userId: manager.id, role: 'MANAGER' });
        teamMembers.push({ teamId: itTeam.id, userId: manager.id, role: 'MANAGER' });
      }
      if (eng1) {
        teamMembers.push({ teamId: supportTeam.id, userId: eng1.id, role: 'ENGINEER' });
      }
      if (eng2) {
        teamMembers.push({ teamId: itTeam.id, userId: eng2.id, role: 'ENGINEER' });
      }

      if (teamMembers.length > 0) {
        await prisma.teamMember.createMany({ data: teamMembers as any });
        console.log('Team members mapped successfully.');
      }

      // Update existing tickets to belong to teams so Manager can see them
      const tickets = await prisma.ticket.findMany({ where: { teamId: null } });
      if (tickets.length > 0) {
        // Just distribute them evenly between the two teams
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
    }
  } catch (error) {
    console.error('Failed to bootstrap database:', error);
  }
}

bootstrapDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
});
