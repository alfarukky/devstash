import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import { ProfileInfo } from "@/components/profile/profile-info";
import { ProfileStats } from "@/components/profile/profile-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFavoriteCollections, getRecentNonFavoriteCollections } from "@/lib/db/collections";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getProfile } from "@/lib/db/profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/profile");

  const [profile, sidebarItemTypes, sidebarFavoriteCollections, sidebarRecentCollections] =
    await Promise.all([
      getProfile(session.user.id),
      getItemTypesWithCounts(session.user.id),
      getFavoriteCollections(session.user.id),
      getRecentNonFavoriteCollections(session.user.id),
    ]);
  // The session can outlive the user row (e.g. deleted from another device).
  if (!profile) redirect("/sign-in");

  const name = profile.name || profile.email;

  return (
    <DashboardShell
      sidebarItemTypes={sidebarItemTypes}
      sidebarFavoriteCollections={sidebarFavoriteCollections}
      sidebarRecentCollections={sidebarRecentCollections}
      sidebarUser={{ name, email: profile.email, image: profile.image }}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Your account and usage</p>
        </div>
        <ProfileInfo
          name={name}
          email={profile.email}
          image={profile.image}
          createdAt={profile.createdAt}
          hasPassword={profile.hasPassword}
        />
        <ProfileStats
          totalItems={profile.totalItems}
          totalCollections={profile.totalCollections}
          itemsByType={profile.itemsByType}
        />
        {profile.hasPassword && (
          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>Use at least 8 characters.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        )}
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Delete account</CardTitle>
            <CardDescription>Permanently delete your account and everything in it.</CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccountDialog email={profile.email} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
