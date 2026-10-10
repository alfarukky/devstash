# Auth Security Review

**Last audit:** 2026-10-10
**Scope:** `src/auth.ts`, `src/auth.config.ts`, `src/proxy.ts`, `src/app/api/auth/register/route.ts`, `src/actions/{auth,password-reset,profile}.ts`, `src/lib/{tokens,verification,password-reset,email,app-url,auth-schemas}.ts`, `src/lib/db/profile.ts`, `src/app/profile/page.tsx`, `src/app/(auth)/{reset-password,verify-email}/page.tsx`, `src/components/profile/delete-account-dialog.tsx`, `prisma/schema.prisma`, `prisma/seed.ts`, `.gitignore`

## Summary
The auth code is in good shape. Tokens, hashing, single-use consumption, flow separation and session checks all hold up. I found 3 real issues: 0 Critical, 0 High, 2 Medium, 1 Low. Both Mediums concern abuse and enumeration around email-sending actions, which have only a per-account cooldown. The Low is a timing difference at sign-in. The remaining gaps (no sign-in or register rate limiting, among others) are already recorded in `context/current-feature.md` and are listed under Known Limitations.

## Findings

### Medium

#### Forgot-password and resend-verification reveal that an account exists when email sending fails
- **Location:** `src/actions/password-reset.ts:24-29`, `src/actions/auth.ts:68-79`, `src/lib/password-reset.ts:19-20`
- **Issue:** Both actions claim to "always report success", but the error path only fires for real accounts.
  ```ts
  // password-reset.ts
  try { await issuePasswordResetEmail(parsed.data); }
  catch (error) { ...; return { success: false, error: "Couldn't send the email. Please try again." }; }
  ```
  `issuePasswordResetEmail` returns early with no work if `!user?.password` (`password-reset.ts:20`). So an unknown email returns `success: true`, while a registered email whose send throws returns `success: false`. `resendVerificationEmail` does the same (`auth.ts:73-78`). Separately, an existing account makes a Resend round trip that takes hundreds of ms, while an unknown email returns after one DB lookup, so the response time also differs.
- **Impact:** An attacker submits candidate emails to `/forgot-password` and tells registered accounts from unregistered ones by the error message. This is deterministic in the current setup. `context/current-feature.md` notes that with `onboarding@resend.dev`, every recipient except the Resend owner fails with a logged error, so every registered email gets "Couldn't send". It also happens during any Resend outage. The timing difference leaks the same fact even when sends succeed.
- **Fix:** Return the same result for every outcome and log send failures server-side. For example, in both actions, `catch` the error, `console.error` it, then fall through to `return { success: true }`. Optionally send the email without awaiting it (`after()` from `next/server`) so timing doesn't differ either.

#### No IP-level limit on email-sending actions, so inboxes can be flooded and the Resend quota burned
- **Location:** `src/lib/tokens.ts:21-30` (only per-identifier cooldown), `src/actions/password-reset.ts:15`, `src/actions/auth.ts:59`, `src/app/api/auth/register/route.ts:45`
- **Issue:** The only throttle is a 60s cooldown per identifier in `issueToken`:
  ```ts
  if (latest && latest.expires.getTime() - ttlMs > Date.now() - RESEND_COOLDOWN_MS) return null;
  ```
  Verification and reset use different identifiers (`PASSWORD_RESET_PREFIX`), so each has its own cooldown. Nothing limits requests per IP or in total. `/api/auth/register` has no throttle and calls `issueVerificationEmail` for any address.
- **Impact:** (1) Anyone who knows a victim's address can script `requestPasswordReset` every 60s and, if the victim is unverified, `resendVerificationEmail` too. That is up to about 120 emails per hour to the victim for as long as the attacker keeps going. (2) An attacker can script `/api/auth/register` with throwaway addresses to burn the Resend daily and monthly quota. Once the quota is gone, legitimate verification and reset emails fail for everyone. Register-specific rate limiting is already a recorded follow-up. The forgot-password and resend paths and the quota angle are not.
- **Fix:** Add an IP-based limiter (for example Upstash Ratelimit or an equivalent Redis/DB counter) in front of `requestPasswordReset`, `resendVerificationEmail` and register, keyed on `x-forwarded-for`. Add a global daily cap on outgoing emails.

### Low

#### Sign-in skips bcrypt for unknown or password-less emails, leaking account existence by timing
- **Location:** `src/auth.ts:42-45`
- **Issue:**
  ```ts
  if (!user?.password) return null;
  const valid = await bcrypt.compare(parsed.data.password, user.password);
  ```
  A nonexistent or GitHub-only email returns right after the DB lookup. An email with a password goes through a cost-12 bcrypt compare (about 200-300ms).
- **Impact:** An attacker measures response time on `/sign-in` to learn which emails have password accounts, defeating the generic "Invalid email or password" message. This is moderate to hard to exploit over a high-latency network, so it is rated Low.
- **Fix:** Compare against a fixed dummy hash when no user is found, for example `await bcrypt.compare(password, user?.password ?? DUMMY_HASH)`, where `DUMMY_HASH` is a precomputed cost-12 hash. Return `null` afterwards.

