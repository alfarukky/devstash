"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { signInWithCredentials } from "@/actions/auth";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionResult } from "@/types/auth";

interface SignInFormProps {
  callbackUrl?: string;
}

const INITIAL_STATE: AuthActionResult = { success: false };

export function SignInForm({ callbackUrl }: SignInFormProps) {
  const [state, formAction, pending] = useActionState(signInWithCredentials, INITIAL_STATE);
  // Controlled so the email survives React's form reset after a failed attempt.
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      {/* Outside the sign-in form, since forms can't be nested. */}
      {state.unverified && <ResendVerificationForm email={email} />}
    </div>
  );
}
