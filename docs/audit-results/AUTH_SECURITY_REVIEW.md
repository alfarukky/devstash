# Auth Security Review

**Last audit:** 2026-10-10
**Scope:** `src/auth.ts`, `src/auth.config.ts`, `src/proxy.ts`, `src/app/api/auth/register/route.ts`, `src/actions/{auth,password-reset,profile}.ts`, `src/lib/{tokens,verification,password-reset,email,app-url,auth-schemas}.ts`, `src/lib/db/profile.ts`, `src/app/profile/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/(auth)/{sign-in,verify-email,reset-password}/page.tsx`, auth form components (redirect handling), `prisma/schema.prisma`, `prisma/seed.ts` (hashing only), `.gitignore`, `.env.example`, plus Auth.js's default `redirect` callback in `node_modules/@auth/core/lib/init.js`.

## Summary
The auth code is in good shape. The two recent fixes (always-success `after()` work in forgot-password and resend-verification, and the dummy-hash compare in credentials `authorize`) hold up on independent review. No Critical, High or Medium findings. One Low finding: the 60s email cooldown is check-then-act and can be bypassed by concurrent requests. The most significant open item is the already-documented lack of rate limiting (see Known Limitations).

## Findings

### Low

#### Email cooldown can be bypassed with concurrent requests
- **Location:** `src/lib/tokens.ts:22-38`
- **Issue:** The cooldown is a read followed by a separate write, with no lock or atomic guard:
  ```ts
  const latest = await prisma.verificationToken.findFirst({ where: { identifier }, ... });
  if (latest && latest.expires.getTime() - ttlMs > Date.now() - RESEND_COOLDOWN_MS) return null;
  const token = randomBytes(32).toString("base64url");
  await prisma.$transaction([ deleteMany(...), create(...) ]);
  ```
  Requests that arrive before the first `create` commits all see "no recent token" and all proceed. Each then sends its own email, since `sendEmail` uses a fresh idempotency key per call (`src/lib/email.ts:28`).
- **Impact:** An attacker fires N parallel `requestPasswordReset` or `resendVerificationEmail` calls for one victim address and gets up to N emails, not 1 per minute. The work runs in `after()` with about 300ms Neon latency, so the race window is wide. This also burns Resend quota. Only the last link in the burst stays valid, so the victim's first email may be dead. It is a bypass of the only throttle that exists, which is why it is listed even though the missing per-IP limit is already a documented follow-up.
- **Fix:** Make the claim atomic. For example, take a Postgres advisory lock inside the transaction (`SELECT pg_advisory_xact_lock(hashtext($1))`) and re-check the cooldown inside it. Or add a rate-limit store (see Known Limitations) with a per-email key using an atomic `SET NX EX 60`.

## Passed Checks

**Verification of the two recent fixes**
- Forgot-password and resend-verification return identical success after Zod validation only. All DB lookups, token issue and sending run inside `after()`, with errors caught and logged (`src/actions/password-reset.ts:26-35`, `src/actions/auth.ts:70-85`). Nothing about account existence, password presence or verified state reaches the response path or its timing. Invalid-format input is the only different response, and it is independent of what is registered.
- Credentials `authorize` always runs `bcrypt.compare`, against `DUMMY_HASH` when the user is missing or has a null password (`src/auth.ts:47`). `DUMMY_HASH` is a well-formed `$2b$12$` hash (7-char prefix + 53 chars), so compares take the same cost-12 time. `EmailNotVerifiedError` is thrown only after a correct password (`src/auth.ts:48-49`), so unknown, GitHub-only and wrong-password cases all return the generic "Invalid email or password" (`src/actions/auth.ts:44-50`).

**Password handling**
- bcryptjs at cost 12 on every write path: register (`src/app/api/auth/register/route.ts:39`), reset (`src/lib/password-reset.ts:42`), change password (`src/actions/profile.ts:40`), seed (`prisma/seed.ts:28`).
- Comparison uses `bcrypt.compare` (`src/auth.ts:47`, `src/actions/profile.ts:35`).
- The hash is selected only server-side. `getProfile` strips it and exposes just `hasPassword` (`src/lib/db/profile.ts:44-48`). `authorize` returns only id, name, email and image (`src/auth.ts:51`). Nothing logs it.
- Length rule is 8-72 chars, shared by register, reset and change (`src/lib/auth-schemas.ts:5`).
- Change password requires the current password (`src/actions/profile.ts:35-36`). Reset requires a valid token (`src/lib/password-reset.ts:38-39`).

