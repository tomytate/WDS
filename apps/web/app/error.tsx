"use client"

import { useEffect } from "react"
import Image from "next/image"
import * as Sentry from "@sentry/nextjs"

import { buttonStyles } from "@wongdigital/ui"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error("Internal Server Error caught by boundary:", error)
  }, [error])

  return (
    <div
      aria-live="polite"
      className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center"
    >
      <div className="relative mb-8 aspect-[2/1] w-full max-w-xl">
        <Image
          alt="500 Internal Server Error"
          className="object-contain"
          fill
          priority
          src="/kawaii/500.png"
        />
      </div>
      <h1 className="font-display mb-4 text-3xl tracking-tight text-[--text-primary] sm:text-4xl">
        Internal Server Error
      </h1>
      <p className="mb-8 max-w-md text-lg leading-relaxed text-[--text-secondary]">
        Something went wrong on our end. We&apos;re looking into it. Please try again or check back later.
      </p>
      <button
        className={buttonStyles({ className: "justify-center px-8", size: "lg" })}
        onClick={() => reset()}
        type="button"
      >
        Try Again
      </button>
    </div>
  )
}
