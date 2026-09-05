import { File, MoreHorizontal, Star } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { itemTypes, type Collection } from "@/lib/mock-data";
import { TYPE_BORDER_COLORS, TYPE_ICON_COLORS, TYPE_ICONS } from "@/lib/type-icons";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const firstType = itemTypes.find((type) => type.id === collection.itemTypeIds[0]);
  const borderColor = TYPE_BORDER_COLORS[firstType?.color ?? ""] ?? "border-l-border";

  return (
    <Card className={cn("border-l-4", borderColor)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {collection.name}
          {collection.isFavorite && (
            <Star className="size-4 shrink-0 fill-yellow-500 text-yellow-500" />
          )}
        </CardTitle>
        <CardDescription>{collection.itemCount} items</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="Collection actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{collection.description}</p>
        <div className="flex items-center gap-2">
          {collection.itemTypeIds.map((typeId) => {
            const type = itemTypes.find((t) => t.id === typeId);
            if (!type) return null;
            const Icon = TYPE_ICONS[type.icon] ?? File;
            return (
              <Icon key={typeId} className={cn("size-4", TYPE_ICON_COLORS[type.color])} />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
