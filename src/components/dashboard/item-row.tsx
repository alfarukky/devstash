import { Pin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ItemWithRelations } from "@/lib/db/items";
import { getDbTypeIcon } from "@/lib/type-icons";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function renderItemTypeIcon(iconName: string | null, color: string | undefined) {
  const Icon = getDbTypeIcon(iconName);
  return <Icon className="size-5" style={{ color }} />;
}

interface ItemRowProps {
  item: ItemWithRelations;
}

export function ItemRow({ item }: ItemRowProps) {
  const color = item.type.color ?? undefined;

  return (
    <div
      className="flex items-center gap-4 rounded-xl border-l-4 bg-card p-4 text-card-foreground ring-1 ring-foreground/10"
      style={{ borderLeftColor: color }}
    >
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: color ? `color-mix(in oklch, ${color} 10%, transparent)` : undefined }}
      >
        {renderItemTypeIcon(item.type.icon, color)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{item.title}</p>
          {item.isPinned && <Pin className="size-3.5 shrink-0 text-muted-foreground" />}
          {item.isFavorite && (
            <Star className="size-3.5 shrink-0 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        <p className="truncate text-sm text-muted-foreground">{item.description}</p>
        {item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <span className="shrink-0 self-start text-xs text-muted-foreground">
        {formatDate(item.createdAt)}
      </span>
    </div>
  );
}
