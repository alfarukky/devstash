import { File, Pin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { itemTypes, type Item } from "@/lib/mock-data";
import { TYPE_BORDER_COLORS, TYPE_ICON_BG_COLORS, TYPE_ICON_COLORS, TYPE_ICONS } from "@/lib/type-icons";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ItemRowProps {
  item: Item;
}

export function ItemRow({ item }: ItemRowProps) {
  const type = itemTypes.find((t) => t.id === item.typeId);
  const Icon = type ? TYPE_ICONS[type.icon] ?? File : File;
  const borderColor = TYPE_BORDER_COLORS[type?.color ?? ""] ?? "border-l-border";
  const iconBg = TYPE_ICON_BG_COLORS[type?.color ?? ""] ?? "bg-muted";
  const iconColor = TYPE_ICON_COLORS[type?.color ?? ""] ?? "text-muted-foreground";

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border-l-4 bg-card p-4 text-card-foreground ring-1 ring-foreground/10",
        borderColor
      )}
    >
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", iconBg)}>
        <Icon className={cn("size-5", iconColor)} />
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
