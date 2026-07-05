const fs = require('fs');
const file = 'backend/src/repositories/user.repository.ts';
let code = fs.readFileSync(file, 'utf8');

const oldDelete = `  async deleteUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }`;

const newDelete = `  async deleteUser(id: string) {
    return prisma.$transaction(async (tx) => {
      // Unassign from tickets
      await tx.ticket.updateMany({
        where: { assigneeId: id },
        data: { assigneeId: null }
      });
      
      // Delete user's comments on other tickets
      await tx.ticketComment.deleteMany({
        where: { authorId: id }
      });

      // Delete user's activities on other tickets
      await tx.ticketActivity.deleteMany({
        where: { actorId: id }
      });

      // Delete user's attachments on other tickets
      await tx.attachment.deleteMany({
        where: { uploadedById: id }
      });

      // Delete tickets requested by the user
      await tx.ticket.deleteMany({
        where: { requesterId: id }
      });

      // Finally, delete the user
      return tx.user.delete({
        where: { id }
      });
    });
  }`;

code = code.replace(oldDelete, newDelete);
fs.writeFileSync(file, code);
console.log('Patched deleteUser');
