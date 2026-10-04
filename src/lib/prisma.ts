import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

// Node's Happy Eyeballs gives each IPv4/IPv6 attempt only 250ms by default. On networks
// without IPv6 and with >250ms latency to Neon, both attempts fail and pg reports ETIMEDOUT.
setDefaultAutoSelectFamilyAttemptTimeout(1000);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
