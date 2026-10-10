"use client";

import { useActionState, useState } from "react";

import { deleteAccount } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionResult } from "@/types/auth";

interface DeleteAccountDialogProps {
  email: string;
}

const INITIAL_STATE: AuthActionResult = { success: false };

export function DeleteAccountDialog({ email }: DeleteAccountDialogProps) {
  const [state, formAction, pending] = useActionState(deleteAccount, INITIAL_STATE);
  const [confirmEmail, setConfirmEmail] = useState("");
  const matches = confirmEmail.trim().toLowerCase() === email.toLowerCase();

  return (
    <Dialog onOpenChange={(open) => !open && setConfirmEmail("")}>
      <DialogTrigger render={<Button variant="destructive" />}>Delete account</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This permanently deletes your account and all of your items, collections and tags. This
            can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmEmail">
              Type <span className="font-semibold">{email}</span> to confirm
            </Label>
            <Input
              id="confirmEmail"
              name="confirmEmail"
              type="email"
              autoComplete="off"
              value={confirmEmail}
              onChange={(event) => setConfirmEmail(event.target.value)}
            />
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" variant="destructive" disabled={!matches || pending}>
              {pending ? "Deleting…" : "Delete account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
