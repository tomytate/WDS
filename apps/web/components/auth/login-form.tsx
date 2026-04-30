"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Card, CardContent, Input, buttonStyles } from "@wongdigital/ui"

import { createClient } from "@/utils/supabase/client"

type LoginFormProps = {
  localDashboardBypass: boolean
  redirectPath: string
}

export function LoginForm({
  localDashboardBypass,
  redirectPath,
}: LoginFormProps) {
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
    <Card className="w-full max-w-lg">
      <CardContent className="space-y-6 p-5 sm:p-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-[--accent]">Admin Access</p>
          <h1 className="font-display text-3xl tracking-tight sm:text-5xl">Dashboard Login</h1>
          <p className="text-sm leading-7 text-[--text-secondary]">
            Sign in with your admin email and password to manage orders, products,
            customers, and store settings.
          </p>
        </div>

        {localDashboardBypass ? (
          <div className="rounded-2xl border border-[--accent] bg-[--accent-tint-soft] px-4 py-3 text-sm text-[--text-primary]">
            Local development bypass is active because Supabase dashboard auth is not fully configured in this environment yet.
          </div>
        ) : null}

        {!localDashboardBypass ? (
          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-[--text-primary]"
                htmlFor="email"
              >
                Email Address
              </label>
              <Input
                autoComplete="email"
                id="email"
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
                htmlFor="password"
              >
                Password
              </label>
              <Input
                autoComplete="current-password"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type="password"
                value={password}
              />
            </div>

            {error ? (
              <p className="rounded-xl border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] px-4 py-3 text-sm text-[--color-danger]">
                {error}
              </p>
            ) : null}

            <button
              className={buttonStyles({ className: "w-full justify-center" })}
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Signing In..." : "Sign In"}
            </button>
          </form>
        ) : (
          <Link
            className={buttonStyles({ className: "justify-center" })}
            href={redirectPath}
          >
            Open Dashboard
          </Link>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className={buttonStyles({
              className: "justify-center",
              variant: localDashboardBypass ? "ghost" : "surface",
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
