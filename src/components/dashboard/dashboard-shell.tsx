"use client";

import { useState, type ReactNode } from "react";

import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

const DESKTOP_QUERY = "(min-width: 768px)";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  function toggleSidebar() {
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      setDesktopSidebarOpen((open) => !open);
    } else {
      setMobileSidebarOpen(true);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <TopBar onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        {desktopSidebarOpen && (
          <aside className="hidden w-72 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
            <Sidebar />
          </aside>
        )}

        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-0 md:hidden">
            <SheetTitle className="sr-only">Sidebar</SheetTitle>
            <SheetDescription className="sr-only">
              Types and collections navigation
            </SheetDescription>
            <Sidebar />
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
