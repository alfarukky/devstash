import Link from "next/link";
import { redirect } from "next/navigation";

import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyEmailToken } from "@/lib/verification";

const FAILURE_MESSAGES = {
  invalid: "This verification link is invalid or has already been used.",
  expired: "This verification link has expired.",
};

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  const { token } = await searchParams;
  const result = typeof token === "string" && token ? await verifyEmailToken(token) : "invalid";

  if (result === "verified") {
    redirect("/sign-in?verified=1");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Verify your email</CardTitle>
        <CardDescription>{FAILURE_MESSAGES[result]}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Enter your email to get a new link. If you&apos;ve already verified, just sign in.
        </p>
        <ResendVerificationForm />
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
