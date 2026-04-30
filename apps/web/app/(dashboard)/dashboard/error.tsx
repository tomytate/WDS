"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"

import { buttonStyles } from "@wongdigital/ui"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center"
    >
      <div className="mb-6 rounded-full bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] p-4">
        <svg className="h-8 w-8 text-[--color-error]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h1 className="font-display mb-3 text-2xl tracking-tight text-[--text-primary]">
        Dashboard Error
      </h1>
      <p className="mb-6 max-w-md text-base leading-relaxed text-[--text-secondary]">
        Something went wrong loading this section. Your data is safe — please try refreshing.
      </p>
      <button
        className={buttonStyles({ className: "justify-center px-6", size: "md" })}
        onClick={() => reset()}
        type="button"
      >
        Retry
      </button>
    </div>
  )
}
