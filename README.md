<div align="center">
  <img src="https://raw.githubusercontent.com/tomytate/WDS/main/apps/web/public/android-chrome-512x512.png" alt="Wong Digital Shop Logo" width="120" height="120" />

  # Wong Digital Shop (WDS)

  **Digital products & social-growth storefront — Philippines & worldwide.**

  [![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2.5-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Bun](https://img.shields.io/badge/Bun-1.3.12-fbf0df?style=for-the-badge&logo=bun&logoColor=black)](https://bun.sh)
  [![Turborepo](https://img.shields.io/badge/Turborepo-2.9.6-ef4444?style=for-the-badge&logo=turborepo)](https://turbo.build/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database_&_Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
</div>

---

## 📋 Table of Contents

- [What is WDS?](#what-is-wong-digital-shop)
- [Product Surface](#product-surface)
- [Architecture](#architecture)
- [Core Stack](#core-stack)
- [Install & Develop](#install--develop)
- [Quality Controls](#quality-controls)
- [Email System](#email-system)
- [Contributing](#contributing)

---

## What is Wong Digital Shop?

**Wong Digital Shop (WDS)** is a full-featured storefront for digital products and social-growth services:

- **Digital SaaS subscriptions** — ChatGPT Pro, Canva Pro, Netflix, Claude, and more.
- **Social-growth packages** — follower, like, and engagement bundles for Meta (Facebook & Instagram), YouTube, TikTok, Telegram, and X.

Subscription services and social-boosting services share a single unified checkout.

---

## Product Surface

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

```
WDS/
├── apps/
│   └── web/                  ← Next.js 16 App Router (storefront + dashboard)
│       ├── app/
│       │   ├── (storefront)/  ← Public checkout, order tracking, success pages
│       │   ├── (dashboard)/   ← Admin orders, products, customers, settings
│       │   └── api/           ← Health check, exchange rates, revalidation, cron jobs
│       ├── components/        ← Storefront + dashboard UI components
│       ├── emails/            ← react-email 6.0 transactional templates
│       ├── e2e/               ← Playwright end-to-end tests
│       └── lib/               ← Data cache, pricing, formatters
├── packages/
│   ├── db/                   ← Supabase client wrappers, pricing engine, seed, types
│   ├── ui/                   ← Shared Tailwind + Radix components
│   └── config/               ← Shared tsconfig bases
└── .github/workflows/ci.yml  ← typecheck → lint → test → build → e2e
```

### Caching

`apps/web/lib/data-cache.ts` wraps read helpers with Next.js `unstable_cache` and a 1-year TTL. Supabase database webhooks POST to `/api/revalidate`, which calls `revalidateTag(...)` to invalidate the relevant cache keys on product, bundle, and settings changes.

Product images go through `next/image` with `remotePatterns` allowing `*.public.blob.vercel-storage.com`, Supabase, Simple Icons, and Clearbit; Next.js serves AVIF/WebP.

---

## Core Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| **Framework** | Next.js | 16.2.4 | Turbopack, React Compiler (`reactCompiler: true`), App Router |
| **UI Library** | React | 19.2.5 | Server/Client Components, Suspense, Transitions |
| **Language** | TypeScript | 6.0.2 | Strict mode across all packages |
| **Styling** | Tailwind CSS | 4.2.4 | CSS-first `@theme` configuration |
| **Database** | Supabase (Postgres) | — | Auth, RLS, database webhooks |
| **Auth** | Supabase Auth | @supabase/ssr 0.10.2 | Cookie-based SSR sessions |
| **ORM** | Drizzle (migration SQL) | — | `packages/db/drizzle/` holds historical SQL only; runtime uses Supabase client |
| **Validation** | Zod | 4.3.6 | Server actions, form parsing |
| **Forms** | react-hook-form | 7.73.1 | Client-side form state |
| **Animation** | motion | 12.38.0 | Successor to framer-motion |
| **Email** | Resend + react-email | 6.0.0 | Order lifecycle transactional emails |
| **Payments** | Payssion + Binance Pay / QRPH | — | Global + Philippines-specific rails |
| **Rate Limiting** | Upstash Redis | — | Sliding window with in-memory fallback |
| **Error Tracking** | Sentry | @sentry/nextjs 10.49.0 | Root, storefront, and dashboard error boundaries |
| **Bot Protection** | Cloudflare Turnstile | — | Checkout submission protection |
| **File Storage** | Vercel Blob | 2.3.3 | Private receipt uploads |
| **Monitoring** | `GET /api/health` | — | DB connectivity, latency, process uptime |
| **Package Manager** | Bun | 1.3.12 | Fast installs, native TS runner |
| **Monorepo** | Turborepo | 2.9.6 | Workspace orchestration, task caching |

---

## Install & Develop

**1. Clone and install**

```bash
git clone https://github.com/tomytate/WDS.git
cd WDS
bun install
```

**2. Provision the database**

The Supabase SQL files in `supabase/` are gitignored because `seed.sql` contains a bootstrap admin password. Get them out-of-band from a maintainer (or regenerate from `packages/db/src/seed-products.ts`), then inside the Supabase SQL Editor:

```sql
-- 1. Create schema
\i supabase/schema.sql

-- 2. Seed store settings, admin user, products, and fixtures
\i supabase/seed.sql
```

For a full teardown + rebuild, run `supabase/reset.sql` instead.

**3. Environment**

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in the values:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) |
| `DASHBOARD_ADMIN_EMAILS` | Comma-separated admin emails |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token |
| `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile |
| `PAYSSION_API_KEY` / `PAYSSION_SECRET_KEY` | Payment gateway |
| `RESEND_API_KEY` | Transactional email |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |
| `CRON_SECRET` | Authenticates Vercel cron jobs |

**4. Run**

```bash
bun dev
```

Storefront: [http://localhost:3000](http://localhost:3000) · Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## Quality Controls

| Control | Details |
|---------|---------|
| **TypeScript strict mode** | Enabled across all packages via `packages/config/tsconfig.base.json` |
| **Vitest unit tests** | 195+ tests across `web`, `ui`, `db` via `vitest.workspace.ts` |
| **Playwright e2e** | 7 tests covering checkout, validation, promo codes, tracking, legal pages |
| **CI pipeline** | `typecheck → lint → test → build → e2e` on every push and PR to `main` |
| **Security headers** | Strict CSP, HSTS, X-Frame-Options DENY, Permissions-Policy, COOP/CORP |
| **Rate limiting** | Upstash Redis sliding window on order submission |
| **PII protection** | Order success page requires HMAC-SHA256 token to display customer details |
| **Error boundaries** | Root, storefront, and dashboard — all instrumented with Sentry |
| **Cron security** | All `/api/cron/*` routes enforce `CRON_SECRET` with `401 Unauthorized` |
| **Supabase RLS** | Enabled on every sensitive table with policies scoped per role |
| **SEO** | JSON-LD structured data on homepage and product pages |

---

## Email System

Transactional emails via [Resend](https://resend.com) using `react-email` v6 templates in `apps/web/emails/`:

| Status | Template | Trigger |
|--------|----------|---------|
| `pending` | `order-received.tsx` | Customer completes checkout |
| `processing` | `order-processing.tsx` | Admin changes status to processing |
| `delivered` | `order-delivered.tsx` | Admin marks as delivered |
| `completed` | `order-completed.tsx` | Admin marks as completed (includes review link) |

All emails include an itemized receipt with product names, quantities, prices, total, and payment method. Sent fire-and-forget via `Promise.allSettled` so they never block checkout or dashboard operations.

To configure: set `RESEND_API_KEY` and verify your domain in the Resend dashboard. For Supabase Auth emails (signup, password reset), configure SMTP in Supabase with `smtp.resend.com` / port `465` / username `resend` / password = your API key.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, code conventions, and PR process.

---

## License

[MIT License](./LICENSE) — Copyright © 2025–2026 **Wong Digital Shop**
