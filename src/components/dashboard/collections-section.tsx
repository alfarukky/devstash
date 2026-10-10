import Link from "next/link";

import { CollectionCard } from "@/components/dashboard/collection-card";
import { getRecentCollections } from "@/lib/db/collections";

interface CollectionsSectionProps {
  userId: string;
}

export async function CollectionsSection({ userId }: CollectionsSectionProps) {
  const collections = await getRecentCollections(userId, 6);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Collections</h2>
        <Link href="/collections" className="text-sm text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </div>
      {collections.length === 0 ? (
        <p className="text-sm text-muted-foreground">No collections yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </section>
  );
}
