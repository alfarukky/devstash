import { Folder, Heart, Package, Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { collections, items } from "@/lib/mock-data";

export function DashboardStats() {
  const stats = [
    { label: "Items", value: items.length, icon: Package },
    { label: "Collections", value: collections.length, icon: Folder },
    {
      label: "Favorite Items",
      value: items.filter((item) => item.isFavorite).length,
      icon: Star,
    },
    {
      label: "Favorite Collections",
      value: collections.filter((collection) => collection.isFavorite).length,
      icon: Heart,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl leading-none font-semibold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
