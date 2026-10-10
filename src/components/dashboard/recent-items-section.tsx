import { Clock } from "lucide-react";

import { ItemRow } from "@/components/dashboard/item-row";
import { getRecentItems } from "@/lib/db/items";

const RECENT_ITEMS_LIMIT = 10;

interface RecentItemsSectionProps {
  userId: string;
}

export async function RecentItemsSection({ userId }: RecentItemsSectionProps) {
  const recentItems = await getRecentItems(userId, RECENT_ITEMS_LIMIT);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Recent Items</h2>
      </div>
      {recentItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {recentItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
