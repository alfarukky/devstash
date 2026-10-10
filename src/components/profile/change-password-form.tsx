"use client";

import { useActionState } from "react";

import { changePassword } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionResult } from "@/types/auth";

const INITIAL_STATE: AuthActionResult = { success: false };

const FIELDS = [
  { name: "currentPassword", label: "Current password", autoComplete: "current-password" },
  { name: "password", label: "New password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm new password", autoComplete: "new-password" },
];

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, INITIAL_STATE);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4" noValidate>
      {FIELDS.map((field) => (
        <div key={field.name} className="flex flex-col gap-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            name={field.name}
            type="password"
            autoComplete={field.autoComplete}
            required
          />
        </div>
      ))}
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && state.message && (
        <p role="status" className="text-sm text-muted-foreground">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