**Tokens (verification and reset)**
- 32 bytes from `randomBytes`, base64url (`src/lib/tokens.ts:31`). Only the SHA-256 hash is stored and looked up (`src/lib/tokens.ts:15,48`).
- Expiry is set at issue (1h reset, 24h verify). It is enforced in `findToken`, which also deletes the expired row (`src/lib/tokens.ts:52-55`).
- Issuing a new token deletes older ones for the same identifier in the same transaction (`src/lib/tokens.ts:32-37`).
- Single use is atomic. Verify deletes the token and updates the user in one transaction and checks `deleted.count > 0` (`src/lib/verification.ts:33-40`). Reset runs an interactive transaction that deletes the token first and aborts with "invalid" if the count is 0 (`src/lib/password-reset.ts:45-49`).
- Flow separation holds in both directions. Reset identifiers carry the `password-reset:` prefix. `/verify-email` rejects prefixed rows (`src/lib/verification.ts:10-12`) and reset rejects non-prefixed rows (`src/lib/password-reset.ts:12-14`). `findToken` returns "invalid" without consuming. Each flow's `deleteMany` is scoped to its own identifier.
- Reset is issued only for accounts with a password (`src/lib/password-reset.ts:20`). The update targets the email derived from the token's own identifier, not user input (`src/lib/password-reset.ts:41,51`).
- Links are built from `getAppUrl()` (env or Vercel vars). They never use the `Host` header, and production throws if unset (`src/lib/app-url.ts:3-18`).
- Unverified users cannot sign in with credentials (`src/auth.ts:49`). It is the only credentials path, since the placeholder in `auth.config.ts:15` always returns null.

**Profile and account actions**
- `changePassword` and `deleteAccount` call `auth()` and use only `session.user.id`. No id or email comes from form data (`src/actions/profile.ts:15,54`). The profile page does its own session check in addition to the proxy matcher (`src/app/profile/page.tsx:17-18`, `src/proxy.ts:17`).
- Inputs are Zod-validated (`src/actions/profile.ts:18,63`).
- Delete account removes the verification and `password-reset:` tokens (no FK to User) and the user in one transaction. Items, collections, tags, types, accounts and sessions cascade (`prisma/schema.prisma`). It then calls `signOut` to clear the cookie (`src/actions/profile.ts:70-82`).
- A JWT that outlives its user row: `/profile` redirects to sign-in (`src/app/profile/page.tsx:28`). `changePassword` returns a generic error. The dashboard shows empty data and performs no mutations.
- Action errors are generic to the client and the details go to `console.error`.

**Redirects and secrets**
- `safeRedirect` allows only paths starting with `/` and not `//` (`src/actions/auth.ts:15-20`). Variants like `/\evil.com` are neutralised by Auth.js's default `redirect` callback, which prefixes any `/`-leading URL with `baseUrl` (`node_modules/@auth/core/lib/init.js:13-18`; no custom `redirect` callback overrides it). The proxy's `callbackUrl` is built from the request's own path and query (`src/proxy.ts:11`).
- No hardcoded secrets in `src`/`prisma`/`script`. `.env.example` has empty values. `.env*` is git-ignored (`.gitignore:34-35`).

## Known Limitations
- No rate limiting on sign-in, register, forgot-password, resend-verification or change-password's current-password check, beyond the per-email 60s cooldown. Online password guessing and email-quota burning are therefore unrestricted per IP. This is the largest open risk. Recorded in History: Auth Phase 2, Forgot password, Profile page and "Auth audit quick wins" (deliberately left for later).
- Register reveals a taken email (409), by design. Recorded in History: Auth audit quick wins.
- JWT sessions on other devices stay valid after a password reset or change. Recorded in History: Forgot password, Profile page.
- bcrypt ignores bytes past 72, which a non-ASCII password under 72 characters can exceed. Recorded in History: Auth Phase 2.
- Pre-hijack: someone can register another person's email (unverified) and cause `OAuthAccountNotLinked` for that person's GitHub sign-in. Unverified accounts keep their email until cleaned up. Recorded in History: Auth Phase 2, Email verification.
- GitHub-created users keep their email's original case, so mixed-case emails may be missed by lowercased lookups. Recorded in History: Auth Phase 2.
- The verify page consumes the token on GET, so link scanners can use up a link (the account still ends up verified). Recorded in History: Email verification.
- `APP_URL` must be set in production, and the Resend sending domain is unverified. Recorded in History: Email verification, Forgot password.
