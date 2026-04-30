import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import { getSupabaseEnv } from "./shared"

type ResponseCookieOptions = Parameters<
  ReturnType<typeof NextResponse.next>["cookies"]["set"]
>[2]
type CookieMutation = {
  name: string
  options?: ResponseCookieOptions
  value: string
}

export async function updateSupabaseSession(request: NextRequest) {
  const { supabasePublishableKey, supabaseUrl } = getSupabaseEnv()

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieMutation[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

        response = NextResponse.next({
          request,
        })

        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  await supabase.auth.getUser()

  return response
}
