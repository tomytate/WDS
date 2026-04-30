import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { getSupabaseEnv } from "./shared"

type CookieStore = Awaited<ReturnType<typeof cookies>>
type CookieOptions = Parameters<CookieStore["set"]>[2]
type CookieMutation = {
  name: string
  options?: CookieOptions
  value: string
}

export async function createClient() {
  const { supabasePublishableKey, supabaseUrl } = getSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieMutation[]) {
        try {
          cookiesToSet.forEach(({ name, options, value }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Server Components can't always set cookies directly.
          // The proxy-based session refresh path handles that case.
        }
      },
    },
  })
}
