import { Pin } from "lucide-react";

import { ItemRow } from "@/components/dashboard/item-row";
import { items } from "@/lib/mock-data";

export function PinnedItemsSection() {
  const pinnedItems = items.filter((item) => item.isPinned);

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
