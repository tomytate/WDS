import Image from "next/image"
import Link from "next/link"

import { buttonStyles } from "@wongdigital/ui"

export default function NotFound() {
  return (
    <div
      aria-live="polite"
      className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center"
    >
      <div className="relative mb-8 aspect-[2/1] w-full max-w-xl">
        <Image
          alt="404 Not Found"
          className="object-contain"
          fill
          priority
          src="/kawaii/404.png"
        />
      </div>
      <h1 className="font-display mb-4 text-3xl tracking-tight text-[--text-primary] sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mb-8 max-w-md text-lg leading-relaxed text-[--text-secondary]">
        Oops! We couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
      </p>
      <Link
        className={buttonStyles({ className: "justify-center px-8", size: "lg" })}
        href="/"
      >
        Return to Storefront
      </Link>
    </div>
  )
}
