const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function test() {
  const email = 'admin@enjay.com';
  const password = 'Admin@123';
  
  const user = await prisma.user.findFirst({
    where: { email }
  });
  
  if (!user) {
    console.log("User not found");
    return;
  }
  
  console.log("User found:", user.email, "isActive:", user.isActive, "deletedAt:", user.deletedAt);
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  console.log("Password valid?", isValid);
}

test().catch(console.error).finally(() => prisma.$disconnect());
