import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkPasswordResetToken } from "@/lib/password-reset";

const FAILURE_MESSAGES = {
  invalid: "This reset link is invalid or has already been used.",
  expired: "This reset link has expired.",
};

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const status =
    typeof token === "string" && token ? await checkPasswordResetToken(token) : "invalid";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Set a new password</CardTitle>
        <CardDescription>
          {status === "valid" ? "Choose a new password for your account" : FAILURE_MESSAGES[status]}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {status === "valid" && typeof token === "string" ? (
          <ResetPasswordForm token={token} />
        ) : (
          <Link
            href="/forgot-password"
            className="text-center text-sm text-foreground underline-offset-4 hover:underline"
          >
            Request a new reset link
          </Link>
        )}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
