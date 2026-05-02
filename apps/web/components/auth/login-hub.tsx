"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "motion/react"
import { LogIn, Shield, Mail, Loader2, ArrowRight } from "lucide-react"

import { Card, FieldWrapper, Input, buttonStyles } from "@wongdigital/ui"

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
    <div className="grid w-full max-w-5xl grid-cols-1 gap-0 overflow-hidden rounded-[--radius-card] border border-[--border] bg-[--bg-card] lg:grid-cols-[5fr_4fr]">
      {/* Editorial side panel */}
      <aside className="ink-block hidden lg:flex flex-col justify-between p-10 xl:p-12">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[--accent] mb-6">
            / Wong Digital
          </p>
          <h2 className="font-display text-4xl xl:text-5xl font-semibold leading-[0.95] tracking-[-0.025em] text-[--text-on-ink]">
            Premium digital tools, delivered{" "}
            <span className="text-[--accent]">in hours.</span>
          </h2>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-[--text-on-ink] opacity-75">
            Sign in to manage your subscriptions, track orders, and access your
            wallet balance.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-px bg-[color-mix(in_srgb,var(--text-on-ink)_14%,transparent)] border border-[color-mix(in_srgb,var(--text-on-ink)_14%,transparent)] rounded-[--radius-inner] overflow-hidden">
          <div className="bg-[--bg-ink] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-on-ink] opacity-60">
              Orders
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-[--text-on-ink] tabular-nums">
              240K+
            </p>
          </div>
          <div className="bg-[--bg-ink] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-on-ink] opacity-60">
              Avg delivery
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-[--text-on-ink] tabular-nums">
              2–6h
            </p>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <div className="p-6 sm:p-10 xl:p-12 flex flex-col justify-center">
        {/* Tab Selector */}
        <div className="inline-flex rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] p-1 self-start mb-7">
          <button
            className={`flex items-center gap-2 rounded-[calc(var(--radius-inner)-2px)] px-4 py-2 text-sm font-medium tracking-tight transition-colors duration-150 ${
              activeTab === "customer"
                ? "bg-[--text-primary] text-[--bg-base]"
                : "text-[--text-secondary] hover:text-[--text-primary]"
            }`}
            onClick={() => setActiveTab("customer")}
            type="button"
          >
            <LogIn size={13} />
            Customer
          </button>
          <button
            className={`flex items-center gap-2 rounded-[calc(var(--radius-inner)-2px)] px-4 py-2 text-sm font-medium tracking-tight transition-colors duration-150 ${
              activeTab === "admin"
                ? "bg-[--text-primary] text-[--bg-base]"
                : "text-[--text-secondary] hover:text-[--text-primary]"
            }`}
            onClick={() => setActiveTab("admin")}
            type="button"
          >
            <Shield size={13} />
            Admin
          </button>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-[--radius-inner] border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-3 text-sm font-medium text-[--color-danger-text]">
            {errorMessage}
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "customer" ? (
            <motion.div
              key="customer"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.18 }}
            >
              <CustomerAuthForm redirectPath={customerRedirectPath} />
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
            >
              <AdminAuthForm
                localDashboardBypass={localDashboardBypass}
                redirectPath={dashboardRedirectPath}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-[--border] flex flex-col gap-2 sm:flex-row sm:gap-4 text-sm">
          <Link
            className="inline-flex items-center gap-1.5 text-[--text-secondary] transition-colors hover:text-[--text-primary]"
            href="/"
          >
            ← Back to storefront
          </Link>
          <span className="hidden sm:inline text-[--border]">·</span>
          <Link
            className="inline-flex items-center gap-1.5 text-[--text-secondary] transition-colors hover:text-[--text-primary]"
            href="/track"
          >
            Track an order
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ─── Customer Auth ─── */

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
      <div className="space-y-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[--accent-strong] mb-3">
            / Check your email
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em]">
            Magic link sent.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[--text-secondary]">
            We sent a sign-in link to{" "}
            <strong className="text-[--text-primary]">{email}</strong>. Click the
            link to access your account.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] px-4 py-3 text-sm text-[--text-secondary]">
          <Mail size={14} className="shrink-0" />
          <span>Didn&apos;t receive it? Check your spam folder.</span>
        </div>
        <button
          className={buttonStyles({
            className: "w-full justify-center",
            variant: "ghost",
          })}
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
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[--accent-strong] mb-3">
          / Welcome back
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.02em]">
          Sign in to your account.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[--text-secondary]">
          Access orders, wallet balance, and manage subscriptions.
        </p>
      </div>

      <button
        className="group flex h-11 w-full items-center justify-center gap-3 rounded-[--radius-inner] border border-[--border] bg-[--bg-card] text-sm font-medium text-[--text-primary] transition-colors hover:border-[--text-primary]"
        onClick={handleGoogleSignIn}
        type="button"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
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

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[--border]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
          or email
        </span>
        <div className="h-px flex-1 bg-[--border]" />
      </div>

      <form className="space-y-4" onSubmit={handleMagicLink}>
        <FieldWrapper htmlFor="customer-email" label="Email address">
          <Input
            autoComplete="email"
            id="customer-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </FieldWrapper>

        {error && (
          <p className="rounded-[--radius-inner] border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-2.5 text-sm font-medium text-[--color-danger-text]">
            {error}
          </p>
        )}

        <button
          className={buttonStyles({ className: "w-full justify-center gap-2" })}
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Mail size={14} />
              Send magic link
            </>
          )}
        </button>
      </form>
    </div>
  )
}

/* ─── Admin Auth ─── */

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
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[--accent-strong] mb-3">
          / Admin access
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.02em]">
          Dashboard sign in.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[--text-secondary]">
          Manage orders, products, customers, and store settings.
        </p>
      </div>

      {localDashboardBypass ? (
        <>
          <div className="rounded-[--radius-inner] border border-[--text-primary] bg-[--accent] px-4 py-3 text-sm font-medium text-[--accent-fg]">
            Local development bypass is active because Supabase dashboard auth is
            not fully configured in this environment yet.
          </div>
          <Link
            className={buttonStyles({
              className: "w-full justify-center gap-2",
            })}
            href={redirectPath}
          >
            Open Dashboard
            <ArrowRight size={14} />
          </Link>
        </>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FieldWrapper htmlFor="admin-email" label="Email address">
            <Input
              autoComplete="email"
              id="admin-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@wongdigital.shop"
              required
              type="email"
              value={email}
            />
          </FieldWrapper>

          <FieldWrapper htmlFor="admin-password" label="Password">
            <Input
              autoComplete="current-password"
              id="admin-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              type="password"
              value={password}
            />
          </FieldWrapper>

          {error && (
            <p className="rounded-[--radius-inner] border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-2.5 text-sm font-medium text-[--color-danger-text]">
              {error}
            </p>
          )}

          <button
            className={buttonStyles({ className: "w-full justify-center gap-2" })}
            disabled={isPending}
            type="submit"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}

// Card import retained for backwards-compat
void Card
