# Melles Cleaning Services

Marketing website and owner-administered CRM for a residential and commercial cleaning
business based in Dodoma, Tanzania. One SvelteKit application serves the public site, the
internal CRM and (later) a client portal.

See [`docs/architecture.md`](docs/architecture.md) for the full system design.

## Stack

| Concern   | Choice                                                                      |
| --------- | --------------------------------------------------------------------------- |
| Framework | SvelteKit 3 + Svelte 5 (runes)                                              |
| Language  | TypeScript (strict)                                                         |
| Build     | Vite 8, pnpm 10                                                             |
| Styling   | Tailwind CSS v4 + typography + forms plugins                                |
| Database  | PostgreSQL (Neon) via Prisma 7 with the `@prisma/adapter-pg` driver adapter |
| Auth      | Custom session auth (bcrypt + httpOnly cookies)                             |
| Media     | Cloudflare R2 (planned, phase 1)                                            |
| Email     | Resend (planned, phase 1)                                                   |
| Deploy    | Vercel                                                                      |

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

| Script             | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `pnpm dev`         | Start the dev server                        |
| `pnpm build`       | Production build                            |
| `pnpm preview`     | Preview the production build                |
| `pnpm check`       | SvelteKit sync + svelte-check               |
| `pnpm test`        | Run unit tests once                         |
| `pnpm lint`        | Prettier check + ESLint                     |
| `pnpm format`      | Prettier write                              |
| `pnpm db:migrate`  | Create and apply a migration in development |
| `pnpm db:deploy`   | Apply migrations in production              |
| `pnpm db:seed`     | Run the seed script                         |
| `pnpm db:studio`   | Open Prisma Studio                          |
| `pnpm db:generate` | Regenerate the Prisma client                |

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

## Website and content management (phase 1)

The public site is server-rendered and reads its content from PostgreSQL, so owner edits appear
immediately without a rebuild.

| Route                              | Purpose                                       |
| ---------------------------------- | --------------------------------------------- |
| `/`                                | Home with services, pricing and promotions    |
| `/services` and `/services/[slug]` | Service catalogue and detail pages            |
| `/pricing`                         | Full pricing catalogue grouped by service     |
| `/gallery`                         | Published gallery images                      |
| `/about`                           | Company story and the 20-point checklist      |
| `/contact`                         | General enquiry form                          |
| `/book`                            | Booking / quote request with a preferred date |
| `/sitemap.xml`, `/robots.txt`      | SEO                                           |

Both forms validate input with Zod, create a `Lead` record and notify the owner once a
notification email is configured. The marketing layout also emits `LocalBusiness` JSON-LD.

Owner editing lives under the admin area:

| Area                          | What the owner can change                                                  |
| ----------------------------- | -------------------------------------------------------------------------- |
| `/admin/content/services`     | Create and edit services and their TZS pricing packages, show or hide them |
| `/admin/content/faq`          | Add, edit, publish and delete FAQ entries                                  |
| `/admin/content/testimonials` | Add, edit, publish and delete client reviews                               |
| `/admin/media`                | Upload photos to R2 and curate the public gallery                          |
| `/admin/settings`             | Contact details, business hours and promotion values                       |

### Media library setup

Uploads require a Cloudflare R2 bucket plus five environment variables. Here is where each value
comes from in the Cloudflare dashboard.

1. **Create the bucket** — R2 → *Create bucket*. Name it (for example `melles-cleaning-media`) and
   put that name in `R2_BUCKET`.
2. **`R2_ACCOUNT_ID`** — shown on the R2 overview page as *Account ID*. It is also the subdomain in
   the S3 endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.
3. **`R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`** — these are **R2 S3 credentials**, not a
   Cloudflare API token. Open R2 → *API* → *Manage API Tokens* (direct link:
   `https://dash.cloudflare.com/?to=/:account/r2/api-tokens`) → *Create API token*. Give it *Object
   Read & Write* and scope it to your bucket.

   > **Common mistake:** the *Cloudflare API Tokens* page (My Profile → API Tokens, with templates
   > such as "Read and write to Cloudflare Stream and Images") produces a **single** token string
   > and cannot be used here. R2 credentials always come as **two** values — an Access Key ID and a
   > Secret Access Key. The secret is displayed **only once** at creation; if you navigate away,
   > delete that token and create a new one.
