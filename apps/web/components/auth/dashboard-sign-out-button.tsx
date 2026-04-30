"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { buttonStyles } from "@wongdigital/ui"

import { createClient } from "@/utils/supabase/client"

export function DashboardSignOutButton() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSignOut() {
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        setError("Unable to sign out right now.")
        return
      }

      router.push("/login")
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <button
        className={buttonStyles({
          className: "justify-center",
          variant: "ghost",
        })}
        disabled={isPending}
        onClick={handleSignOut}
        type="button"
      >
        {isPending ? "Signing Out..." : "Sign Out"}
      </button>
      {error ? (
        <p className="text-xs text-[--color-danger]">{error}</p>
      ) : null}
    </div>
  )
}
