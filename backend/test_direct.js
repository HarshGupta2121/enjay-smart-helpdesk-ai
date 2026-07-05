const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const id = '4ce5a9cb-82f2-4e5b-98b8-c3bccb256497'; // customer2
  
  await prisma.$transaction(async (tx) => {
      await tx.ticket.updateMany({
        where: { assigneeId: id },
        data: { assigneeId: null }
      });
      await tx.ticketComment.deleteMany({
        where: { authorId: id }
      });
      await tx.ticketActivity.deleteMany({
        where: { actorId: id }
      });
      await tx.attachment.deleteMany({
        where: { uploadedById: id }
      });
      await tx.ticket.deleteMany({
        where: { requesterId: id }
      });
      return tx.user.delete({
        where: { id }
      });
  });

  const check = await prisma.user.findUnique({ where: { id } });
  console.log(check ? "FAILED" : "SUCCESS");
}
test().finally(() => prisma.$disconnect());
