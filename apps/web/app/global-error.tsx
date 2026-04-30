"use client"

import { useEffect } from "react"
import Image from "next/image"
import * as Sentry from "@sentry/nextjs"

import { buttonStyles } from "@wongdigital/ui"
import "@/app/globals.css"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Capture the exception with Sentry immediately
    Sentry.captureException(error)
    console.error("Global Error caught:", error)
  }, [error])

  return (
    <html lang="en">
      <body className="antialiased font-sans bg-[--bg-base] text-[--text-primary]">
        <div
          aria-live="polite"
          className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        >
          <div className="relative mb-8 aspect-[2/1] w-full max-w-xl">
            {/* Minimal fallback image or generic SVG if static assets fail to load */}
            <Image
              alt="500 Internal Server Error"
              className="object-contain"
              fill
              priority
              src="/kawaii/500.png"
            />
          </div>
          <h1 className="font-display mb-4 text-3xl tracking-tight text-[--text-primary] sm:text-4xl">
            Critical System Error
          </h1>
          <p className="mb-8 max-w-md text-lg leading-relaxed text-[--text-secondary]">
            Something fundamentally went wrong on our end. We&apos;ve been notified and are looking into it. Please try reloading the page.
          </p>
          <button
            className={buttonStyles({ className: "justify-center px-8", size: "lg" })}
            onClick={() => reset()}
            type="button"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  )
}
