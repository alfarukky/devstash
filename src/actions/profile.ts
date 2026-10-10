"use server";

import bcrypt from "bcryptjs";

import { auth, signOut } from "@/auth";
import { changePasswordSchema, emailSchema } from "@/lib/auth-schemas";
import { prisma } from "@/lib/prisma";
import { PASSWORD_RESET_PREFIX } from "@/lib/tokens";
import type { AuthActionResult } from "@/types/auth";

export async function changePassword(
  _prevState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You need to sign in again." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });
    // GitHub-only accounts have no password to change.
    if (!user?.password) return { success: false, error: "This account doesn't use a password." };

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!valid) return { success: false, error: "Current password is incorrect" };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: await bcrypt.hash(parsed.data.password, 12) },
    });
  } catch (error) {
    console.error("Changing password failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true, message: "Password updated." };
}

export async function deleteAccount(
  _prevState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You need to sign in again." };

  const userId = session.user.id;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) return { success: false, error: "Account not found." };

    // Typing the email guards against deleting by accident; it isn't an auth check.
    const confirmation = emailSchema.safeParse(formData.get("confirmEmail"));
    if (!confirmation.success || confirmation.data !== user.email.toLowerCase()) {
      return { success: false, error: "Type your email exactly to confirm." };
    }

    // Items, collections, tags, custom types, accounts and sessions cascade from User.
    // VerificationToken has no relation to User, so its rows are removed by identifier.
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({
        where: { identifier: { in: [user.email, `${PASSWORD_RESET_PREFIX}${user.email}`] } },
      }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
  } catch (error) {
    console.error("Deleting account failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  // Clears the JWT cookie so it can't keep pointing at the deleted user.
  await signOut({ redirectTo: "/sign-in?deleted=1" });
  return { success: true };
}
