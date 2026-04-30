import { Suspense } from "react"
import type { Metadata } from "next"
import { PackageSearch, Clock, Mail } from "lucide-react"

import { getStoreSettings } from "@wongdigital/db/storefront"

import { Footer } from "@/components/storefront/footer"
import { Navbar } from "@/components/storefront/navbar"
import { TrackOrderForm } from "@/components/storefront/track-order-form"
import { handlingHoursLabel } from "@/lib/urgency"

export const metadata: Metadata = {
  title: "Track Order",
  description: "Check the delivery status of your Wong Digital Shop order using your order code or email address.",
  alternates: {
    canonical: "/track",
  },
}

type TrackPageProps = {
  searchParams: Promise<{
    orderCode?: string
  }>
}

export default function TrackPage({ searchParams }: TrackPageProps) {
  return (
    <main>
      <Navbar />
      <Suspense fallback={<TrackPageFallback />}>
        <TrackPageContent searchParams={searchParams} />
      </Suspense>
      <Footer />
    </main>
  )
}

async function TrackPageContent({ searchParams }: TrackPageProps) {
  const resolvedSearchParams = await searchParams
  const storeSettings = await getStoreSettings()

  return (
    <section className="container-shell py-6 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-4xl space-y-5 sm:space-y-8">
        {/* Page Header */}
        <div className="relative space-y-3 sm:space-y-4 text-center">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-32 w-64 rounded-full bg-[--accent-tint-soft] blur-3xl" aria-hidden="true" />

          <div className="relative flex justify-center">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[--accent-tint-medium] to-[--accent-tint-soft] text-[--accent] shadow-[0_4px_16px_var(--accent-tint-medium)]">
              <PackageSearch className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
          </div>

          <h1 className="relative font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl">
            Track Your Order
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-[--text-secondary] sm:text-base sm:leading-7">
            Enter your order code or checkout email to check delivery status instantly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_80%,transparent)] px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs text-[--text-secondary]">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[--text-muted]" aria-hidden="true" />
              {handlingHoursLabel}
            </span>
            <a
              className="inline-flex items-center gap-1.5 rounded-full border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_80%,transparent)] px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs text-[--accent] transition-colors hover:border-[--accent] hover:bg-[--accent-tint-soft]"
              href={`mailto:${storeSettings.supportEmail}`}
            >
              <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden="true" />
              {storeSettings.supportEmail}
            </a>
          </div>
        </div>

        <TrackOrderForm
          initialOrderCode={resolvedSearchParams.orderCode}
          supportEmail={storeSettings.supportEmail}
        />
      </div>
    </section>
  )
}

function TrackPageFallback() {
  return (
    <section className="container-shell py-6 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-4xl space-y-5 sm:space-y-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[--bg-card]" />
          <div className="mx-auto h-10 w-64 rounded-2xl bg-[--bg-card]" />
          <div className="mx-auto h-5 w-80 rounded-xl bg-[--bg-card]" />
        </div>
        <div className="h-[300px] rounded-2xl sm:rounded-2xl border border-[--border] bg-[--bg-card] animate-pulse" />
      </div>
    </section>
  )
}
