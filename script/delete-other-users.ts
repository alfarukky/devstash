import "dotenv/config";

import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

// Deletes every user except KEEP_EMAIL, along with all of their content. Items,
// collections, tags, custom item types, accounts and sessions are removed through
// the schema's onDelete: Cascade relations. System item types (userId null) are kept.
//
// Dry run by default; pass --confirm to actually delete.
const KEEP_EMAIL = "demo@devstash.io";

// Same workaround as src/lib/prisma.ts: Neon is too far away for Node's default 250ms
// per-address connect attempt on this network.
setDefaultAutoSelectFamilyAttemptTimeout(1000);

async function main() {
  const confirm = process.argv.includes("--confirm");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const keeper = await prisma.user.findUnique({
      where: { email: KEEP_EMAIL },
      select: { id: true },
    });
    if (!keeper) {
      throw new Error(`User ${KEEP_EMAIL} not found; refusing to delete everyone.`);
    }

    // An item's type cascades on delete, so the keeper's items must not use another user's type.
    const crossOwnedItems = await prisma.item.count({
      where: { userId: keeper.id, type: { userId: { not: null, notIn: [keeper.id] } } },
    });
    if (crossOwnedItems > 0) {
      throw new Error(
        `${crossOwnedItems} of ${KEEP_EMAIL}'s items use another user's item type; aborting.`,
      );
    }

    const others = { userId: { not: keeper.id } };
    const users = await prisma.user.findMany({
      where: { id: { not: keeper.id } },
      select: { email: true },
      orderBy: { email: "asc" },
    });
    const [items, collections, tags, itemTypes] = await Promise.all([
      prisma.item.count({ where: others }),
      prisma.collection.count({ where: others }),
      prisma.tag.count({ where: others }),
      prisma.itemType.count({ where: others }),
    ]);

    console.log(`Keeping ${KEEP_EMAIL}. Users to delete (${users.length}):`);
    for (const user of users) console.log(`  - ${user.email}`);
    console.log(
      `Content to delete: ${items} items, ${collections} collections, ${tags} tags, ${itemTypes} custom item types`,
    );

    if (users.length === 0) return;
    if (!confirm) {
      console.log("\nDry run; nothing deleted. Re-run with --confirm to delete.");
      return;
    }

    const [tokens, deleted] = await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { identifier: { not: KEEP_EMAIL } } }),
      prisma.user.deleteMany({ where: { id: { not: keeper.id } } }),
    ]);
    console.log(`\nDeleted ${deleted.count} users and ${tokens.count} verification tokens.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Delete failed:", error);
  process.exit(1);
});