## Passed Checks
- **Hashing:** bcryptjs with cost 12 on every write path: register (`src/app/api/auth/register/route.ts:39`), reset (`src/lib/password-reset.ts:42`), change password (`src/actions/profile.ts:40`) and seed (`prisma/seed.ts:28`). There is no plaintext or weak hashing.
- **Password comparison:** `bcrypt.compare` is used in `src/auth.ts:44` and `src/actions/profile.ts:35`.
- **Hash exposure:** `getProfile` strips the hash and returns only `hasPassword` (`src/lib/db/profile.ts:44-48`). The register response selects `id`, `name` and `email` only (`register/route.ts:40`). I found no logging of passwords or tokens (grep).
- **Password rules:** Zod enforces 8-72 characters on register, reset and change (`src/lib/auth-schemas.ts:5`).
- **Change password:** Needs the session, then the current password, and acts only on `session.user.id` (`src/actions/profile.ts:15-40`). Accounts without a password are rejected (`:33`).
- **Token generation and storage:** `randomBytes(32)` gives 256 bits from a CSPRNG, and only the SHA-256 hash is stored (`src/lib/tokens.ts:15,31-35`).
- **Token lookup:** Lookup is by hash via a unique index (`tokens.ts:47-49`).
- **Expiry:** Reset tokens expire in 1h (`src/lib/password-reset.ts:8`) and verification tokens in 24h (`src/lib/verification.ts:6`). Expiry is checked on use and expired rows are deleted (`tokens.ts:52-54`).
- **Replacement:** Issuing a token deletes older ones for the identifier in the same transaction as the create (`tokens.ts:32-37`).
- **Single use:** `deleteMany` runs first and its count is checked, inside a transaction. Reset: `password-reset.ts:45-49`. Verify: `verification.ts:33-40`. Concurrent requests cannot both succeed.
- **Flow separation:** Reset identifiers carry the `password-reset:` prefix, and each flow validates it (`password-reset.ts:12-14`, `verification.ts:10-12`, `tokens.ts:50`). Because the bare-email identifier and the prefixed one differ, neither flow can replace or delete the other's tokens (`tokens.ts:33`). A valid email cannot contain `:`, so it cannot collide with the prefix.
- **Verification gate:** Unverified users are blocked after the password check (`src/auth.ts:46`). GitHub sign-in never goes through `authorize`.
- **Reset eligibility:** Only accounts with a password get a reset email (`password-reset.ts:19-20`). The email comes from the token record, not from user input (`:41,51`). A successful reset also verifies the email (`:53-56`).
- **Link origin:** Email links are built from `APP_URL`/`AUTH_URL`/Vercel env vars (`src/lib/app-url.ts:3-18`), never the `Host` header. The code throws in production if none is set.
- **Server-side session checks:** `changePassword` and `deleteAccount` call `auth()` and use only `session.user.id` (`profile.ts:15,54-57`). `ProfilePage` also checks the session itself and does not rely on the proxy alone (`src/app/profile/page.tsx:17-18`).
- **Input validation:** Zod validates all inputs before use.
- **Delete account:** Cascades cover accounts and sessions. Tokens without an FK are removed by both identifiers in the same transaction (`profile.ts:70-75`). `signOut` clears the JWT (`:82`).
- **JWT outliving the user row:** `ProfilePage` redirects when the profile is null (`src/app/profile/page.tsx:27-28`). `changePassword` and `deleteAccount` return safe errors (`profile.ts:33,60`).
- **Open redirect:** `safeRedirect` allows only a single leading `/` and rejects `//` (`src/actions/auth.ts:14-19`). The proxy builds a relative `callbackUrl` (`src/proxy.ts:11`).
- **Account linking:** `allowDangerousEmailAccountLinking` is not set (grep), so GitHub cannot take over a credentials account.
- **Error handling and secrets:** Server actions return generic errors and log details server-side. Secrets come from env vars, and `.env*` is in `.gitignore:34`.

## Known Limitations
- No rate limiting on sign-in or register, so online password guessing is unthrottled (`context/current-feature.md`, Auth Phase 2 history).
- An unverified registration can squat an email and block that owner's GitHub sign-in with `OAuthAccountNotLinked` (Auth Phase 2 and email verification follow-ups).
- GitHub-created users keep their email's original case, so a mixed-case email could get a second lowercase credentials account (Auth Phase 2).
- The 72 limit counts characters, not bytes. bcrypt ignores bytes past 72, so a non-ASCII password under 72 characters can exceed that limit (Auth Phase 2).
- `/verify-email` consumes the token on GET, so link scanners can use up a link (email verification follow-ups).
- JWT sessions on other devices are not revoked on password reset or change (Forgot Password notes).
- `APP_URL` must be set in production, and no Resend sending domain is verified yet (email verification follow-ups).
- The dashboard and the profile sidebar still read the seeded demo user's data through `getDemoUser()`. Nothing in the profile page's own data is affected (Auth Phase 1-3 follow-ups).
- GitHub OAuth tokens are stored unencrypted in `Account` (Auth Phase 1).
