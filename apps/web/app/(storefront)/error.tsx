"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import * as Sentry from "@sentry/nextjs"

import { buttonStyles } from "@wongdigital/ui"

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error("Storefront error:", error)
  }, [error])

  return (
    <div
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center"
    >
      <div className="relative mb-8 aspect-[2/1] w-full max-w-md">
        <Image
          alt="Something went wrong"
          className="object-contain"
          fill
          priority
          src="/kawaii/500.png"
        />
      </div>
      <h1 className="font-display mb-3 text-2xl tracking-tight text-[--text-primary] sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mb-6 max-w-md text-base leading-relaxed text-[--text-secondary]">
        We hit an unexpected issue loading this page. Please try again or browse our catalog.
      </p>
      <div className="flex gap-3">
        <button
          className={buttonStyles({ className: "justify-center px-6", size: "md" })}
          onClick={() => reset()}
          type="button"
        >
          Try Again
        </button>
        <Link
          className={buttonStyles({ className: "justify-center px-6", variant: "ghost", size: "md" })}
          href="/"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
