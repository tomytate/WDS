import "server-only"

import type { User } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

import { createClient } from "@/utils/supabase/server"
import { hasSupabaseEnvConfig } from "@/utils/supabase/shared"

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function normalizeDashboardRedirectPath(value?: string) {
  if (!value) {
    return "/dashboard"
  }

  return value.startsWith("/dashboard") ? value : "/dashboard"
}

export function getDashboardAdminEmails() {
  const rawValue = process.env.DASHBOARD_ADMIN_EMAILS ?? ""

  return rawValue
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean)
}

export function isDashboardAdminEmail(email?: string | null) {
  if (!email) {
    return false
  }

  return getDashboardAdminEmails().includes(normalizeEmail(email))
}

export function hasDashboardAdminConfig() {
  return hasSupabaseEnvConfig() && getDashboardAdminEmails().length > 0
}

export function isDashboardDevelopmentBypassEnabled() {
  return process.env.NODE_ENV !== "production" && !hasDashboardAdminConfig()
}

export async function getAuthenticatedDashboardAdmin(): Promise<User | null> {
  if (!hasDashboardAdminConfig()) {
    return null
  }

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !isDashboardAdminEmail(user?.email)) {
    return null
  }

  return user
}

export async function requireDashboardAdmin(redirectPath?: string) {
  const developmentAccess = isDashboardDevelopmentBypassEnabled()

  if (developmentAccess) {
    return {
      admin: null,
      developmentAccess: true,
    }
  }

  const admin = await getAuthenticatedDashboardAdmin()

  if (!admin) {
    const loginPath = new URL("http://localhost/login")
    loginPath.searchParams.set(
      "redirect",
      normalizeDashboardRedirectPath(redirectPath),
    )

    redirect(`${loginPath.pathname}${loginPath.search}`)
  }

  return {
    admin,
    developmentAccess: false,
  }
}
