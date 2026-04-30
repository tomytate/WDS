import "server-only"

import type { User } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

import { createClient } from "@/utils/supabase/server"
import { hasSupabaseEnvConfig } from "@/utils/supabase/shared"

import type { Customer } from "@wongdigital/db"

/**
 * Get the authenticated customer and their Supabase user.
 * Returns null if the user is not authenticated or has no linked customer row.
 */
export async function getAuthenticatedCustomer(): Promise<{
  user: User
  customer: Customer
} | null> {
  if (!hasSupabaseEnvConfig()) return null

  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return null

  // Fetch linked customer profile.
  // `customerRow` is reassigned below when we auto-create a profile; `customerError`
  // is read-only but we destructure them together, so the `let` binding applies to both.
  const lookup = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()
  let customerRow = lookup.data
  const customerError = lookup.error

  // Auto-create customer profile if it doesn't exist yet
  // (fallback for when the on_auth_user_created trigger is missing in production)
  if (!customerRow && !customerError) {
    const displayName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "Customer"

    // Try to find an existing customer row by email first (could have been
    // created as a guest checkout) and link it to this auth user.
    const { data: existingByEmail } = await supabase
      .from("customers")
      .select("*")
      .eq("email", user.email!)
      .maybeSingle()

    if (existingByEmail) {
      // Link the existing customer to the auth user
      await supabase
        .from("customers")
        .update({ user_id: user.id })
        .eq("id", existingByEmail.id)
      customerRow = { ...existingByEmail, user_id: user.id }
    } else {
      // Create a brand-new customer profile
      const { data: newRow, error: insertError } = await supabase
        .from("customers")
        .insert({
          user_id: user.id,
          email: user.email!,
          name: displayName,
        })
        .select("*")
        .single()

      if (insertError) {
        console.error("[customer-auth] Failed to auto-create customer profile:", insertError.message)
        return null
      }

      customerRow = newRow
    }
  }

  if (customerError || !customerRow) return null

  const customer: Customer = {
    id: customerRow.id,
    userId: customerRow.user_id ?? null,
    name: customerRow.name,
    email: customerRow.email,
    phone: customerRow.phone ?? null,
    walletBalance: String(customerRow.wallet_balance ?? "0.00"),
    customerTier: customerRow.customer_tier ?? "standard",
    referralCode: customerRow.referral_code ?? null,
    referredBy: customerRow.referred_by ?? null,
    totalSpent: String(customerRow.total_spent ?? "0.00"),
    createdAt: new Date(customerRow.created_at),
  }

  return { user, customer }
}

/**
 * Require an authenticated customer to access the route.
 * Redirects to `/login` with the current path as the redirect target.
 */
export async function requireCustomer(redirectPath = "/account") {
  const result = await getAuthenticatedCustomer()

  if (!result) {
    const loginPath = new URL("http://localhost/login")
    loginPath.searchParams.set("redirect", redirectPath)
    redirect(`${loginPath.pathname}${loginPath.search}`)
  }

  return result
}
