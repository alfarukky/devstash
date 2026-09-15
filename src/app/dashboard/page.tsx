import { CollectionsSection } from "@/components/dashboard/collections-section";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PinnedItemsSection } from "@/components/dashboard/pinned-items-section";
import { RecentItemsSection } from "@/components/dashboard/recent-items-section";
import { getFavoriteCollections, getRecentNonFavoriteCollections } from "@/lib/db/collections";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getDemoUser } from "@/lib/db/user";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [sidebarItemTypes, sidebarFavoriteCollections, sidebarRecentCollections, sidebarUser] =
    await Promise.all([
      getItemTypesWithCounts(),
      getFavoriteCollections(),
      getRecentNonFavoriteCollections(),
      getDemoUser(),
    ]);

  return (
    <DashboardShell
      sidebarItemTypes={sidebarItemTypes}
      sidebarFavoriteCollections={sidebarFavoriteCollections}
      sidebarRecentCollections={sidebarRecentCollections}
      sidebarUser={{
        name: sidebarUser?.name ?? "Guest",
        email: sidebarUser?.email ?? "",
      }}
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
