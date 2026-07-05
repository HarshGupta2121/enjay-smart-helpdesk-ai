const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupSoftDeletedUsers() {
  try {
    console.log("Looking for soft-deleted users...");
    // Find all users that have deletedAt set
    const softDeletedUsers = await prisma.user.findMany({
      where: {
        deletedAt: {
          not: null
        }
      }
    });

    console.log(`Found ${softDeletedUsers.length} soft-deleted users.`);

    for (const user of softDeletedUsers) {
      console.log(`Cleaning up user: ${user.email} (${user.id})`);
      // We will execute the hard delete transaction manually here
      // just in case userRepository.deleteUser requires something else.
      await prisma.$transaction(async (tx) => {
        // Unassign from tickets
        await tx.ticket.updateMany({
          where: { assigneeId: user.id },
          data: { assigneeId: null }
        });

        // Delete user's comments
        await tx.ticketComment.deleteMany({
          where: { authorId: user.id }
        });

        // Delete user's activities
        await tx.ticketActivity.deleteMany({
          where: { actorId: user.id }
        });

        // Delete user's attachments
        await tx.attachment.deleteMany({
          where: { uploadedById: user.id }
        });

        // Delete tickets requested by the user
        await tx.ticket.deleteMany({
          where: { requesterId: user.id }
        });

        // Finally, delete the user physically
        await tx.user.delete({
          where: { id: user.id }
        });
      });
      console.log(`Successfully purged user ${user.id}`);
    }
  } catch(e) {
    console.error("Error during cleanup:", e);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupSoftDeletedUsers();