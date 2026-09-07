import { CollectionsSection } from "@/components/dashboard/collections-section";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PinnedItemsSection } from "@/components/dashboard/pinned-items-section";
import { RecentItemsSection } from "@/components/dashboard/recent-items-section";
import { getFavoriteCollections, getRecentNonFavoriteCollections } from "@/lib/db/collections";
import { getItemTypesWithCounts } from "@/lib/db/items";

export default async function DashboardPage() {
  const [sidebarItemTypes, sidebarFavoriteCollections, sidebarRecentCollections] =
    await Promise.all([
      getItemTypesWithCounts(),
      getFavoriteCollections(),
      getRecentNonFavoriteCollections(),
    ]);

  return (
    <DashboardShell
      sidebarItemTypes={sidebarItemTypes}
      sidebarFavoriteCollections={sidebarFavoriteCollections}
      sidebarRecentCollections={sidebarRecentCollections}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your developer knowledge hub</p>
        </div>
        <DashboardStats />
        <CollectionsSection />
        <PinnedItemsSection />
        <RecentItemsSection />
      </div>
    </DashboardShell>
  );
}
