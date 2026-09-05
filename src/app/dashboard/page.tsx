import { CollectionsSection } from "@/components/dashboard/collections-section";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PinnedItemsSection } from "@/components/dashboard/pinned-items-section";
import { RecentItemsSection } from "@/components/dashboard/recent-items-section";

export default function DashboardPage() {
  return (
    <DashboardShell>
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
