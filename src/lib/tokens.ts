import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

const RESEND_COOLDOWN_MS = 60 * 1000;

export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

// Verification tokens use the bare email as their identifier; password-reset tokens add this
// prefix so the two flows sharing the table can't consume or replace each other's tokens.
export const PASSWORD_RESET_PREFIX = "password-reset:";

export type TokenLookup =
  { status: "valid"; identifier: string; hashedToken: string } | { status: "invalid" | "expired" };

// Only the hash is stored, so a leaked VerificationToken table can't be used to act on accounts.
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// Replaces any outstanding token for the identifier and returns a fresh raw token, or null
// (without issuing one) if a token was issued within the cooldown window.
export async function issueToken(identifier: string, ttlMs: number) {
  const latest = await prisma.verificationToken.findFirst({
    where: { identifier },
    orderBy: { expires: "desc" },
    select: { expires: true },
  });
  if (latest && latest.expires.getTime() - ttlMs > Date.now() - RESEND_COOLDOWN_MS) {
    return null;
  }

  const token = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier } }),
    prisma.verificationToken.create({
      data: { identifier, token: hashToken(token), expires: new Date(Date.now() + ttlMs) },
    }),
  ]);
  return token;
}

// Looks up a raw token without consuming it. `matches` guards against a token issued for
// another purpose (the table is shared), which is reported as invalid. Expired tokens are deleted.
export async function findToken(
  token: string,
  matches: (identifier: string) => boolean,
): Promise<TokenLookup> {
  const record = await prisma.verificationToken.findUnique({
    where: { token: hashToken(token) },
  });
  if (!record || !matches(record.identifier)) return { status: "invalid" };

  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { token: record.token } });
    return { status: "expired" };
  }
  return { status: "valid", identifier: record.identifier, hashedToken: record.token };
}
