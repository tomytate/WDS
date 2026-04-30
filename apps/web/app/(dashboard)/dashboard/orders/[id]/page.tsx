import Link from "next/link"
import { ArrowLeft, ExternalLink, Package } from "lucide-react"
import { notFound } from "next/navigation"

import { getOrderById } from "@wongdigital/db/storefront"
import { Button, buttonStyles, PageHeader } from "@wongdigital/ui"

import { StatusBadge } from "@/components/dashboard/status-badge"
import { NoticeBanner } from "@/components/dashboard/notice-banner"
import { requireDashboardAdmin } from "@/lib/dashboard-auth"
import { decodePrivateReceiptPath } from "@/lib/vercel/blob"
import { formatDate, formatOrderItemSummary, formatPrice, orderTimeline, statusLabel } from "@/lib/format"
import { updateOrderStatusAction, deleteOrderAction } from "@/app/(dashboard)/dashboard/actions"

function getReceiptHref(receiptPath: string) {
  const privatePathname = decodePrivateReceiptPath(receiptPath)
  if (privatePathname) return `/api/admin/receipt?pathname=${encodeURIComponent(privatePathname)}`
  return receiptPath
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  await requireDashboardAdmin()
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const order = await getOrderById(id)

  if (!order) notFound()

  const returnTo = `/dashboard/orders/${id}`
  const currentStatusIndex = orderTimeline.indexOf(order.status)
  const nextStatuses = order.status === "cancelled"
    ? []
    : orderTimeline.filter((_, idx) => idx > currentStatusIndex)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          aria-label="Back to orders"
          className={buttonStyles({ variant: "ghost", className: "gap-1.5 text-xs px-3" })}
          href="/dashboard/orders"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to orders
        </Link>
      </div>

      <PageHeader
        eyebrow="Order detail"
        icon={<Package size={20} />}
        title={order.orderCode}
        description={`Placed ${formatDate(order.createdAt)} · ${order.customerName}`}
        actions={<StatusBadge status={order.status} />}
      />

      <NoticeBanner
        error={resolvedSearchParams.error}
        success={resolvedSearchParams.success}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Order Summary */}
        <div className="rounded-xl border border-[--border] bg-[--bg-surface] p-5 lg:col-span-2">
          <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                className="flex items-start justify-between gap-3 rounded-lg border border-[--border] bg-[--bg-card] p-4"
                key={item.id}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[--text-primary]">{item.product.name}</p>
                  <p className="mt-1 text-xs text-[--text-secondary]">
                    {formatOrderItemSummary(item)}
                  </p>
                  {item.targetUrl ? (
                    <a
                      className="mt-1 inline-flex items-center gap-1 text-xs text-[--accent] hover:underline"
                      href={item.targetUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLink size={10} aria-hidden="true" />
                      {item.targetUrl}
                    </a>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm font-semibold text-[--text-primary]">
                  {formatPrice(item.unitPrice)}
                </p>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="mt-5 space-y-2 border-t border-[--border] pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-[--text-secondary]">Subtotal</span>
              <span className="text-[--text-primary]">{formatPrice(order.subtotalPrice)}</span>
            </div>
            {Number(order.tipAmount) > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-[--text-secondary]">Tip</span>
                <span className="text-[--text-primary]">{formatPrice(order.tipAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-[--text-primary]">Total</span>
              <span className="text-[--accent]">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status Actions */}
          <div className="rounded-xl border border-[--border] bg-[--bg-surface] p-5">
            <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">Update status</h2>
            {nextStatuses.length > 0 ? (
              <div className="space-y-2">
                {nextStatuses.map((nextStatus) => (
                  <form
                    action={updateOrderStatusAction}
                    key={nextStatus}
                  >
                    <input name="orderId" type="hidden" value={order.id} />
                    <input name="status" type="hidden" value={nextStatus} />
                    <input name="returnTo" type="hidden" value={returnTo} />
                    <Button
                      className="w-full"
                      type="submit"
                    >
                      Mark as {statusLabel(nextStatus)}
                    </Button>
                  </form>
                ))}
                {order.status !== "cancelled" && order.status !== "completed" ? (
                  <form action={updateOrderStatusAction}>
                    <input name="orderId" type="hidden" value={order.id} />
                    <input name="status" type="hidden" value="cancelled" />
                    <input name="returnTo" type="hidden" value={returnTo} />
                    <Button
                      className="w-full text-[--color-danger] hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]"
                      type="submit"
                      variant="surface"
                    >
                      Cancel order
                    </Button>
                  </form>
                ) : null}
                
                <form action={deleteOrderAction}>
                  <input name="orderId" type="hidden" value={order.id} />
                  <Button
                    className="w-full text-[--color-danger] border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]"
                    type="submit"
                    variant="surface"
                  >
                    Delete order
                  </Button>
                </form>
              </div>
            ) : (
              <p className="text-sm text-[--text-muted]">
                {order.status === "completed" ? "This order is complete." : "This order is cancelled."}
              </p>
            )}
          </div>

          {/* Customer Info */}
          <div className="rounded-xl border border-[--border] bg-[--bg-surface] p-5">
            <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">Customer</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-[--text-primary]">{order.customerName}</p>
              <p className="text-[--text-secondary]">{order.customerEmail}</p>
              {order.customerPhone ? (
                <p className="text-[--text-secondary]">{order.customerPhone}</p>
              ) : null}
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-xl border border-[--border] bg-[--bg-surface] p-5">
            <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">Payment</h2>
            <div className="space-y-2 text-sm">
              <p className="text-[--text-secondary]">
                Method · <span className="font-medium text-[--text-primary]">QRPH</span>
              </p>
              <p className="text-[--text-secondary]">
                Reference · <span className="font-mono text-[--text-primary]">{order.paymentReference ?? "—"}</span>
              </p>
              {order.receiptPath ? (
                <a
                  className="inline-flex items-center gap-1.5 text-[--accent] hover:underline"
                  href={getReceiptHref(order.receiptPath)}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink size={12} aria-hidden="true" />
                  View receipt
                </a>
              ) : (
                <p className="text-[--text-muted]">No receipt uploaded</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes ? (
            <div className="rounded-xl border border-[--border] bg-[--bg-surface] p-5">
              <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">Notes</h2>
              <p className="whitespace-pre-wrap text-sm text-[--text-secondary]">{order.notes}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
