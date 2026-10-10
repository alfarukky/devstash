"use client";

import { useActionState, useState } from "react";

import { requestPasswordReset } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionResult } from "@/types/auth";

const INITIAL_STATE: AuthActionResult = { success: false };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, INITIAL_STATE);
  // Controlled so the email survives React's form reset after a failed attempt.
  const [email, setEmail] = useState("");

  if (state.success) {
    return (
      <p className="rounded-lg bg-muted px-3 py-2 text-sm">
        If an account exists for that email, we&apos;ve sent a link to reset your password. Check
        your inbox.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
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
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
