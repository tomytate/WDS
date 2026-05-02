"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Card, CardContent, FieldWrapper, Input, buttonStyles } from "@wongdigital/ui"

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
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[--accent-strong] mb-3">
            / Admin access
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em]">
            Dashboard sign in.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[--text-secondary]">
            Sign in with your admin email and password to manage orders, products,
            customers, and store settings.
          </p>
        </div>

        {localDashboardBypass ? (
          <div className="rounded-[--radius-inner] border border-[--text-primary] bg-[--accent] px-4 py-3 text-sm font-medium text-[--accent-fg]">
            Local development bypass is active because Supabase dashboard auth is not fully configured in this environment yet.
          </div>
        ) : null}

        {!localDashboardBypass ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FieldWrapper htmlFor="email" label="Email address">
              <Input
                autoComplete="email"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@wongdigital.shop"
                required
                type="email"
                value={email}
              />
            </FieldWrapper>

            <FieldWrapper htmlFor="password" label="Password">
              <Input
                autoComplete="current-password"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type="password"
                value={password}
              />
            </FieldWrapper>

            {error ? (
              <p className="rounded-[--radius-inner] border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-2.5 text-sm font-medium text-[--color-danger-text]">
                {error}
              </p>
            ) : null}

            <button
              className={buttonStyles({ className: "w-full justify-center" })}
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : (
          <Link
            className={buttonStyles({ className: "w-full justify-center" })}
            href={redirectPath}
          >
            Open Dashboard
          </Link>
        )}

        <div className="flex flex-col gap-3 sm:flex-row pt-2 border-t border-[--border]">
          <Link
            className={buttonStyles({
              className: "justify-center flex-1",
              variant: "surface",
            })}
            href="/"
          >
            Back to storefront
          </Link>
          <Link
            className={buttonStyles({
              className: "justify-center flex-1",
              variant: "ghost",
            })}
            href="/track"
          >
            Track an order
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
