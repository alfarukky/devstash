import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/db/user";
import type { Prisma } from "@/generated/prisma/client";

const ITEM_SELECT = {
  id: true,
  title: true,
  description: true,
  isFavorite: true,
  isPinned: true,
  createdAt: true,
  type: { select: { id: true, icon: true, color: true } },
  tags: { select: { tag: { select: { name: true } } } },
} satisfies Prisma.ItemSelect;

type RawItem = Prisma.ItemGetPayload<{ select: typeof ITEM_SELECT }>;

export interface ItemType {
  id: string;
  icon: string | null;
  color: string | null;
}

export interface ItemWithRelations {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  type: ItemType;
  tags: string[];
}

function toItemWithRelations({ tags, ...item }: RawItem): ItemWithRelations {
  return { ...item, tags: tags.map(({ tag }) => tag.name) };
}

export async function getPinnedItems(limit = 10): Promise<ItemWithRelations[]> {
  const user = await getDemoUser();
  if (!user) return [];

  const items = await prisma.item.findMany({
    where: { userId: user.id, isPinned: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: ITEM_SELECT,
  });

  return items.map(toItemWithRelations);
}

export async function getRecentItems(limit = 10): Promise<ItemWithRelations[]> {
  const user = await getDemoUser();
  if (!user) return [];

  const items = await prisma.item.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: ITEM_SELECT,
  });

  return items.map(toItemWithRelations);
}

export interface ItemStats {
  total: number;
  favorites: number;
}

export async function getItemStats(): Promise<ItemStats> {
  const user = await getDemoUser();
  if (!user) return { total: 0, favorites: 0 };

  const [total, favorites] = await Promise.all([
    prisma.item.count({ where: { userId: user.id } }),
    prisma.item.count({ where: { userId: user.id, isFavorite: true } }),
  ]);

  return { total, favorites };
}

export interface ItemTypeWithCount {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  itemCount: number;
}

export async function getItemTypesWithCounts(): Promise<ItemTypeWithCount[]> {
  const user = await getDemoUser();
  if (!user) return [];

  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      _count: { select: { items: { where: { userId: user.id } } } },
    },
  });

  return types.map(({ _count, ...type }) => ({ ...type, itemCount: _count.items }));
}
