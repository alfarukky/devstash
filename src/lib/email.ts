import { randomUUID } from "node:crypto";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";

import { Resend } from "resend";

// Same as src/lib/prisma.ts: api.resend.com also has IPv6 addresses, and on networks without
// IPv6 and ~250ms latency, Node's default 250ms per-address attempt fails every address.
setDefaultAutoSelectFamilyAttemptTimeout(1000);

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM ?? "DevStash <onboarding@resend.dev>";

// A fresh server's first request to Resend can still fail with a network error when the
// DNS lookup is slow, since it counts toward fetch's 10s connect timeout. The lookup is
// cached by the time it fails, so a retry usually succeeds.
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 500;

interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

async function sendEmail(to: string, kind: string, content: EmailContent) {
  // Reused across retries so Resend drops a duplicate if an earlier attempt actually went through.
  const idempotencyKey = `${kind}/${randomUUID()}`;

  for (let attempt = 1; ; attempt++) {
    const { error } = await resend.emails.send(
      { from: EMAIL_FROM, to, ...content },
      { idempotencyKey },
    );
    if (!error) return;

    // Resend reports network failures (no HTTP response) with a null status code;
    // API errors like an invalid recipient won't succeed on retry.
    const isNetworkError = error.statusCode == null;
    if (!isNetworkError || attempt >= MAX_ATTEMPTS) {
      throw new Error(`Failed to send ${kind} email: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
  }
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  await sendEmail(to, "verify-email", {
    subject: "Verify your DevStash email",
    text: `Welcome to DevStash! Verify your email by opening this link:\n\n${verifyUrl}\n\nThe link expires in 24 hours. If you didn't create an account, you can ignore this email.`,
    html: `
      <p>Welcome to DevStash!</p>
      <p>Verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify email</a></p>
      <p>The link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail(to, "password-reset", {
    subject: "Reset your DevStash password",
    text: `Someone asked to reset the password for your DevStash account. Set a new password by opening this link:\n\n${resetUrl}\n\nThe link expires in 1 hour. If you didn't ask for this, you can ignore this email; your password won't change.`,
    html: `
      <p>Someone asked to reset the password for your DevStash account.</p>
      <p><a href="${resetUrl}">Set a new password</a></p>
      <p>The link expires in 1 hour. If you didn't ask for this, you can ignore this email; your password won't change.</p>
    `,
  });
}
