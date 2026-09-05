# Current Feature

<!-- Feature name and short discription -->

## Status

<!-- Not Started | In Progress | Completed -->

## Goals

<!-- Goals and requirement -->

## Notes

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-08-24 — Initial Next.js + Tailwind setup committed (`chore: initial next.js and tailwind setup`, `2bc99f3`). Removed default Create Next App public SVGs, added `context/` docs, added `origin` remote (`git@github.com:alfarukky/devstash.git`).
- 2026-09-02 — Dashboard UI Phase 1 implemented on `feature/dashboard-phase-1`: shadcn/ui initialized (`4e61bcf`), `/dashboard` route with top bar + sidebar/main placeholders added (`5de082c`), phase specs and status docs committed (`9dd47f8`), and a hydration warning from browser-extension-injected `<html>` attributes fixed (`31aabd7`). Verified with `npm run build`/`lint` and a headless-browser screenshot.
- 2026-09-05 — Dashboard UI Phase 2 implemented on `feature/dashboard-phase-2`: collapsible sidebar with type/collection links, favorites vs. recent collections, user avatar area, and a hamburger-triggered drawer for mobile via `dashboard-shell.tsx` + `sidebar.tsx` (`dd67e26`). Also fixed a `<body>`-level hydration mismatch from browser extensions, made the top bar collapse to icon-only controls below `md` instead of squashing search/buttons together, and added top clearance in the mobile drawer so the sidebar's "Types" toggle isn't obscured by the sheet's close button. Verified with `npm run build`/`lint`.
- 2026-09-05 — Dashboard UI Phase 3 implemented on `feature/dashboard-phase-3`: main area with 4 stats cards, a collections grid with type-colored accents, and pinned/recent item lists (`8f62897`). Added shadcn `card`/`badge` components (fixing a CLI-generated bug importing `cn` from a bogus package instead of `@/lib/utils`), and extracted item-type icon/color mappings out of `sidebar.tsx` into `src/lib/type-icons.ts` for reuse. Verified with `npm run build`/`lint` and headless-browser screenshots (desktop + mobile).
- 2026-09-05 — Prisma + Neon PostgreSQL setup implemented on `feature/prisma-neon-setup`: schema for User/Item/ItemType/Collection/Tag/ItemTag plus NextAuth v5 models (Account, Session, VerificationToken), with indexes and cascade/set-null deletes matched to each relation (`7e940e9`). Pinned to Prisma 7.10.0 explicitly (npm's `latest` tag now resolves to an 8.0 release candidate) and followed the v7 breaking changes: `prisma-client` generator with explicit output path, required driver adapter (`@prisma/adapter-pg`) instead of a bare connection string, datasource url moved out of `schema.prisma` into `prisma.config.ts`, and `"type": "module"` for Prisma's ESM-only CLI. Since v7 dropped `directUrl` from the config, `DATABASE_URL` (pooled) is used by the app's `PrismaClient` adapter at runtime while `DIRECT_URL` (unpooled) is used only by `prisma.config.ts` for the CLI, avoiding migration-lock issues with Neon's connection pooler. Added `script/test-db.ts` (`npm run db:test`) as a manual connectivity check. Verified: `prisma validate`, `prisma generate`, an actual `prisma migrate dev` against the real Neon database, a smoke-test query through the pooled adapter, and `npm run build`/`lint`/`dev`.
