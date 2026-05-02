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
        <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden lg:col-span-2">
          <div className="border-b border-[--border] bg-[--bg-surface] px-5 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
              / Items
            </p>
          </div>
          <div className="divide-y divide-[--border]">
            {order.items.map((item) => (
              <div
                className="flex items-start justify-between gap-3 p-4 sm:p-5"
                key={item.id}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[--text-primary]">{item.product.name}</p>
                  <p className="mt-1 text-xs text-[--text-secondary]">
                    {formatOrderItemSummary(item)}
                  </p>
                  {item.targetUrl ? (
                    <a
                      className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-[--text-primary] underline-offset-2 hover:underline"
                      href={item.targetUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLink size={10} aria-hidden="true" />
                      {item.targetUrl}
                    </a>
                  ) : null}
                </div>
                <p className="shrink-0 font-display text-sm font-semibold tabular-nums text-[--text-primary]">
                  {formatPrice(item.unitPrice)}
                </p>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-[--border] bg-[--bg-surface] p-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[--text-secondary]">Subtotal</span>
              <span className="tabular-nums text-[--text-primary]">{formatPrice(order.subtotalPrice)}</span>
            </div>
            {Number(order.tipAmount) > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-[--text-secondary]">Tip</span>
                <span className="tabular-nums text-[--text-primary]">{formatPrice(order.tipAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between items-baseline pt-2 border-t border-[--border]">
              <span className="font-semibold text-[--text-primary]">Total</span>
              <span className="font-display text-2xl font-semibold tabular-nums tracking-tight text-[--text-primary]">
                {formatPrice(order.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status Actions */}
          <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden">
            <div className="border-b border-[--border] bg-[--bg-surface] px-5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                / Update status
              </p>
            </div>
            <div className="p-5">
              {nextStatuses.length > 0 ? (
                <div className="space-y-2">
                  {nextStatuses.map((nextStatus) => (
                    <form action={updateOrderStatusAction} key={nextStatus}>
                      <input name="orderId" type="hidden" value={order.id} />
                      <input name="status" type="hidden" value={nextStatus} />
                      <input name="returnTo" type="hidden" value={returnTo} />
                      <Button className="w-full" type="submit">
                        Mark as {statusLabel(nextStatus)}
                      </Button>
                    </form>
                  ))}
                  {order.status !== "cancelled" && order.status !== "completed" ? (
                    <form action={updateOrderStatusAction}>
                      <input name="orderId" type="hidden" value={order.id} />
                      <input name="status" type="hidden" value="cancelled" />
                      <input name="returnTo" type="hidden" value={returnTo} />
                      <Button className="w-full" type="submit" variant="ghost">
                        Cancel order
                      </Button>
                    </form>
                  ) : null}

                  <form action={deleteOrderAction}>
                    <input name="orderId" type="hidden" value={order.id} />
                    <Button
                      className="w-full"
                      type="submit"
                      variant="danger"
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
          </div>

          {/* Customer Info */}
          <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden">
            <div className="border-b border-[--border] bg-[--bg-surface] px-5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                / Customer
              </p>
            </div>
            <div className="p-5 space-y-1.5 text-sm">
              <p className="font-medium text-[--text-primary]">{order.customerName}</p>
              <p className="text-[--text-secondary]">{order.customerEmail}</p>
              {order.customerPhone ? (
                <p className="text-[--text-secondary]">{order.customerPhone}</p>
              ) : null}
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden">
            <div className="border-b border-[--border] bg-[--bg-surface] px-5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                / Payment
              </p>
            </div>
            <div className="p-5 space-y-2 text-sm">
              <p className="text-[--text-secondary]">
                Method · <span className="font-medium text-[--text-primary]">QRPH</span>
              </p>
              <p className="text-[--text-secondary]">
                Reference ·{" "}
                <span className="font-mono text-[--text-primary]">
                  {order.paymentReference ?? "—"}
                </span>
              </p>
              {order.receiptPath ? (
                <a
                  className="inline-flex items-center gap-1.5 font-medium text-[--text-primary] underline-offset-2 hover:underline"
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
            <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden">
              <div className="border-b border-[--border] bg-[--bg-surface] px-5 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                  / Notes
                </p>
              </div>
              <p className="whitespace-pre-wrap p-5 text-sm text-[--text-secondary]">
                {order.notes}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
