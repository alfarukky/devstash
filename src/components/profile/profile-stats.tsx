import { Folder, Package } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileTypeCount } from "@/lib/db/profile";
import { getDbTypeIcon } from "@/lib/type-icons";

interface ProfileStatsProps {
  totalItems: number;
  totalCollections: number;
  itemsByType: ProfileTypeCount[];
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ProfileStats({ totalItems, totalCollections, itemsByType }: ProfileStatsProps) {
  const totals = [
    { label: "Items", value: totalItems, icon: Package },
    { label: "Collections", value: totalCollections, icon: Folder },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        {totals.map(({ label, value, icon: Icon }) => (
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
      <Card>
        <CardHeader>
          <CardTitle>Items by type</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {itemsByType.map((type) => {
              const Icon = getDbTypeIcon(type.icon);
              return (
                <li key={type.id} className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                  <Icon className="size-4 shrink-0" style={{ color: type.color ?? undefined }} />
                  <span className="flex-1 truncate text-sm">{capitalize(type.name)}s</span>
                  <span className="text-sm font-semibold">{type.count}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
