import Link from "next/link";

import { GitHubSignInButton } from "@/components/auth/github-sign-in-button";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "An account with this email already exists. Sign in with your email and password instead.",
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const params = await searchParams;
  const callbackUrl = firstParam(params.callbackUrl);
  const error = firstParam(params.error);
  const registered = firstParam(params.registered) === "1";
  const verified = firstParam(params.verified) === "1";
  const reset = firstParam(params.reset) === "1";
  const deleted = firstParam(params.deleted) === "1";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>Welcome back to DevStash</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {registered && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm">
            Account created. Check your email for a verification link, then sign in.
          </p>
        )}
        {verified && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm">
            Email verified. Sign in to continue.
          </p>
        )}
        {reset && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm">
            Password updated. Sign in with your new password.
          </p>
        )}
        {deleted && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm">Your account has been deleted.</p>
        )}
        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {ERROR_MESSAGES[error] ?? "Sign in failed. Please try again."}
          </p>
        )}
        <GitHubSignInButton callbackUrl={callbackUrl} />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <SignInForm callbackUrl={callbackUrl} />
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground underline-offset-4 hover:underline">
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
