import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LoginHub } from "@/components/auth/login-hub"
import {
  getAuthenticatedDashboardAdmin,
  isDashboardDevelopmentBypassEnabled,
  normalizeDashboardRedirectPath,
} from "@/lib/dashboard-auth"
import { getAuthenticatedCustomer } from "@/lib/customer-auth"

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Wong Digital account to manage your orders, wallet balance, and subscriptions.",
}

type LoginPageProps = {
  searchParams: Promise<{
    redirect?: string
    error?: string
    tab?: string
  }>
}

export const dynamic = "force-dynamic"

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams
  const redirectPath = resolvedSearchParams.redirect ?? "/account"
  const dashboardRedirectPath = normalizeDashboardRedirectPath(
    resolvedSearchParams.redirect,
  )
  const localDashboardBypass = isDashboardDevelopmentBypassEnabled()
  const errorMessage = resolvedSearchParams.error
    ? "Authentication failed. Please try again."
    : null
  const initialTab =
    resolvedSearchParams.tab === "admin" ? "admin" : "customer"

  // If already authenticated as admin, go to dashboard
  if (!localDashboardBypass) {
    const admin = await getAuthenticatedDashboardAdmin()
    if (admin && initialTab === "admin") {
      redirect(dashboardRedirectPath)
    }
  }

  // If already authenticated as customer, go to account
  const existingCustomer = await getAuthenticatedCustomer()
  if (existingCustomer && initialTab === "customer") {
    redirect(redirectPath.startsWith("/") ? redirectPath : "/account")
  }

  return (
    <main className="relative container-shell flex min-h-screen items-center justify-center py-10">
      {/* Background mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[70%] w-[70%] rounded-full bg-[--accent-tint-soft] blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[60%] w-[60%] rounded-full bg-[--accent-tint-soft] blur-[100px]" />
      </div>
      <LoginHub
        localDashboardBypass={localDashboardBypass}
        dashboardRedirectPath={dashboardRedirectPath}
        customerRedirectPath={redirectPath}
        initialTab={initialTab}
        errorMessage={errorMessage}
      />
    </main>
  )
}
