# Security Policy

## Supported versions

WDS is pre-1.0 (`apps/web` currently at `0.0.0`). Only the tip of `main` is supported. Downstream forks are responsible for their own patching.

## What is hardened

- **Row-Level Security** is enabled on every customer-facing table in `supabase/schema.sql`, with explicit policies per role.
- **Authentication** uses `@supabase/ssr` cookies; the dashboard gate (`apps/web/lib/dashboard-auth.ts`) further restricts access to the emails listed in `DASHBOARD_ADMIN_EMAILS`.
- **HTTP headers** in `apps/web/next.config.ts`:
  - strict `Content-Security-Policy` (scripts limited to self + Turnstile + Vercel analytics + Meta pixel),
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`,
  - `X-Frame-Options: DENY`,
  - `X-Content-Type-Options: nosniff`,
  - `Referrer-Policy: strict-origin-when-cross-origin`,
  - `Permissions-Policy` disabling camera, microphone, geolocation,
  - COOP + CORP.
- **Cloudflare Turnstile** bot check on order submission. If `TURNSTILE_SECRET_KEY` is missing in `NODE_ENV=production`, verification **fails closed** (requests are rejected) — see `apps/web/lib/security.ts`.
- **Error tracking** via Sentry at client / edge / server layers (sourcemaps disabled in upload).
- **No secrets in the repo.** `.env.*` is gitignored; `supabase/seed.sql` (which bootstraps an admin user) is also gitignored and must be provisioned out-of-band.

## Known limitations

- The in-process rate limiter in `apps/web/lib/security.ts` resets per Vercel cold start and is not shared across concurrent invocations. For anything customer-impacting, front it with Upstash / Vercel KV.
- `x-forwarded-for` is trusted up to the first comma-separated value; if you deploy behind an untrusted proxy, validate the header yourself.
- `DASHBOARD_ADMIN_EMAILS` is a denylist-style control; rotating a compromised admin still requires a password reset in Supabase Auth.

## Reporting a vulnerability

Please **do not** open a public issue. Email `security@wongdigital.shop` with:

- A description of the issue.
- Reproduction steps (proof-of-concept code is welcome, not required).
- Affected commit SHA or deployed URL.
- Your disclosure timeline, if you have one.

We aim to acknowledge reports within 72 hours and coordinate a fix from there.
