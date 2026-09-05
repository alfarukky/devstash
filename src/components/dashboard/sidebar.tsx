"use client";

import Link from "next/link";
import { ChevronDown, File, Folder, Settings, Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { collections, currentUser, itemTypes, items } from "@/lib/mock-data";
import { TYPE_ICON_COLORS, TYPE_ICONS } from "@/lib/type-icons";

const favoriteCollections = collections.filter((collection) => collection.isFavorite);
const recentCollections = collections.filter((collection) => !collection.isFavorite);

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Sidebar() {
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
              const Icon = TYPE_ICONS[type.icon] ?? File;
              return (
                <Link
                  key={type.id}
                  href={`/items/${type.name.toLowerCase()}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Icon className={`size-4 ${TYPE_ICON_COLORS[type.color] ?? "text-muted-foreground"}`} />
                    {type.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {items.filter((item) => item.typeId === type.id).length}
                  </span>
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
                  {recentCollections.map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/collections/${collection.id}`}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <Folder className="size-4 text-muted-foreground" />
                        {collection.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {collection.itemCount}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-sidebar-border p-4">
        <Avatar>
          <AvatarFallback>{initials(currentUser.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {currentUser.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="size-4" />
        </Button>
      </div>
    </div>
  );
}
