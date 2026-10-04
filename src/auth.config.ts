import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

export default {
  providers: [GitHub],
  callbacks: {
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
