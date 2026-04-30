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
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]">
          <AlertCircle size={32} className="text-[--color-danger] mb-4" />
          <h1 className="font-display text-2xl tracking-tight text-[--text-primary] mb-2">Order Not Found</h1>
          <p className="text-[--text-secondary]">
            We couldn't find an order matching that code.
          </p>
        </div>
      </div>
    )
  }

  // lookupOrdersByCode handles mapping internally safely
  const order = orders[0]
  if (!order) return notFound()

  if (order.status !== "delivered" && order.status !== "completed") {
    return (
      <div className="container-shell max-w-lg py-12">
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-[--accent] bg-[--accent-tint-soft]">
          <MessageSquare size={32} className="text-[--accent] mb-4" />
          <h1 className="font-display text-2xl tracking-tight text-[--text-primary] mb-2">Order In Progress</h1>
          <p className="text-[--text-secondary]">
            We're still working on this order! Reviews can be submitted once it's delivered.
          </p>
        </div>
      </div>
    )
  }

  // NOTE: In a real system, we'd also check if a review already exists for this order.
  // For simplicity, we just allow submission and we could overwrite or just insert duplicates.

  return (
    <div className="container-shell max-w-lg py-12 sm:py-20 lg:py-24">
      <div className="space-y-8 animate-fade-in-up-lg">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[--accent-tint-soft] text-[--accent] shadow-[0_4px_24px_var(--accent-tint-medium)]">
            <MessageSquare size={24} strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-[--text-primary]">
            Rate Your Experience
          </h1>
          <p className="text-sm sm:text-base text-[--text-secondary] max-w-sm mx-auto">
            Order <span className="font-mono text-[--text-primary] font-medium">{order.orderCode}</span>
          </p>
        </div>

        <div className="rounded-2xl sm:rounded-[32px] border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-[--bg-card] p-6 sm:p-8 shadow-xl shadow-[--accent-tint-faint] filter backdrop-blur-3xl">
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
