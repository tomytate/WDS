import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/utils/supabase/server"

/**
 * Supabase PKCE Auth Callback
 *
 * Handles the redirect from Supabase OAuth or Magic Link flows.
 * Exchanges the one-time `code` for a session, then redirects to
 * the requested `next` URL (defaults to /account).
 */
export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/account"
  
  // Resolve true origin in Vercel
  const forwardedHost = request.headers.get("x-forwarded-host")
  const trueOrigin = forwardedHost ? `https://${forwardedHost}` : requestUrl.origin
  
  const errorRedirect = new URL(`/login?error=auth_callback_failed`, trueOrigin)

  if (!code) {
    return NextResponse.redirect(errorRedirect)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("[auth/callback] Session exchange failed:", error.message)
    return NextResponse.redirect(errorRedirect)
  }

  // Handle Referral Code (if present in cookies)
  const { data: { user: verifiedUser } } = await supabase.auth.getUser()
  
  if (verifiedUser) {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const referralCode = cookieStore.get("wds_referral_code")?.value

    if (referralCode) {
      try {
        // 1. Get the current customer profile
        const { data: currentCustomer } = await supabase
          .from("customers")
          .select("id, referred_by")
          .eq("user_id", verifiedUser.id)
          .single()
          
        // 2. Only proceed if customer exists and hasn't been referred yet
        if (currentCustomer && !currentCustomer.referred_by) {
          // 3. Find the referrer by code
          const { data: referrer } = await supabase
            .from("customers")
            .select("id")
            .eq("referral_code", referralCode)
            .single()

          // 4. Update the current customer if a valid referrer was found (and not self-referring)
          if (referrer && referrer.id !== currentCustomer.id) {
            await supabase
              .from("customers")
              .update({ referred_by: referrer.id })
              .eq("id", currentCustomer.id)
          }
        }
        
        // 5. Always clear the cookie after processing Attempt
        cookieStore.delete("wds_referral_code")
      } catch (err) {
        console.error("[auth/callback] Failed to process referral:", err)
      }
    }
  }

  // Successful auth — redirect to the requested page
  const forwardPath = next.startsWith("/") ? next : "/account"
  const forwardUrl = new URL(forwardPath, trueOrigin)
  return NextResponse.redirect(forwardUrl)
}
