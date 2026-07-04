import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Roles
  const roles = [
    { code: 'ADMIN', name: 'Administrator', description: 'Full system access' },
    { code: 'MANAGER', name: 'Manager', description: 'Department management access' },
    { code: 'ENGINEER', name: 'Engineer', description: 'Ticket resolution access' },
    { code: 'CUSTOMER', name: 'Customer', description: 'Standard user access' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
  }
  console.log('✅ Roles seeded');

  // 2. Seed Initial Admin User
  const adminRole = await prisma.role.findUnique({ where: { code: 'ADMIN' } });

  if (adminRole) {
    const adminEmail = 'admin@enjay.com';
    const passwordHash = await bcrypt.hash('Admin@123', 12);

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        passwordHash,
        fullName: 'System Administrator',
        roleId: adminRole.id,
        isEmailVerified: true,
      },
    });
    console.log('✅ Initial Admin user seeded (admin@enjay.com / Admin@123)');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });