# Wong Digital Shop — AI Agent Instructions

## Project Overview
Wong Digital Shop is a full-stack e-commerce platform for selling digital products (subscriptions, social media boosting services). Built as a monorepo with Next.js 16, React 19, TypeScript 6, Tailwind CSS 4, and PostgreSQL 17 (Supabase).

## Tech Stack (Exact Versions)
- **Next.js 16.2.3** — App Router, Turbopack, React Compiler, proxy.ts
- **React 19.2.5** — Server Components, `use()`, `useActionState()`, RSC cycle protections
- **TypeScript 6.0.2** — strict, ESNext, Bundler resolution, `noUncheckedSideEffectImports`
- **Tailwind CSS 4.2.2** — CSS-first `@theme` config (NO tailwind.config.js)
- **shadcn/ui** — Component primitives (Button, Card, Badge, etc.) via CLI, uses `cn()` from clsx + tailwind-merge
- **Zod 4.3.6** — `z.email()` shorthand, `.pick()` step validation
- **Drizzle ORM 0.45.2** — PostgreSQL, relational queries
- **PostgreSQL 17** — via Supabase
- **Supabase Auth** — `@supabase/ssr` 0.10, cookie-based sessions
- **Vitest 4.1.4** — workspaces: web (jsdom), ui (jsdom), db (node)
- **Bun 1.3.12** — package manager and runtime
- **Turborepo 2.9.6** — monorepo orchestration

## Architecture Rules

### File structure
```
apps/web/           → Next.js application
packages/db/        → Drizzle schema, queries, pricing logic
packages/ui/        → Shared components (Button, Badge, Card, etc.)
packages/config/    → Shared tsconfig
```

### Code ordering within files
1. Imports (types → framework → packages → local → relative)
2. Metadata / exports / constants
3. Types
4. Helper functions
5. Main component (state → derived values → handlers → render)
6. Child / fallback components

### Import conventions
- Use `@/` alias for `apps/web/` imports
- Use `@wongdigital/db`, `@wongdigital/ui` for package imports
- Type imports use `import type { ... }`

### Component patterns
- Server Components by default (no `"use client"` unless hooks/interactivity needed)
- Client boundaries as narrow as possible
- Dynamic imports (`next/dynamic`) for heavy checkout step components
- `<Suspense>` boundaries around async content with skeleton fallbacks

### Server Actions
- Validate with Zod `.safeParse()` — never throw on user input
- Auth check with `requireDashboardAdmin()` before mutations
- Use `revalidatePath()` + `redirect()` after mutations
- Return `ActionResult<T>` type for storefront actions

### Styling
- All design tokens in `globals.css` using `@theme` directive
- Use CSS custom properties (`--accent`, `--bg-surface`, etc.)
- Use `color-mix()` for transparent overlays
- Mobile-first: base styles for mobile, `sm:`/`lg:` for larger screens
- `container-shell` class for page width constraints
- **shadcn/ui**: Import components from `@wongdigital/ui/components/`
- **`cn()` utility**: Always use `cn()` from `@wongdigital/ui/lib/utils` (clsx + tailwind-merge) to combine Tailwind classes
- **Font stack**: Space Grotesk (display), Inter (body), JetBrains Mono (mono)
- **Color palette**: Blue `#3B82F6` accent, cool slate backgrounds

### Testing
- Co-locate tests with source files (`*.test.ts` / `*.test.tsx`)
- Use factory functions for mock data
- Strong assertions (`toBe("₱500")`) not weak ones (`toContain("500")`)
- Test all exported functions and all component variants

### Accessibility
- `aria-live="polite"` on status messages
- `aria-current="page"` on active nav items
- `role="alert"` on error messages
- `prefers-reduced-motion: reduce` for all animations
- Keyboard support (Escape closes modals)
- `:focus-visible` styling on all interactive elements

## Don'ts
- ❌ Don't use `tailwind.config.js` — project uses CSS-first `@theme`
- ❌ Don't use `middleware.ts` — renamed to `proxy.ts` in Next.js 16
- ❌ Don't use `esModuleInterop` — redundant with `moduleResolution: "Bundler"`
- ❌ Don't use `useMemo`/`useCallback`/`memo` — React Compiler handles this
- ❌ Don't use `getSession()` — use `getUser()` (validates JWT server-side)
- ❌ Don't use float for prices — use `numeric(10, 2)` in Drizzle
- ❌ Don't scatter imports after executable code
