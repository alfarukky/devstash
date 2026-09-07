import { Pin } from "lucide-react";

import { ItemRow } from "@/components/dashboard/item-row";
import { getPinnedItems } from "@/lib/db/items";

export async function PinnedItemsSection() {
  const pinnedItems = await getPinnedItems();

  if (pinnedItems.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Pin className="size-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Pinned</h2>
      </div>
      <div className="flex flex-col gap-3">
        {pinnedItems.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
