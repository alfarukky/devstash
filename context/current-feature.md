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
