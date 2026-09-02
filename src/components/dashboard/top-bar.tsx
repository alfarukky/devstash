import { FolderPlus, Layers, PanelLeft, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopBar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border px-4">
      <div className="flex flex-1 items-center gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
            <Layers className="size-4 text-white" />
          </div>
          <span className="text-lg font-semibold">DevStash</span>
        </div>

        <Button variant="ghost" size="icon" className="shrink-0" aria-label="Toggle sidebar">
          <PanelLeft className="size-4" />
        </Button>

        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="Search items..." className="pl-9 pr-12" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline">
          <FolderPlus className="size-4" />
          New Collection
        </Button>
        <Button>
          <Plus className="size-4" />
          New Item
        </Button>
      </div>
    </header>
  );
}
