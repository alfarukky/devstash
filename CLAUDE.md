# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and customs types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- `npm run dev` — start the dev server (Turbopack, App Router)
- `npm run build` — production build
- `npm start` — run the production build (loads `.env.production`, which points at the production database)
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)
- `npm run db:generate` — regenerate the Prisma client (also runs on `postinstall`)
- `npm run db:migrate` — create/apply a migration in development (`prisma migrate dev`)
- `npm run db:deploy` — apply pending migrations in production (`prisma migrate deploy`)
- `npm run db:studio` — open Prisma Studio
- `npm run db:seed` — seed the demo user, system item types and sample collections
- `npm run db:test` — check the database connection
- `npm run db:delete-other-users` — delete every user except `demo@devstash.io` and their content (dry run by default; add `-- --confirm` to delete)

No test runner is configured yet.

## Note

Ensure that you never add "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" or any information referencing claudeAI as the author in git commits.
