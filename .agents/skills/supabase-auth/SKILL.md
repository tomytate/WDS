---
description: Supabase Auth SSR patterns for Next.js App Router with cookie-based session management
---

# Supabase Auth (@supabase/ssr 0.10) — Reference Guide

## Architecture

Supabase Auth uses **cookie-based sessions** in SSR/App Router.
Three client types are needed for different contexts:

### 1. Server Client (Server Components, Actions, Route Handlers)
```ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })
}
```

### 2. Browser Client (Client Components)
```ts
import { createBrowserClient } from "@supabase/ssr"

export function createSupabaseBrowser() {
  return createBrowserClient(url, key)
}
```

### 3. Proxy Client (proxy.ts — session refresh)
```ts
import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  await supabase.auth.getUser()
  return response
}
```

## Auth Guard Pattern

```ts
export async function requireDashboardAdmin(redirectTo: string) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`)
  }

  return user
}
```

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJ...
```

## Best Practices
1. **Always use `getUser()`** not `getSession()` — `getUser()` validates the JWT server-side
2. **Refresh session in proxy.ts** — runs on every dashboard request
3. **Use `createServerClient`** for any server-side code (actions, API routes)
4. **Use `createBrowserClient`** only in `"use client"` components
5. **Guard server actions** — call `requireDashboardAdmin()` before every mutation
