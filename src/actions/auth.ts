"use server";

import { after } from "next/server";
import { AuthError, CredentialsSignin } from "next-auth";

import { signIn, signOut } from "@/auth";
import { emailSchema, signInSchema } from "@/lib/auth-schemas";
import { prisma } from "@/lib/prisma";
import { issueVerificationEmail } from "@/lib/verification";
import type { AuthActionResult } from "@/types/auth";

const DEFAULT_REDIRECT = "/dashboard";

// Only allow same-site relative paths, so `callbackUrl` can't send users off-site.
function safeRedirect(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_REDIRECT;
  }
  return value;
}

export async function signInWithCredentials(
  _prevState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: safeRedirect(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof CredentialsSignin && error.code === "email_not_verified") {
      return { success: false, error: "Please verify your email before signing in.", unverified: true };
    }
    if (error instanceof AuthError) {
      return {
        success: false,
        error:
          error.type === "CredentialsSignin"
            ? "Invalid email or password"
            : "Something went wrong. Please try again.",
      };
    }
    // signIn signals a successful sign-in by throwing Next's redirect, which must propagate.
    throw error;
  }

  return { success: true };
}

// Always reports success, and does the lookup and send after responding, so neither the
// result nor the response time reveals whether an account exists or is verified.
export async function resendVerificationEmail(
  _prevState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }

  const email = parsed.data;
  after(async () => {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { password: true, emailVerified: true },
      });
      if (user?.password && !user.emailVerified) {
        await issueVerificationEmail(email);
      }
    } catch (error) {
      console.error("Resending verification email failed:", error);
    }
  });

  return { success: true };
}

export async function signInWithGitHub(formData: FormData) {
  await signIn("github", { redirectTo: safeRedirect(formData.get("callbackUrl")) });
}

export async function signOutUser() {
  await signOut({ redirectTo: "/sign-in" });
}
