"use server";

import { redirect } from "next/navigation";

import { emailSchema, resetPasswordSchema } from "@/lib/auth-schemas";
import { issuePasswordResetEmail, resetPassword } from "@/lib/password-reset";
import type { AuthActionResult } from "@/types/auth";

const RESET_FAILURES = {
  invalid: "This reset link is invalid or has already been used. Request a new one.",
  expired: "This reset link has expired. Request a new one.",
};

// Always reports success so the response doesn't reveal whether an account exists.
export async function requestPasswordReset(
  _prevState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }

  try {
    await issuePasswordResetEmail(parsed.data);
  } catch (error) {
    console.error("Password reset email failed:", error);
    return { success: false, error: "Couldn't send the email. Please try again." };
  }

  return { success: true };
}

export async function resetPasswordWithToken(
  _prevState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let result;
  try {
    result = await resetPassword(parsed.data.token, parsed.data.password);
  } catch (error) {
    console.error("Password reset failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  if (result !== "reset") {
    return { success: false, error: RESET_FAILURES[result] };
  }
  redirect("/sign-in?reset=1");
}
