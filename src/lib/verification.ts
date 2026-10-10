import { createHash, randomBytes } from "node:crypto";

import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export type VerifyEmailResult = "verified" | "invalid" | "expired";

// Only the hash is stored, so a leaked VerificationToken table can't be used to verify accounts.
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// Replaces any outstanding token for the email and sends a fresh link. Returns false
// (without sending) if a token was issued within the cooldown window.
export async function issueVerificationEmail(email: string) {
  const latest = await prisma.verificationToken.findFirst({
    where: { identifier: email },
    orderBy: { expires: "desc" },
    select: { expires: true },
  });
  if (latest && latest.expires.getTime() - TOKEN_TTL_MS > Date.now() - RESEND_COOLDOWN_MS) {
    return false;
  }

  const token = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier: email } }),
    prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashToken(token),
        expires: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ]);

  const verifyUrl = new URL("/verify-email", APP_URL);
  verifyUrl.searchParams.set("token", token);
  await sendVerificationEmail(email, verifyUrl.toString());
  return true;
}

export async function verifyEmailToken(token: string): Promise<VerifyEmailResult> {
  const record = await prisma.verificationToken.findUnique({
    where: { token: hashToken(token) },
  });
  if (!record) return "invalid";

  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { token: record.token } });
    return "expired";
  }

  // deleteMany so a concurrent click that already consumed the token doesn't throw.
  const [deleted] = await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { token: record.token } }),
    prisma.user.updateMany({
      where: { email: record.identifier, emailVerified: null },
      data: { emailVerified: new Date() },
    }),
  ]);
  return deleted.count > 0 ? "verified" : "invalid";
}
