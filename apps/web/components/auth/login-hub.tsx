"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "motion/react"
import { LogIn, Shield, Mail, Loader2 } from "lucide-react"

import { Card, CardContent, Input, buttonStyles } from "@wongdigital/ui"

import { createClient } from "@/utils/supabase/client"

type LoginHubProps = {
  localDashboardBypass: boolean
  dashboardRedirectPath: string
  customerRedirectPath: string
  initialTab: "customer" | "admin"
  errorMessage: string | null
}

export function LoginHub({
  localDashboardBypass,
  dashboardRedirectPath,
  customerRedirectPath,
  initialTab,
  errorMessage,
}: LoginHubProps) {
  const [activeTab, setActiveTab] = useState<"customer" | "admin">(initialTab)

  return (
    <Card className="w-full max-w-lg relative overflow-hidden">
      <CardContent className="space-y-6 p-5 sm:p-8">
        {/* Tab Selector */}
        <div className="flex rounded-full border border-[--border] bg-[--bg-surface] p-1">
          <button
            className={`flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
              activeTab === "customer"
                ? "bg-[--accent] text-[--accent-fg] shadow-md shadow-[color-mix(in_srgb,var(--accent)_25%,transparent)]"
                : "text-[--text-secondary] hover:text-[--text-primary]"
            }`}
            onClick={() => setActiveTab("customer")}
            type="button"
          >
            <LogIn size={14} />
            Customer
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
              activeTab === "admin"
                ? "bg-[--accent] text-[--accent-fg] shadow-md shadow-[color-mix(in_srgb,var(--accent)_25%,transparent)]"
                : "text-[--text-secondary] hover:text-[--text-primary]"
            }`}
            onClick={() => setActiveTab("admin")}
            type="button"
          >
            <Shield size={14} />
            Admin
          </button>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div className="rounded-xl border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] px-4 py-3 text-sm text-[--color-danger]">
            {errorMessage}
          </div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "customer" ? (
            <motion.div
              key="customer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <CustomerAuthForm redirectPath={customerRedirectPath} />
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <AdminAuthForm
                localDashboardBypass={localDashboardBypass}
                redirectPath={dashboardRedirectPath}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Links */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className={buttonStyles({
              className: "justify-center",
              variant: "surface",
            })}
            href="/"
          >
            Back to Storefront
          </Link>
          <Link
            className={buttonStyles({
              className: "justify-center",
              variant: "ghost",
            })}
            href="/track"
          >
            Track an Order
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Customer Auth (Magic Link + Google SSO) ─── */

function CustomerAuthForm({ redirectPath }: { redirectPath: string }) {
  const [email, setEmail] = useState("")
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleGoogleSignIn() {
    setError(null)
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    })

    if (error) {
      setError(error.message)
    }
  }

  function handleMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      })

      if (otpError) {
        setError(otpError.message || "Failed to send magic link.")
        return
      }

      setMagicLinkSent(true)
    })
  }

  if (magicLinkSent) {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-[--accent]">
            Check Your Email
          </p>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
            Magic Link Sent ✨
          </h1>
          <p className="text-sm leading-7 text-[--text-secondary]">
            We sent a sign-in link to{" "}
            <strong className="text-[--text-primary]">{email}</strong>. Click
            the link in your email to access your account.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[--accent] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] px-4 py-3 text-sm text-[--text-primary]">
          <Mail size={16} className="shrink-0 text-[--accent]" />
          <span>Didn&apos;t receive it? Check your spam folder.</span>
        </div>
        <button
          className={buttonStyles({ className: "w-full justify-center", variant: "ghost" })}
          onClick={() => {
            setMagicLinkSent(false)
            setEmail("")
          }}
          type="button"
        >
          Try a different email
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.24em] text-[--accent]">
          Welcome
        </p>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
          Sign In to Your Account
        </h1>
        <p className="text-sm leading-7 text-[--text-secondary]">
          Access your orders, wallet balance, and manage your subscriptions.
        </p>
      </div>

      {/* Google SSO */}
      <button
        className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[--border] bg-[--bg-surface] text-sm font-medium text-[--text-primary] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--accent)_40%,var(--border))] hover:shadow-md active:scale-[0.98]"
        onClick={handleGoogleSignIn}
        type="button"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[--border]" />
        <span className="text-xs text-[--text-muted]">or sign in with email</span>
        <div className="h-px flex-1 bg-[--border]" />
      </div>

      {/* Magic Link */}
      <form className="space-y-4" onSubmit={handleMagicLink}>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-[--text-primary]"
            htmlFor="customer-email"
          >
            Email Address
          </label>
          <Input
            autoComplete="email"
            id="customer-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </div>

        {error && (
          <p className="rounded-xl border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] px-4 py-3 text-sm text-[--color-danger]">
            {error}
          </p>
        )}

        <button
          className={buttonStyles({ className: "w-full justify-center" })}
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Mail size={16} />
              Send Magic Link
            </>
          )}
        </button>
      </form>
    </div>
  )
}

/* ─── Admin Auth (Email + Password) ─── */

function AdminAuthForm({
  localDashboardBypass,
  redirectPath,
}: {
  localDashboardBypass: boolean
  redirectPath: string
}) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        setError(
          signInError.message || "Unable to sign in with those credentials.",
        )
        return
      }

      router.push(redirectPath)
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.24em] text-[--accent]">
          Admin Access
        </p>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
          Dashboard Login
        </h1>
        <p className="text-sm leading-7 text-[--text-secondary]">
          Sign in with your admin email and password to manage orders, products,
          customers, and store settings.
        </p>
      </div>

      {localDashboardBypass ? (
        <>
          <div className="rounded-2xl border border-[--accent] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-4 py-3 text-sm text-[--text-primary]">
            Local development bypass is active because Supabase dashboard auth is
            not fully configured in this environment yet.
          </div>
          <Link
            className={buttonStyles({ className: "justify-center" })}
            href={redirectPath}
          >
            Open Dashboard
          </Link>
        </>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-[--text-primary]"
              htmlFor="admin-email"
            >
              Email Address
            </label>
            <Input
              autoComplete="email"
              id="admin-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@wongdigital.shop"
              required
              type="email"
              value={email}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-[--text-primary]"
              htmlFor="admin-password"
            >
              Password
            </label>
            <Input
              autoComplete="current-password"
              id="admin-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              type="password"
              value={password}
            />
          </div>

          {error && (
            <p className="rounded-xl border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] px-4 py-3 text-sm text-[--color-danger]">
              {error}
            </p>
          )}

          <button
            className={buttonStyles({ className: "w-full justify-center" })}
            disabled={isPending}
            type="submit"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing In…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      )}
    </div>
  )
}
