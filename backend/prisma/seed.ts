import { PrismaClient, TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  // Clean DB in reverse relation order to avoid constraint violations
  await prisma.ticketActivity.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.ticketSequence.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.queue.deleteMany();
  await prisma.teamSettings.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  console.log('Seeding Roles...');
  const roleAdmin = await prisma.role.create({ data: { code: 'ADMIN', name: 'Administrator' } });
  const roleManager = await prisma.role.create({ data: { code: 'MANAGER', name: 'Manager' } });
  const roleEngineer = await prisma.role.create({ data: { code: 'ENGINEER', name: 'Engineer' } });
  const roleCustomer = await prisma.role.create({ data: { code: 'CUSTOMER', name: 'Customer' } });

  console.log('Seeding Users...');
  const defaultPassword = await bcrypt.hash('Admin@123', 10);
  const passCommon = await bcrypt.hash('Password@123', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@enjay.com', passwordHash: defaultPassword, fullName: 'System Admin', roleId: roleAdmin.id, isActive: true, isEmailVerified: true }
  });

  const manager = await prisma.user.create({
    data: { email: 'manager@enjay.com', passwordHash: passCommon, fullName: 'Support Manager', roleId: roleManager.id, isActive: true, isEmailVerified: true }
  });

  const eng1 = await prisma.user.create({
    data: { email: 'engineer1@enjay.com', passwordHash: passCommon, fullName: 'Jane Engineer', roleId: roleEngineer.id, isActive: true, isEmailVerified: true }
  });

  const eng2 = await prisma.user.create({
    data: { email: 'engineer2@enjay.com', passwordHash: passCommon, fullName: 'Bob Engineer', roleId: roleEngineer.id, isActive: true, isEmailVerified: true }
  });

  const cust1 = await prisma.user.create({
    data: { email: 'customer1@enjay.com', passwordHash: passCommon, fullName: 'Alice Customer', roleId: roleCustomer.id, isActive: true, isEmailVerified: true }
  });

  const cust2 = await prisma.user.create({
    data: { email: 'customer2@enjay.com', passwordHash: passCommon, fullName: 'Charlie Customer', roleId: roleCustomer.id, isActive: true, isEmailVerified: true }
  });

  console.log('Seeding Tickets...');
  const ticketsData = [
    { title: 'Cannot access billing portal', desc: 'I am getting a 404 when clicking on billing.', status: TicketStatus.NEW, priority: TicketPriority.HIGH, category: TicketCategory.ACCOUNT, requesterId: cust1.id, aiSummary: 'User experiencing 404 error on billing portal.', aiConfidence: 95, aiSentiment: 'ANGRY' },
    { title: 'Laptop screen flickering', desc: 'My Thinkpad screen keeps flickering after the update.', status: TicketStatus.OPEN, priority: TicketPriority.URGENT, category: TicketCategory.HARDWARE, requesterId: cust2.id, assigneeId: eng1.id, aiSummary: 'Hardware issue: Laptop screen flickering post-update.', aiConfidence: 90, aiSentiment: 'NEUTRAL' },
    { title: 'VPN connection dropping', desc: 'The VPN drops every 10 minutes.', status: TicketStatus.PENDING, priority: TicketPriority.MEDIUM, category: TicketCategory.NETWORK, requesterId: cust1.id, assigneeId: eng2.id, aiSummary: 'Network issue: Intermittent VPN disconnections.', aiConfidence: 88, aiSentiment: 'FRUSTRATED' },
    { title: 'Request for Adobe CC', desc: 'Need Adobe CC for a new project.', status: TicketStatus.RESOLVED, priority: TicketPriority.LOW, category: TicketCategory.SOFTWARE, requesterId: cust2.id, assigneeId: eng1.id, aiSummary: 'Software request for Adobe Creative Cloud.', aiConfidence: 99, aiSentiment: 'HAPPY' },
    { title: 'Emails not syncing on phone', desc: 'My mobile Outlook is not pulling new emails.', status: TicketStatus.CLOSED, priority: TicketPriority.MEDIUM, category: TicketCategory.EMAIL, requesterId: cust1.id, assigneeId: eng2.id, aiSummary: 'Mobile email sync failure on Outlook app.', aiConfidence: 92, aiSentiment: 'NEUTRAL' },
    { title: 'Security badge lost', desc: 'I lost my office security badge on the train.', status: TicketStatus.NEW, priority: TicketPriority.URGENT, category: TicketCategory.SECURITY, requesterId: cust2.id, aiSummary: 'User lost physical office security badge.', aiConfidence: 98, aiSentiment: 'PANICKED' },
    { title: 'External monitor not detected', desc: 'My second screen is black.', status: TicketStatus.OPEN, priority: TicketPriority.LOW, category: TicketCategory.HARDWARE, requesterId: cust1.id, assigneeId: eng1.id, aiSummary: 'External monitor connectivity issue.', aiConfidence: 85, aiSentiment: 'NEUTRAL' },
    { title: 'Need access to GitHub repo', desc: 'Please add me to the frontend-v2 repo.', status: TicketStatus.NEW, priority: TicketPriority.MEDIUM, category: TicketCategory.ACCOUNT, requesterId: cust2.id, aiSummary: 'Access request for GitHub repository.', aiConfidence: 95, aiSentiment: 'HAPPY' },
    { title: 'Server throwing 500s', desc: 'Production API is returning 500 errors on login.', status: TicketStatus.OPEN, priority: TicketPriority.CRITICAL, category: TicketCategory.SOFTWARE, requesterId: cust1.id, assigneeId: manager.id, aiSummary: 'Critical production outage: 500 errors on API login.', aiConfidence: 99, aiSentiment: 'ANGRY' },
    { title: 'How to update password?', desc: 'I forgot where the password reset page is.', status: TicketStatus.RESOLVED, priority: TicketPriority.LOW, category: TicketCategory.ACCOUNT, requesterId: cust2.id, assigneeId: eng2.id, aiSummary: 'General inquiry about password reset process.', aiConfidence: 96, aiSentiment: 'NEUTRAL' },
  ];

  let seq = 1;
  for (const t of ticketsData) {
    const ticketNum = `HD-2026-${String(seq).padStart(6, '0')}`;
    seq++;

    const createdTicket = await prisma.ticket.create({
      data: {
        ticketNumber: ticketNum,
        title: t.title,
        description: t.desc,
        status: t.status,
        priority: t.priority,
        category: t.category,
        requesterId: t.requesterId,
        assigneeId: t.assigneeId,
        aiSummary: t.aiSummary,
        aiConfidence: t.aiConfidence,
        aiSentiment: t.aiSentiment,
        aiPriority: t.priority
      }
    });

    await prisma.ticketActivity.create({
      data: {
        ticketId: createdTicket.id,
        actorId: t.requesterId,
        action: 'TICKET_CREATED',
        current: { status: t.status }
      }
    });

    if (t.status === 'OPEN' || t.status === 'PENDING') {
      await prisma.ticketComment.create({
        data: {
          ticketId: createdTicket.id,
          authorId: t.assigneeId as string,
          content: 'I am looking into this right now. Could you provide a screenshot?',
          isInternal: false
        }
      });

      await prisma.ticketActivity.create({
        data: {
          ticketId: createdTicket.id,
          actorId: t.assigneeId as string,
          action: 'COMMENT_ADDED'
        }
      });
    }
  }

  await prisma.ticketSequence.create({
    data: { id: "TICKET_SEQ", lastValue: 10 }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });