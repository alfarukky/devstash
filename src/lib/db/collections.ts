import { prisma } from "@/lib/prisma";

// TODO: replace with the authenticated user's id once auth is wired up.
const DEMO_USER_EMAIL = "demo@devstash.io";

export interface CollectionType {
  id: string;
  icon: string | null;
  color: string | null;
}

export interface CollectionWithStats {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  /** Types present in the collection, most-used first. */
  types: CollectionType[];
}

export async function getRecentCollections(limit = 6): Promise<CollectionWithStats[]> {
  const user = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
  if (!user) return [];

  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
        select: {
          type: { select: { id: true, icon: true, color: true } },
        },
      },
    },
  });

  return collections.map(({ items, ...collection }) => {
    const typeCounts = new Map<string, { type: CollectionType; count: number }>();
    for (const { type } of items) {
      const entry = typeCounts.get(type.id);
      if (entry) {
        entry.count += 1;
      } else {
        typeCounts.set(type.id, { type, count: 1 });
      }
    }

    const types = [...typeCounts.values()]
      .sort((a, b) => b.count - a.count)
      .map(({ type }) => type);

    return {
      ...collection,
      itemCount: items.length,
      types,
    };
  });
}