4. **`R2_PUBLIC_URL`** — buckets are private by default, so a public base URL is needed for images
   to render:
   - *Quickest (development):* bucket → *Settings* → *Public access* → enable the **R2.dev
     subdomain**. You get a URL like `https://pub-abc123.r2.dev`. It is rate limited and Cloudflare
     intends it for non-production use.
   - *Production:* bucket → *Settings* → *Public access* → *Custom Domains* → connect a domain such
     as `media.example.com` and use that as `R2_PUBLIC_URL`.

   Set it without a trailing slash and without the bucket name — the app builds
   `R2_PUBLIC_URL/<object-key>`.

**CORS is required for browser uploads.** Because the browser uploads directly to R2 using a
presigned URL, the bucket must allow `PUT` from your origins. Add this under bucket → *Settings* →
*CORS Policy*:

```json
[
	{
		"AllowedOrigins": ["http://localhost:5173", "https://your-production-domain"],
		"AllowedMethods": ["PUT", "GET"],
		"AllowedHeaders": ["Content-Type"],
		"ExposeHeaders": ["ETag"],
		"MaxAgeSeconds": 3600
	}
]
```

The browser requests a short-lived presigned PUT URL from `/api/media/upload` and uploads directly
to R2, so image files never pass through the serverless function. Restart the dev server after
editing `.env`, and add the same variables to your Vercel project for production.

## Operations and billing (phase 3)

Phase 3 completes the job-to-cash cycle. New and completed admin routes:

| Route                         | Purpose                                                                   |
| ----------------------------- | ------------------------------------------------------------------------- |
| `/admin/clients`              | Client profiles, contacts and service history                             |
| `/admin/bookings`             | Schedule jobs, advance the job lifecycle, generate invoices               |
| `/admin/quotes`               | Line-item quotes with server-side totals and quote-to-booking conversion  |
| `/admin/invoices`             | Generate from a booking or build manually, issue, void, track balances    |
| `/admin/payments`             | Record cash and mobile-money receipts                                     |
| `/admin/checklists`           | QC templates and per-job completion with supervisor walkthrough sign-off  |
| `/admin/feedback`             | Capture post-service ratings and publish approved reviews                 |
| `/admin/reports`              | Revenue, retention, average job value, utilisation and invoice aging      |

Totals are always recomputed server-side by the pricing engine in
[`src/lib/server/pricing/engine.ts`](src/lib/server/pricing/engine.ts), and recording a payment
recomputes its invoice status — and the linked booking — automatically. Document numbers
(`QUO-`, `INV-`, `BKG-`) are sequential per EAT year. Every booking is issued the matching QC
checklist on creation, and status changes are constrained by the lifecycle rules in
[`src/lib/server/crm/bookings.ts`](src/lib/server/crm/bookings.ts).

## Growth and localisation (phase 4)

| Area             | What shipped                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| Bilingual EN/SW  | Paraglide JS with cookie + `Accept-Language` negotiation; switch with `?lang=en` / `?lang=sw`                |
| WhatsApp         | Cloud API sender with a click-to-chat fallback — [`whatsapp.ts`](src/lib/server/notify/whatsapp.ts)          |
| Email + SMS      | Resend transactional email and an optional SMS gateway — [`email.ts`](src/lib/server/notify/email.ts)        |
| Mobile money     | Aggregator collections plus a signed webhook that records payments and reconciles invoices                   |
| Promotions       | First-clean discount and referral credit applied server-side from settings                                   |
| Analytics        | Privacy-friendly script injected only when `PUBLIC_ANALYTICS_DOMAIN` is set                                  |
| Calendar         | ICS feed of upcoming jobs at `/api/calendar` (session or `?token=`)                                          |

Message catalogs live in [`src/messages/en.json`](src/messages/en.json) and
[`src/messages/sw.json`](src/messages/sw.json); Paraglide compiles them to `src/lib/paraglide`.
Run `pnpm i18n` after editing messages — `pnpm check` and `pnpm build` also compile automatically.
The aggregator webhook is at [`/api/webhooks/payments`](src/routes/api/webhooks/payments/+server.ts)
and verifies an HMAC-SHA256 signature from `PAYMENTS_WEBHOOK_SECRET`.

## Roadmap

Phase 0 delivered the design system, data model, authentication, admin shell and CI. Phase 1
delivered the CMS-backed marketing site, lead capture, SEO and the owner content editors. Phase 2
established the CRM core data — clients and bookings — and phase 3 completed operations and
billing: quotes, invoices, payments, checklists, feedback and reports. Phase 4 added Swahili
localisation, WhatsApp automation, mobile-money integration, referral/promo automation and
analytics. Phase 5 is the optional client self-service portal. See
[`docs/architecture.md`](docs/architecture.md) section 18.
