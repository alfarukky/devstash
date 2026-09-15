"use client";

import Link from "next/link";
import { ChevronDown, Folder, Settings, Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { CollectionWithStats } from "@/lib/db/collections";
import type { ItemTypeWithCount } from "@/lib/db/items";
import { getDbTypeIcon } from "@/lib/type-icons";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const PRO_ONLY_TYPES = new Set(["file", "image"]);

interface SidebarUser {
  name: string;
  email: string;
}

interface SidebarProps {
  itemTypes: ItemTypeWithCount[];
  favoriteCollections: CollectionWithStats[];
  recentCollections: CollectionWithStats[];
  user: SidebarUser;
}

export function Sidebar({ itemTypes, favoriteCollections, recentCollections, user }: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 pt-14 md:pt-4">
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="group flex w-full items-center justify-between px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Types
            <ChevronDown className="size-4 transition-transform group-data-panel-open:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-0.5">
            {itemTypes.map((type) => {
              const Icon = getDbTypeIcon(type.icon);
              return (
                <Link
                  key={type.id}
                  href={`/items/${type.name.toLowerCase()}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4" style={{ color: type.color ?? undefined }} />
                    {capitalize(type.name)}
                    {PRO_ONLY_TYPES.has(type.name) && (
                      <Badge variant="outline" className="text-[10px] font-medium tracking-wide text-muted-foreground">
                        PRO
                      </Badge>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">{type.itemCount}</span>
                </Link>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen className="mt-4">
          <CollapsibleTrigger className="group flex w-full items-center justify-between px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Collections
            <ChevronDown className="size-4 transition-transform group-data-panel-open:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-3">
            {favoriteCollections.length > 0 && (
              <div>
                <p className="px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground">
                  FAVORITES
                </p>
                <div className="flex flex-col gap-0.5">
                  {favoriteCollections.map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/collections/${collection.id}`}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <Folder className="size-4 text-muted-foreground" />
                        {collection.name}
                      </span>
                      <Star className="size-4 fill-yellow-500 text-yellow-500" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {recentCollections.length > 0 && (
              <div>
                <p className="px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground">
                  RECENT
                </p>
                <div className="flex flex-col gap-0.5">
                  {recentCollections.map((collection) => {
                    const primaryColor = collection.types[0]?.color ?? "var(--muted-foreground)";
                    return (
                      <Link
                        key={collection.id}
                        href={`/collections/${collection.id}`}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        <span className="flex items-center gap-2">
                          <Folder className="size-4 text-muted-foreground" />
                          {collection.name}
                        </span>
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: primaryColor }}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <Link
              href="/collections"
              className="px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              View all collections
            </Link>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-sidebar-border p-4">
        <Avatar>
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {user.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="size-4" />
        </Button>
      </div>
    </div>
  );
}
