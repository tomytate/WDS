---
description: Next.js 16.2 patterns, conventions, View Transitions, and best practices for the Wong Digital Shop
---

# Next.js 16.2.3 — Reference Guide

## Key Changes from Next.js 15

### 1. Turbopack is the Default Bundler
- Turbopack replaces Webpack as the default for both `dev` and `build`
- 2–5× faster production builds, up to 10× faster Fast Refresh
- To opt out: `next build --webpack` or `next dev --webpack`
- Custom Webpack configs need migration to Turbopack-compatible options

### 2. Middleware → Proxy Rename
- `middleware.ts` is renamed to `proxy.ts`
- The exported function is `proxy()` instead of `middleware()`
- Config flag: `skipProxyUrlNormalize` replaces `skipMiddlewareUrlNormalize`
- This project already uses `proxy.ts` correctly

### 3. Cache Components (`'use cache'`)
- Replaces the implicit caching model and experimental `ppr` flag
- Add `'use cache'` directive to opt components/functions into caching
- Replaces `export const experimental_ppr = true`

### 4. React Compiler (Stable)
- Enable with `reactCompiler: true` in `next.config.ts`
- Automatically memoizes components — reduces need for `useMemo`/`useCallback`/`memo`
- This project has it enabled ✅

### 5. Async Request APIs (Strict)
- `params` and `searchParams` in page/layout components are `Promise<T>`
- Must `await` them before use:
  ```tsx
  export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
  }
  ```

### 6. Server Fast Refresh (v16.2.2+)
- `serverFastRefresh` option in `next.config.js` — faster HMR for server components
- Turbopack can now HMR app route handlers directly (no full reload)
- CSS HMR on Safari fixed in v16.2.2

### 7. v16.2.3 Security & Stability Fixes (April 2026)
- **CVE-2026-23869** security fix (backported)
- Fix: `manifest.ts` no longer breaks HMR (#91981)
- Fix: styled-jsx race condition — styles lost during concurrent rendering (#92459)
- Fix: ISR revalidation errors now reported via `onRequestError` (#92282)
- Fix: Output asset deduplication + content conflict detection (#92292)
- Fix: turbo-tasks-backend stability for task cancellation/error handling (#92254)

### 7. View Transitions API (via React 19)
- React 19's `<ViewTransition>` component integrates with Next.js routing
- Wrap route content in `<ViewTransition>` for GPU-accelerated page transitions
- Customize with CSS pseudo-elements: `::view-transition-old(name)`, `::view-transition-new(name)`
- Progressive enhancement — gracefully degrades to instant navigation on unsupported browsers

```tsx
import { unstable_ViewTransition as ViewTransition } from "react"

function Layout({ children }: { children: React.ReactNode }) {
  return <ViewTransition>{children}</ViewTransition>
}
```

## Project Configuration

```ts
// next.config.ts
const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
    optimizePackageImports: [
      "motion/react",
      "lucide-react",
      "@vercel/analytics",
      "@vercel/speed-insights",
      "@supabase/ssr",
      "@sentry/nextjs",
      "react-hook-form",
    ],
  },
  transpilePackages: ["@wongdigital/db", "@wongdigital/ui"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
}
```

## File Conventions

| Convention | Purpose |
|---|---|
| `proxy.ts` | Edge proxy (replaces middleware.ts) |
| `app/(storefront)/` | Storefront route group |
| `app/(dashboard)/` | Admin dashboard route group |
| `error.tsx` | Error boundary (must be `"use client"`) |
| `not-found.tsx` | 404 page |
| `loading.tsx` | Suspense fallback for route segments |

## Server Actions Pattern

```ts
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function myAction(formData: FormData) {
  // 1. Parse with Zod
  const parsed = schema.safeParse({ ... })
  if (!parsed.success) {
    // redirect or return error
  }

  // 2. Auth check
  await requireDashboardAdmin(returnTo)

  // 3. Perform mutation
  await saveToDB(parsed.data)

  // 4. Revalidate + redirect
  revalidatePath("/dashboard")
  redirect("/dashboard?success=Saved")
}
```

## Security Headers

Already configured in `next.config.ts`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Content-Security-Policy (Report-Only mode)
- Font caching: `Cache-Control: public, max-age=31536000, immutable`

## Performance Patterns

- `optimizePackageImports` for tree-shaking large packages (includes `lucide-react`)
- `content-visibility: auto` in CSS for off-screen sections
- Dynamic imports with `next/dynamic` for lazy-loaded checkout steps
- Image optimization: AVIF → WebP fallback, 30-day cache
- Font: `next/font/google` with `display: "swap"` — **Space Grotesk** (display), **Inter** (body), **JetBrains Mono** (mono)
- Skeleton loading states in `loading.tsx` for instant perceived performance
