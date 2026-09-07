import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/db/user";
import type { Prisma } from "@/generated/prisma/client";

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

async function getCollectionsWithStats(
  where: Prisma.CollectionWhereInput,
  take?: number,
): Promise<CollectionWithStats[]> {
  const user = await getDemoUser();
  if (!user) return [];

  const collections = await prisma.collection.findMany({
    where: { userId: user.id, ...where },
    orderBy: { updatedAt: "desc" },
    take,
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

export function getRecentCollections(limit = 6): Promise<CollectionWithStats[]> {
  return getCollectionsWithStats({}, limit);
}

export function getFavoriteCollections(limit = 10): Promise<CollectionWithStats[]> {
  return getCollectionsWithStats({ isFavorite: true }, limit);
}

export function getRecentNonFavoriteCollections(limit = 10): Promise<CollectionWithStats[]> {
  return getCollectionsWithStats({ isFavorite: false }, limit);
}

export interface CollectionStats {
  total: number;
  favorites: number;
}

export async function getCollectionStats(): Promise<CollectionStats> {
  const user = await getDemoUser();
  if (!user) return { total: 0, favorites: 0 };

  const [total, favorites] = await Promise.all([
    prisma.collection.count({ where: { userId: user.id } }),
    prisma.collection.count({ where: { userId: user.id, isFavorite: true } }),
  ]);

  return { total, favorites };
}
