import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";

import authConfig from "@/auth.config";
import { signInSchema } from "@/lib/auth-schemas";
import { prisma } from "@/lib/prisma";

// A cost-12 bcrypt hash of a throwaway string (same cost as real hashes, so compares take as long).
const DUMMY_HASH = "$2b$12$0MYoi1PZlUgohVjzcGItZeeSpODfAcfLGnlz34aJZhHu8clP/rbX2";

// Thrown only after the password checks out, so it doesn't reveal which emails exist.
class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            password: true,
            emailVerified: true,
          },
        });
        // Compare against a dummy hash when there's no password to check, so unknown and
        // GitHub-only emails take as long as wrong passwords and timing doesn't reveal them.
        const valid = await bcrypt.compare(parsed.data.password, user?.password ?? DUMMY_HASH);
        if (!user?.password || !valid) return null;
        if (!user.emailVerified) throw new EmailNotVerifiedError();

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
});
