import { FolderPlus, Layers, PanelLeft, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-3 md:gap-4 md:px-4">
      <div className="flex flex-1 items-center gap-2 md:gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
            <Layers className="size-4 text-white" />
          </div>
          <span className="hidden text-lg font-semibold sm:inline">DevStash</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
        >
          <PanelLeft className="size-4" />
        </Button>

        <div className="relative hidden w-full max-w-xl md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="Search items..." className="pl-9 pr-12" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        <Button variant="ghost" size="icon" className="ml-auto shrink-0 md:hidden" aria-label="Search">
          <Search className="size-4" />
        </Button>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="icon" className="md:hidden" aria-label="New collection">
          <FolderPlus className="size-4" />
        </Button>
        <Button variant="outline" className="hidden md:inline-flex">
          <FolderPlus className="size-4" />
          New Collection
        </Button>

        <Button size="icon" className="md:hidden" aria-label="New item">
          <Plus className="size-4" />
        </Button>
        <Button className="hidden md:inline-flex">
          <Plus className="size-4" />
          New Item
        </Button>
      </div>
    </header>
  );
}
