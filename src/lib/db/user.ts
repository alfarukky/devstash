import { cache } from "react";

import { prisma } from "@/lib/prisma";

// TODO: auth is wired up, but the dashboard and sidebar queries still read this seeded
// demo user; switch them to the session user's id (as src/lib/db/profile.ts does).
const DEMO_USER_EMAIL = "demo@devstash.io";

export const getDemoUser = cache(function getDemoUser() {
  return prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true, name: true, email: true },
  });
});
