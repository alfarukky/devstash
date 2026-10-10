"use client";

import { useActionState } from "react";

import { resendVerificationEmail } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionResult } from "@/types/auth";

interface ResendVerificationFormProps {
  // When set, the email is sent as a hidden field instead of asking for it.
  email?: string;
}

const INITIAL_STATE: AuthActionResult = { success: false };

export function ResendVerificationForm({ email }: ResendVerificationFormProps) {
  const [state, formAction, pending] = useActionState(resendVerificationEmail, INITIAL_STATE);

  if (state.success) {
    return (
      <p className="rounded-lg bg-muted px-3 py-2 text-sm">
        If that account still needs verifying, a new link is on its way. Check your inbox.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      {email ? (
        <input type="hidden" name="email" value={email} />
      ) : (
        <div className="flex flex-col gap-2">
          <Label htmlFor="resend-email">Email</Label>
          <Input id="resend-email" name="email" type="email" autoComplete="email" required />
        </div>
      )}
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Sending…" : "Resend verification email"}
      </Button>
    </form>
  );
}
