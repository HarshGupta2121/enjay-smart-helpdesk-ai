const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  // Find a user that has some relations
  const user = await prisma.user.findFirst({
    where: { email: 'manager@enjay.com' },
    include: {
      teamMemberships: true,
      auditLogs: true,
      refreshTokens: true,
    }
  });

  if (!user) {
    console.log("manager not found");
    return;
  }

  console.log("Attempting to delete user:", user.email, user.id);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.ticket.updateMany({
        where: { assigneeId: user.id },
        data: { assigneeId: null }
      });
      await tx.ticketComment.deleteMany({
        where: { authorId: user.id }
      });
      await tx.ticketActivity.deleteMany({
        where: { actorId: user.id }
      });
      await tx.attachment.deleteMany({
        where: { uploadedById: user.id }
      });
      await tx.ticket.deleteMany({
        where: { requesterId: user.id }
      });
      return tx.user.delete({
        where: { id: user.id }
      });
    });
    console.log("SUCCESS");
  } catch (err) {
    console.error("PRISMA ERROR:", err);
  }
}

test().catch(console.error).finally(() => prisma.$disconnect());
