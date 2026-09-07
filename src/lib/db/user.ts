import { prisma } from "@/lib/prisma";

// TODO: replace with the authenticated user's id once auth is wired up.
const DEMO_USER_EMAIL = "demo@devstash.io";

export function getDemoUser() {
  return prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
}
