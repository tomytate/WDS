# Codex — Wong Digital Shop

Read `.agents/agent.md` for the full project context first.

## Codex-Specific Instructions

### Environment
- Runtime: Bun 1.3.12 (not Node.js)
- Package manager: `bun install` / `bun add`
- Monorepo: Turborepo — run scripts from root with `bun run <script>`
- Build: `bun run build` (uses Turbopack, not Webpack)

### Quick Reference

```bash
# Development
bun run dev            # Start dev server
bun run build          # Production build
bun run test           # Run all tests
bun run typecheck      # TypeScript check
bun run lint           # ESLint

# Database
bun run db:generate    # Generate Drizzle migration
bun run db:migrate     # Apply migration
bun run db:seed        # Seed database
```

### Key File Locations
| Purpose | Path |
|---|---|
| Root layout | `apps/web/app/layout.tsx` |
| Design tokens | `apps/web/app/globals.css` |
| Edge proxy | `apps/web/proxy.ts` |
| DB schema | `packages/db/src/schema.ts` |
| DB queries | `packages/db/src/storefront.ts` |
| Pricing logic | `packages/db/src/pricing.ts` |
| Order schemas | `apps/web/lib/schemas.ts` |
| Order action | `apps/web/app/(storefront)/order/actions.ts` |
| Dashboard actions | `apps/web/app/(dashboard)/dashboard/actions.ts` |
| UI components | `packages/ui/src/` |
| Storefront components | `apps/web/components/storefront/` |
| Dashboard components | `apps/web/components/dashboard/` |

### Critical Patterns
- **No `tailwind.config.js`** — uses CSS `@theme` directive in `globals.css`
- **No `middleware.ts`** — uses `proxy.ts` (Next.js 16 rename)
- **No `esModuleInterop`** — uses `moduleResolution: "Bundler"`
- **No `useMemo`/`useCallback`** — React Compiler handles memoization
- **No `getSession()`** — use `getUser()` for Supabase auth
- **Use `cn()`** — from `@wongdigital/ui/lib/utils` (clsx + tailwind-merge) for class merging
- **shadcn imports** — `from "@wongdigital/ui/components/button"`
- **Color palette** — Blue `#3B82F6`, cool slate backgrounds
- **Fonts** — Space Grotesk (display), Inter (body), JetBrains Mono (mono)

### Coding Conventions
- No semicolons
- Imports ordered: types → framework → packages → local
- `"use client"` only when hooks/interactivity needed
- Validate forms with Zod `.safeParse()`, never throw on input
- Use `ActionResult<T>` return type for server actions
- Tests co-located with source (`catalog.ts` → `catalog.test.ts`)
- DB prices: `numeric(10, 2)`, never float
- All timestamps: `timestamp({ withTimezone: true })`
