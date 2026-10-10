import { prisma } from "@/lib/prisma";

export interface ProfileTypeCount {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  count: number;
}

export interface Profile {
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  hasPassword: boolean;
  totalItems: number;
  totalCollections: number;
  itemsByType: ProfileTypeCount[];
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const [user, totalItems, totalCollections, types] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true, createdAt: true, password: true },
    }),
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        _count: { select: { items: { where: { userId } } } },
      },
    }),
  ]);
  if (!user) return null;

  const { password, ...info } = user;
  return {
    ...info,
    // Only whether a password exists leaves this function, never the hash.
    hasPassword: password !== null,
    totalItems,
    totalCollections,
    itemsByType: types.map(({ _count, ...type }) => ({ ...type, count: _count.items })),
  };
}
