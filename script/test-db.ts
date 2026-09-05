import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const userCount = await prisma.user.count();
  console.log(`Connected to the database. User count: ${userCount}`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Database connection test failed:", error);
  process.exit(1);
});
