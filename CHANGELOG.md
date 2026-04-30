# Changelog

All notable changes to the **Wong Digital Shop** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **USDT base pricing.** Product prices are stored in USDT in Postgres and converted to the visitor's local currency at display time using live rates from `/api/exchange-rates`, insulating valuations from PHP fiat inflation.
- **Tag-based cache invalidation.** Read helpers are wrapped with Next.js `unstable_cache` (1-year TTL). Supabase database webhooks POST to `/api/revalidate`, which calls `revalidateTag(...)` to invalidate `store-products`, `store-bundles`, `store-settings`, and `recent-orders` on write.
- **Vercel Blob + next/image.** All product icons and receipt uploads are served through `next/image` with `*.public.blob.vercel-storage.com` whitelisted in `remotePatterns`, producing AVIF/WebP automatically.
- **`supabase/schema.sql` split out from `reset.sql`.** Schema-only bootstrap is now separate from the destructive reset path. `scripts/extract_schema.py` regenerates `schema.sql` from source.
- **Seed catalog** now ships ~127 USDT-priced products across SaaS subscriptions and social-growth packages. The generated boosting catalog (`packages/db/src/boosting-service-catalog.generated.ts`) is produced by `scripts/generate-boosting-catalog.mjs` and imported into the runtime seeder.

### Fixed
- Cookie parsing and `x-vercel-ip-country` reads no longer trip type errors against `unstable_cache` / `revalidateTag` during build.
- Sticky mobile storefront elements render consistently on narrow breakpoints.

### Security
- Removed committed credentials from the repo: `supabase/seed.sql` and the legacy `scripts/supabase-*.sql` family are now gitignored because `seed.sql` bootstraps an admin user. Provision these files out-of-band.

---

## [0.2.0] - 2026-03-31
### Changed
- Standardised TypeScript interfaces shared between packages.
- Cleaned up `@wongdigital/ui` public exports.

---

## [0.1.0] - 2026-03-24
### Added
- Admin dashboard split into the `app/(dashboard)` route group.
- Geo-pricing hook switching display currency per IP country.
