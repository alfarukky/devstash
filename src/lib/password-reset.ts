import bcrypt from "bcryptjs";

import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { APP_URL, findToken, issueToken, PASSWORD_RESET_PREFIX } from "@/lib/tokens";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export type ResetPasswordResult = "reset" | "invalid" | "expired";

function isResetIdentifier(identifier: string) {
  return identifier.startsWith(PASSWORD_RESET_PREFIX);
}

// Sends a reset link if the email belongs to an account with a password. GitHub-only
// accounts are skipped. Callers shouldn't reveal whether anything was sent.
export async function issuePasswordResetEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { password: true } });
  if (!user?.password) return;

  const token = await issueToken(`${PASSWORD_RESET_PREFIX}${email}`, TOKEN_TTL_MS);
  if (!token) return;

  const resetUrl = new URL("/reset-password", APP_URL);
  resetUrl.searchParams.set("token", token);
  await sendPasswordResetEmail(email, resetUrl.toString());
}

// Checks a reset link without consuming it, so the page can show an error before the form.
export async function checkPasswordResetToken(token: string) {
  return (await findToken(token, isResetIdentifier)).status;
}

export async function resetPassword(token: string, password: string): Promise<ResetPasswordResult> {
  const lookup = await findToken(token, isResetIdentifier);
  if (lookup.status !== "valid") return lookup.status;

  const email = lookup.identifier.slice(PASSWORD_RESET_PREFIX.length);
  const passwordHash = await bcrypt.hash(password, 12);

  // Consuming the token first means two concurrent submissions can't both change the password.
  return prisma.$transaction(async (tx) => {
    const deleted = await tx.verificationToken.deleteMany({
      where: { token: lookup.hashedToken },
    });
    if (deleted.count === 0) return "invalid";

    await tx.user.update({ where: { email }, data: { password: passwordHash } });
    // Opening the emailed link proves the user owns the inbox.
    await tx.user.updateMany({
      where: { email, emailVerified: null },
      data: { emailVerified: new Date() },
    });
    return "reset";
  });
}
