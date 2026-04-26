import { hash } from "bcrypt";

import { PrismaClient, UserRole, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function seedPasswordHash(password: string): Promise<string> {
  const saltRounds = 10;
  return await hash(password, saltRounds);
}
const users = [
  {
    email: "admin@hheducation.local",
    fullName: "System Admin",
    role: UserRole.admin,
    status: UserStatus.active,
  },
  {
    email: "teacher@hheducation.local",
    fullName: "Demo Teacher",
    role: UserRole.teacher,
    status: UserStatus.active,
  },
  {
    email: "student.active@hheducation.local",
    fullName: "Active Student",
    role: UserRole.student,
    status: UserStatus.active,
  },
  {
    email: "student.pending@hheducation.local",
    fullName: "Pending Verification Student",
    role: UserRole.student,
    status: UserStatus.pending_verification,
  },
  {
    email: "student.banned@hheducation.local",
    fullName: "Banned Student",
    role: UserRole.student,
    status: UserStatus.banned,
  },
];

async function main() {
  const passwordHash = await seedPasswordHash("Password123!");
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        passwordHash,
      },
      create: {
        ...user,
        passwordHash,
      },
    });
  }

  console.log(`Seeded ${users.length} users.`);
  console.log("Demo password for all seeded users: Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
