# Melles Cleaning Services

Marketing website and owner-administered CRM for a residential and commercial cleaning
business based in Dodoma, Tanzania. One SvelteKit application serves the public site, the
internal CRM and (later) a client portal.

See [`docs/architecture.md`](docs/architecture.md) for the full system design.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | SvelteKit 3 + Svelte 5 (runes) |
| Language | TypeScript (strict) |
| Build | Vite 8, pnpm 10 |
| Styling | Tailwind CSS v4 + typography + forms plugins |
| Database | PostgreSQL (Neon) via Prisma 7 with the `@prisma/adapter-pg` driver adapter |
| Auth | Custom session auth (bcrypt + httpOnly cookies) |
| Media | Cloudflare R2 (planned, phase 1) |
| Email | Resend (planned, phase 1) |
| Deploy | Vercel |

## Prerequisites

- Node.js 22+
- pnpm 10+
- A PostgreSQL database (Neon or local Postgres) for migrations and the seed

## Setup

```sh
pnpm install
cp .env.example .env      # Windows: copy .env.example .env
```

Set `DATABASE_URL` (and `DIRECT_URL`) in `.env`, then create the schema and seed:

```sh
pnpm db:migrate           # creates the first migration and applies it
pnpm db:seed              # owner account, 20-point checklist, site settings
```

The seed creates an owner account using `OWNER_EMAIL` / `OWNER_PASSWORD` if set, otherwise
`owner@mellescleaning.test` / `change-me-now`. Change this immediately in any shared
environment.

Start the dev server:

```sh
pnpm dev --open
```

- Marketing site: `http://localhost:5173/`
- Admin CRM: `http://localhost:5173/admin` (redirects to `/login`)

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview the production build |
| `pnpm check` | SvelteKit sync + svelte-check |
| `pnpm test` | Run unit tests once |
| `pnpm lint` | Prettier check + ESLint |
| `pnpm format` | Prettier write |
| `pnpm db:migrate` | Create and apply a migration in development |
| `pnpm db:deploy` | Apply migrations in production |
| `pnpm db:seed` | Run the seed script |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:generate` | Regenerate the Prisma client |

## Project structure

```text
src/
├── env.ts                       # typed env vars via Kit 3 defineEnvVars
├── hooks.server.ts              # session loading + /admin route guard
├── app.d.ts                     # App.Locals typing
├── lib/
│   ├── assets/
│   └── server/
│       ├── db.ts                # Prisma singleton
│       ├── generated/prisma/    # generated client (gitignored)
│       └── auth/                # password hashing + sessions
├── routes/
│   ├── +layout.svelte           # global layout, imports layout.css
│   ├── layout.css               # Tailwind + brand design tokens
│   ├── (marketing)/             # public website
│   ├── (auth)/                  # login and logout
│   └── (admin)/admin/           # CRM
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

## Conventions and gotchas

- **Route groups** `(marketing)`, `(auth)` and `(admin)` organise the three surfaces without
  affecting URLs.
- **Tailwind v4 tokens** live in `src/routes/layout.css` under `@theme`. Add brand colours and
  semantic tokens there, not in a JS config.
- **Kit 3 env vars** are declared in `src/env.ts`. Private values are imported from
  `$app/env/private`, public ones from `$app/env/public`. The older `$env/*` modules are
  deprecated.
- **`#lib/*` imports** resolve through `package.json#imports`, but only with an explicit file
  extension (for example `#lib/assets/favicon.svg`). TypeScript-to-TypeScript imports inside
  `src/lib/server` use relative paths because extensionless `#lib` specifiers do not resolve.
- **Vercel adapter is conditional.** `vite.config.ts` uses `adapter-vercel` only when
  `process.env.VERCEL` is set, and `adapter-auto` otherwise. This is because the Vercel adapter
  writes symlinks, which fail on Windows inside a OneDrive folder (`EPERM`). Production builds on
  Vercel's Linux builders are unaffected; CI sets `VERCEL=1` to exercise the real adapter.

## Deployment (Vercel + Neon)

1. Create a Neon Postgres database and copy the pooled and direct connection strings.
2. Create a Vercel project pointing at this repository.
3. Add the environment variables from `.env.example` in the Vercel dashboard.
4. Set the build command to `pnpm build` and add `pnpm db:deploy` as a release step so
   migrations are applied.
5. Deploy. `VERCEL` is set automatically, so the Vercel adapter is used.

## Roadmap

Phase 0 (this milestone) delivered the design system, the full data model, authentication,
role-guarded admin shell and CI. Phase 1 adds the CMS-backed marketing pages, R2 media library
and lead capture; later phases add the CRM pipeline, scheduling, checklists, billing and
localisation. See [`docs/architecture.md`](docs/architecture.md) section 18.
