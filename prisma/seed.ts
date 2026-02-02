import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.user.deleteMany({});

  // Create admin user (password: admin123)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      email: 'admin@occamy.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Create field officer user (password: officer123)
  const officerPassword = await bcrypt.hash('officer123', 10);
  const officer = await prisma.user.create({
    data: {
      username: 'officer1',
      password: officerPassword,
      email: 'officer1@occamy.com',
      name: 'Field Officer One',
      role: 'OFFICER',
    },
  });

  // Create another field officer
  const officer2Password = await bcrypt.hash('officer456', 10);
  const officer2 = await prisma.user.create({
    data: {
      username: 'officer2',
      password: officer2Password,
      email: 'officer2@occamy.com',
      name: 'Field Officer Two',
      role: 'OFFICER',
    },
  });

  console.log('✓ Database seeded successfully!');
  console.log('Admin:', admin);
  console.log('Officer 1:', officer);
  console.log('Officer 2:', officer2);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
