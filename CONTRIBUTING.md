# Contributing to Wong Digital Shop (WDS)

Thanks for considering a contribution. Bug reports, fixes, and feature proposals are all welcome.

## Workflow

- All changes land through pull requests targeting `main`.
- Fork → branch from `main` → PR.
- If you add code paths that can be unit-tested, add a test under the same package (`apps/web/**/*.test.ts(x)`, `packages/db/src/**/*.test.ts`, or `packages/ui/src/**/*.test.tsx`).
- If you change a public contract (env vars, routes, SQL schema, dashboard API), update the relevant doc (`README.md`, `CHANGELOG.md`, `.env.example`, or the SQL file).
- Make sure `bun run typecheck` and `bun run test` pass locally before opening the PR.

## Code style

- **TypeScript strict mode is on.** Prefer accurate types over `any`. When an `any` is unavoidable at a Supabase boundary, narrow it at the first callsite rather than propagating it up.
- **Prefer `@wongdigital/ui`** for buttons, badges, cards, fields, and skeletons. Add to the package instead of creating bespoke primitives inside `apps/web`.
- **App Router conventions only.** Server components by default; `"use client"` only where needed.
- **Error boundaries are required.** Every route group must have an `error.tsx` instrumented with `Sentry.captureException`.
- **Email templates** live in `apps/web/emails/` using `react-email` v6. When adding a new status email, register it in `lib/email.ts` and include the `items`/`totalPrice`/`paymentMethod` props for the receipt section.
- **Security:** All new API routes must enforce authentication. Cron routes must validate `CRON_SECRET`. Sensitive data must never be exposed without token verification.
- **ESLint** is configured and runs in CI via `bun run lint`.

## Reporting bugs

Open a GitHub issue with:

- Summary / context.
- Steps to reproduce.
- Expected vs. actual behaviour.
- Relevant env (Next version, bun version, browser, OS).
- Screenshots or trace if UI / network related.

## License

By contributing, you agree your contributions are licensed under the repository's [MIT License](./LICENSE).
