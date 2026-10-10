import { getAppUrl } from "@/lib/app-url";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { findToken, issueToken, PASSWORD_RESET_PREFIX } from "@/lib/tokens";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export type VerifyEmailResult = "verified" | "invalid" | "expired";

function isVerificationIdentifier(identifier: string) {
  return !identifier.startsWith(PASSWORD_RESET_PREFIX);
}

// Replaces any outstanding token for the email and sends a fresh link. Returns false
// (without sending) if a token was issued within the cooldown window.
export async function issueVerificationEmail(email: string) {
  // Resolved first so a missing APP_URL fails before a token is stored and the cooldown starts.
  const appUrl = getAppUrl();
  const token = await issueToken(email, TOKEN_TTL_MS);
  if (!token) return false;

  const verifyUrl = new URL("/verify-email", appUrl);
  verifyUrl.searchParams.set("token", token);
  await sendVerificationEmail(email, verifyUrl.toString());
  return true;
}

export async function verifyEmailToken(token: string): Promise<VerifyEmailResult> {
  const lookup = await findToken(token, isVerificationIdentifier);
  if (lookup.status !== "valid") return lookup.status;

  // deleteMany so a concurrent click that already consumed the token doesn't throw.
  const [deleted] = await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { token: lookup.hashedToken } }),
    prisma.user.updateMany({
      where: { email: lookup.identifier, emailVerified: null },
      data: { emailVerified: new Date() },
    }),
  ]);
  return deleted.count > 0 ? "verified" : "invalid";
}
