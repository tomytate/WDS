import { notFound } from "next/navigation"
import { lookupOrdersByCode } from "@wongdigital/db/storefront"
import { MessageSquare, AlertCircle } from "lucide-react"

import { ReviewForm } from "./review-form"

export const metadata = {
  title: "Submit a Review",
  description: "Share your experience with Wong Digital Shop",
}

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams

  if (!code) {
    return notFound()
  }

  const orders = await lookupOrdersByCode(code.trim().toUpperCase())

  if (!orders || orders.length === 0) {
    return (
      <div className="container-shell max-w-lg py-12">
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-[--radius-card] border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]">
          <AlertCircle size={28} className="text-[--color-danger] mb-4" />
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[--color-danger-text] mb-2">
            Order not found.
          </h1>
          <p className="text-sm text-[--text-secondary]">
            We couldn&apos;t find an order matching that code.
          </p>
        </div>
      </div>
    )
  }

  const order = orders[0]
  if (!order) return notFound()

  if (order.status !== "delivered" && order.status !== "completed") {
    return (
      <div className="container-shell max-w-lg py-12">
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-[--radius-card] border border-[--text-primary] bg-[--bg-card]">
          <MessageSquare size={28} className="text-[--accent-strong] mb-4" />
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[--text-primary] mb-2">
            Order in progress.
          </h1>
          <p className="text-sm text-[--text-secondary]">
            We&apos;re still working on this order! Reviews can be submitted once it&apos;s delivered.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-shell max-w-lg py-12 sm:py-20 lg:py-24">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[--radius-inner] border border-[--text-primary] bg-[--bg-card] text-[--text-primary]">
            <MessageSquare size={20} strokeWidth={1.75} />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[--text-muted]">
            / Customer review
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-[--text-primary]">
            Rate your experience.
          </h1>
          <p className="text-sm sm:text-base text-[--text-secondary] max-w-sm mx-auto">
            Order{" "}
            <span className="font-mono text-[--text-primary] font-medium">
              {order.orderCode}
            </span>
          </p>
        </div>

        <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-6 sm:p-8">
          <ReviewForm
            orderId={order.id}
            customerName={order.customerName}
            customerEmail={order.customerEmail}
          />
        </div>
      </div>
    </div>
  )
}
