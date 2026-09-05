import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations and other CLI commands need a direct (unpooled) connection —
    // Neon's pooled connection string can break long-running migration locks.
    // The running app uses DATABASE_URL (pooled) via the driver adapter instead,
    // see src/lib/prisma.ts.
    url: env("DIRECT_URL"),
  },
});
