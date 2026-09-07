import { MoreHorizontal, Star } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CollectionWithStats } from "@/lib/db/collections";
import { getDbTypeIcon } from "@/lib/type-icons";

interface CollectionCardProps {
  collection: CollectionWithStats;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const primaryColor = collection.types[0]?.color ?? "var(--border)";

  return (
    <Card className="border-l-4" style={{ borderLeftColor: primaryColor }}>
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
          {collection.types.map((type) => {
            const Icon = getDbTypeIcon(type.icon);
            return <Icon key={type.id} className="size-4" style={{ color: type.color ?? undefined }} />;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
