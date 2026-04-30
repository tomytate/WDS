import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { updateSupabaseSession } from "@/utils/supabase/middleware"

export async function proxy(request: NextRequest) {
  let response = NextResponse.next()

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      response = await updateSupabaseSession(request)
    } catch {
      response = NextResponse.next()
    }
  }

  // Geo-Pricing logic
  const country = request.headers.get("x-vercel-ip-country") ?? "US"
  const hasOverride = request.cookies.get("user_currency_override")
  if (!hasOverride) {
    response.cookies.set("geo_country", country, {
      httpOnly: false,    // readable by client JS for price display
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
