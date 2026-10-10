import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionsSection } from "@/components/dashboard/collections-section";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PinnedItemsSection } from "@/components/dashboard/pinned-items-section";
import { RecentItemsSection } from "@/components/dashboard/recent-items-section";
import { getFavoriteCollections, getRecentNonFavoriteCollections } from "@/lib/db/collections";
import { getItemTypesWithCounts } from "@/lib/db/items";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;
  const [sidebarItemTypes, sidebarFavoriteCollections, sidebarRecentCollections] =
    await Promise.all([
      getItemTypesWithCounts(userId),
      getFavoriteCollections(userId),
      getRecentNonFavoriteCollections(userId),
    ]);

  const { name, email, image } = session.user;

  return (
    <DashboardShell
      sidebarItemTypes={sidebarItemTypes}
      sidebarFavoriteCollections={sidebarFavoriteCollections}
      sidebarRecentCollections={sidebarRecentCollections}
      sidebarUser={{
        name: name || email || "User",
        email: email ?? "",
        image: image ?? null,
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your developer knowledge hub</p>
        </div>
        <DashboardStats userId={userId} />
        <CollectionsSection userId={userId} />
        <PinnedItemsSection userId={userId} />
        <RecentItemsSection userId={userId} />
      </div>
    </DashboardShell>
  );
}
