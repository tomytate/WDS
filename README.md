<div align="center">
  <img src="https://raw.githubusercontent.com/tomytate/WDS/main/apps/web/public/android-chrome-512x512.png" alt="Wong Digital Shop Logo" width="120" height="120" />

  # Wong Digital Shop (WDS)

  **Digital products & social-growth storefront.**

  [![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![Turborepo](https://img.shields.io/badge/Turborepo-2.9-ef4444?style=for-the-badge&logo=turborepo)](https://turbo.build/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database_&_Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
</div>

---

## What is Wong Digital Shop?

**Wong Digital Shop (WDS)** is a storefront for digital products:

- **Digital SaaS subscriptions** — ChatGPT Pro, Canva Pro, Netflix, Claude, etc.
- **Social-growth packages** — follower, like, and engagement bundles for Meta (Facebook & Instagram), YouTube, TikTok, Telegram, and X.

Subscription services and social-boosting services share a single checkout.

---

## Product surface

### Storefront (customer-facing)

- **Geo-aware checkout.** Payment options are selected from the visitor's country via the `x-vercel-ip-country` header (QRPH for PH, Binance Pay / Payssion for the rest of the world).
- **USDT base pricing.** Products are stored in USDT in Postgres and converted to a local currency at display time using live rates from `/api/exchange-rates`.
- **Cart persistence.** Cart state is kept in client `localStorage` so refreshes don't lose selections.
- **Animations & icons.** Uses `motion` (the successor to `framer-motion`) and `lucide-react` for UI polish — particle hero canvas, bento grid, hover glow.

### Dashboard (admin-facing)

- **Orders pipeline.** Tracks processing / verification / completed via Supabase database webhooks.
- **Products & bundles.** CRUD with bundle-discount math.
- **Promo codes.** Percentage and fixed-amount codes, applied at checkout.

---

## Architecture

### Turborepo layout

- `apps/web` — the Next.js App Router app (storefront + dashboard under route groups `(storefront)` / `(dashboard)`).
- `packages/ui` — shared Tailwind + Radix components.
- `packages/db` — Supabase client wrappers, pricing, seed, types.
- `packages/config` — shared tsconfig bases.

### Caching

`apps/web/lib/data-cache.ts` wraps read helpers with Next.js `unstable_cache` and a 1-year TTL. Supabase database webhooks POST to `/api/revalidate`, which calls `revalidateTag(...)` to invalidate the relevant cache keys on product, bundle, and settings changes. This is the Next.js data cache, not an edge cache.

Product images go through `next/image` with `remotePatterns` allowing `*.public.blob.vercel-storage.com`, Supabase, Simple Icons, and Clearbit; Next.js serves AVIF/WebP.

### Core stack

- **Framework:** Next.js 16.2 with Turbopack and the React compiler (`reactCompiler: true` in `next.config.ts`), React 19.
- **Database / auth:** Supabase (Postgres + Auth), accessed via `@supabase/supabase-js` and `@supabase/ssr`. (Drizzle is **not** used in runtime code; `packages/db/drizzle/` holds historical migration SQL only.)
- **Styling:** Tailwind CSS 4.2.
- **Forms:** `react-hook-form` + `@hookform/resolvers`.
- **Validation:** Zod.
- **Payments:** Payssion (global) + Binance Pay / QRPH bank rails for PH.
- **Email:** Resend + `react-email` v6 — transactional order lifecycle emails (received → processing → delivered → completed).
- **Rate limiting:** Upstash Redis sliding window with automatic in-memory fallback for local dev.
- **Error tracking:** Sentry (`@sentry/nextjs`) with error boundaries at root, storefront, and dashboard levels.
- **Bot protection:** Cloudflare Turnstile.
- **Monitoring:** `GET /api/health` — returns DB connectivity, latency, and process uptime.

---

## Install & develop

**1. Clone and install**

```bash
git clone https://github.com/tomytate/WDS.git
cd WDS
bun install
```

**2. Provision the database**

The Supabase SQL files in `supabase/` are gitignored because `seed.sql` contains a bootstrap admin password. Get them out-of-band from a maintainer (or regenerate from `packages/db/src/seed-products.ts`), then, inside the Supabase SQL Editor:

```sql
-- 1. Create schema
\i supabase/schema.sql

-- 2. Seed store settings, admin user, products, and fixtures
\i supabase/seed.sql
```

If you want a full teardown + rebuild on an existing database, run `supabase/reset.sql` instead (it drops all tables, recreates them, and seeds). `schema.sql` alone does not seed products.

**3. Environment**

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in the values. Required:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `DASHBOARD_ADMIN_EMAILS` (comma-separated list)
- `BLOB_READ_WRITE_TOKEN` (Vercel Blob)
- `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Cloudflare Turnstile)
- `PAYSSION_API_KEY` / `PAYSSION_SECRET_KEY`
- `RESEND_API_KEY` (transactional order emails)
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (production rate limiting)
- `CRON_SECRET` (authenticates Vercel cron jobs)
- Optional: `TELEGRAM_*`, `DISCORD_*_WEBHOOK_URL`, `SENTRY_*`, `FROM_EMAIL`

**4. Run**

```bash
bun dev
```

The storefront is at <http://localhost:3000>; the dashboard is at `/dashboard` (requires an email in `DASHBOARD_ADMIN_EMAILS` or an unconfigured non-production environment, which auto-grants a dev bypass).

---

## Quality controls

- **TypeScript strict mode** is enabled in `packages/config/tsconfig.base.json` and inherited by every package.
- **Vitest** unit tests run across three projects (`web`, `ui`, `db`) via `vitest.workspace.ts` — 195+ tests.
- **Playwright** e2e tests live in `apps/web/e2e/` (7 tests covering checkout, validation, promo codes, tracking, legal pages) and run in CI with an uploaded report artifact.
- **CI** (`.github/workflows/ci.yml`) runs `typecheck → lint → test → build → e2e` on every push and PR to `main`, with Bun dependency caching.
- **Security headers:** strict CSP (including Payssion/Alipay frame-src), HSTS, X-Frame-Options DENY, `Permissions-Policy`, COOP/CORP — all defined in `apps/web/next.config.ts`.
- **Rate limiting:** Upstash Redis sliding window on order submission; automatic in-memory fallback.
- **PII protection:** Order success page requires HMAC-SHA256 token to display customer details.
- **Error boundaries:** Root (`global-error.tsx`), app (`error.tsx`), storefront, and dashboard — all instrumented with Sentry.
- **Cron security:** All `/api/cron/*` routes enforce `CRON_SECRET` with `401 Unauthorized`.
- **Supabase RLS** is enabled on every sensitive table in `supabase/schema.sql`, with policies scoped per role.
- **SEO:** JSON-LD structured data on homepage and product pages, `robots.txt` blocking `/dashboard/`, `/api/`, `/auth/`.

## Email system

Transactional emails are sent via [Resend](https://resend.com) using `react-email` v6 templates in `apps/web/emails/`:

| Status | Template | Trigger |
|---|---|---|
| `pending` | `order-received.tsx` | Customer completes checkout |
| `processing` | `order-processing.tsx` | Admin changes status to processing |
| `delivered` | `order-delivered.tsx` | Admin marks as delivered |
| `completed` | `order-completed.tsx` | Admin marks as completed (includes review link) |

All emails include an itemized receipt with product names, quantities, prices, total, and payment method. Emails are sent fire-and-forget via `Promise.allSettled` so they never block checkout or dashboard operations.

To configure: set `RESEND_API_KEY` and verify your domain in the [Resend dashboard](https://resend.com/domains). For Supabase Auth emails (signup, password reset), configure SMTP in Supabase with `smtp.resend.com` / port `465` / username `resend` / password = your API key.
