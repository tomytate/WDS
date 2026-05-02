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
    <section className="container-shell py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Page Header */}
        <div className="space-y-4 border-b border-[--border] pb-8">
          <div className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-card] text-[--text-primary]">
              <PackageSearch size={16} />
            </span>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[--text-muted]">
              / Track an order
            </p>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.05] tracking-[-0.025em]">
            Where&apos;s my order?
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-[--text-secondary]">
            Enter your order code or checkout email to check delivery status instantly.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-[--radius-inner] border border-[--border] bg-[--bg-card] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[--text-secondary]">
              <Clock size={11} className="text-[--text-muted]" aria-hidden="true" />
              {handlingHoursLabel}
            </span>
            <a
              className="inline-flex items-center gap-1.5 rounded-[--radius-inner] border border-[--border] bg-[--bg-card] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[--text-secondary] transition-colors hover:border-[--text-primary] hover:text-[--text-primary]"
              href={`mailto:${storeSettings.supportEmail}`}
            >
              <Mail size={11} aria-hidden="true" />
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
    <section className="container-shell py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-3 border-b border-[--border] pb-8 animate-pulse">
          <div className="h-9 w-9 rounded-[--radius-inner] bg-[--bg-surface]" />
          <div className="h-10 w-64 rounded-[--radius-inner] bg-[--bg-surface]" />
          <div className="h-5 w-80 rounded-[--radius-inner] bg-[--bg-surface]" />
        </div>
        <div className="h-[300px] rounded-[--radius-card] border border-[--border] bg-[--bg-card] animate-pulse" />
      </div>
    </section>
  )
}
