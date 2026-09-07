import { Clock } from "lucide-react";

import { ItemRow } from "@/components/dashboard/item-row";
import { getRecentItems } from "@/lib/db/items";

const RECENT_ITEMS_LIMIT = 10;

export async function RecentItemsSection() {
  const recentItems = await getRecentItems(RECENT_ITEMS_LIMIT);

  if (recentItems.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Recent Items</h2>
      </div>
      <div className="flex flex-col gap-3">
        {recentItems.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
