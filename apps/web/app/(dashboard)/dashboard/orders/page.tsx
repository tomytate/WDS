import Link from "next/link"

import type { OrderStatus } from "@wongdigital/db"
import { listDashboardOrders } from "@wongdigital/db/storefront"
import { Button, buttonStyles, Input, PageHeader, Select } from "@wongdigital/ui"

import { NoticeBanner } from "@/components/dashboard/notice-banner"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { updateOrderStatusAction } from "@/app/(dashboard)/dashboard/actions"
import { decodePrivateReceiptPath } from "@/lib/vercel/blob"
import { formatDate, formatOrderItemSummary, formatPrice } from "@/lib/format"
import { OrderSelectionProvider } from "@/components/dashboard/order-selection-provider"
import { OrderSelectAll, OrderCheckbox, BulkActionBar } from "@/components/dashboard/order-selection-controls"

const statusTabs: Array<{ label: string; value: OrderStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Delivered", value: "delivered" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
]

function getReceiptHref(receiptPath: string) {
  const privatePathname = decodePrivateReceiptPath(receiptPath)

  if (privatePathname) {
    return `/api/admin/receipt?pathname=${encodeURIComponent(privatePathname)}`
  }

  return receiptPath
}

function buildPath({
  page,
  query,
  status,
}: {
  page?: number
  query?: string
  status?: string
}) {
  const params = new URLSearchParams()

  if (query) {
    params.set("query", query)
  }

  if (status && status !== "all") {
    params.set("status", status)
  }

  if (page && page > 1) {
    params.set("page", String(page))
  }

  const nextQuery = params.toString()

  return nextQuery ? `/dashboard/orders?${nextQuery}` : "/dashboard/orders"
}

type OrdersPageProps = {
  searchParams: Promise<{
    error?: string
    page?: string
    query?: string
    status?: string
    success?: string
  }>
}

export default async function DashboardOrdersPage({ searchParams }: OrdersPageProps) {
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams.query?.trim() ?? ""
  const status = resolvedSearchParams.status ?? "all"
  const page = Number(resolvedSearchParams.page ?? "1")
  const currentPath = buildPath({
    page,
    query,
    status,
  })
  const ordersPage = await listDashboardOrders({
    page,
    query,
    status:
      status === "all" ||
      status === "pending" ||
      status === "processing" ||
      status === "delivered" ||
      status === "completed" ||
      status === "cancelled"
        ? status
        : "all",
  })
  const hasPreviousPage = ordersPage.currentPage > 1
  const hasNextPage = ordersPage.currentPage < ordersPage.totalPages

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Orders"
        description="Search by order code, customer, or email. Review receipts and update status in place."
      />

      <NoticeBanner
        error={resolvedSearchParams.error}
        success={resolvedSearchParams.success}
      />

      <div className="mb-6 flex flex-col gap-4">
        <div
          aria-label="Filter by status"
          className="flex flex-wrap gap-2"
          role="tablist"
        >
          {statusTabs.map((tab) => {
            const active = status === tab.value || (!status && tab.value === "all")

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[--accent] text-[--accent-fg]"
                    : "border border-[--border] bg-[--bg-surface] text-[--text-secondary] hover:text-[--text-primary]"
                }`}
                href={buildPath({
                  query,
                  status: tab.value,
                })}
                key={tab.value}
                role="tab"
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        <form
          action="/dashboard/orders"
          className="grid gap-3 md:grid-cols-[1fr_180px_auto]"
          method="get"
        >
          <Input
            defaultValue={query}
            name="query"
            placeholder="Search order code, customer, or email"
          />
          <Select
            defaultValue={status}
            name="status"
          >
            {statusTabs.map((tab) => (
              <option
                key={tab.value}
                value={tab.value}
              >
                {tab.label}
              </option>
            ))}
          </Select>
          <Button
            className="justify-center"
            type="submit"
          >
            Apply filters
          </Button>
        </form>
      </div>

      <OrderSelectionProvider>
        <div className="overflow-x-auto overscroll-x-contain rounded-[--radius-card] border border-[--border] bg-[--bg-card]">
          <table className="min-w-[800px] whitespace-nowrap text-left text-sm">
            <thead className="bg-[--bg-surface] text-[--text-muted]">
              <tr>
                <th scope="col" className="px-4 py-3 w-6">
                  <span className="sr-only">Select</span>
                  <OrderSelectAll allIds={ordersPage.orders.map(o => o.id)} />
                </th>
                <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] font-medium">Order</th>
                <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] font-medium">Customer</th>
                <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] font-medium">Items</th>
                <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] font-medium">Payment</th>
                <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] font-medium">Date</th>
                <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ordersPage.orders.length > 0 ? (
                ordersPage.orders.map((order) => (
                  <tr
                    className="border-t border-[--border] transition-colors hover:bg-[--bg-surface]"
                    key={order.id}
                  >
                    <td className="px-4 py-4 align-top w-6">
                      <OrderCheckbox id={order.id} />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <Link
                        className="font-mono text-xs font-semibold text-[--text-primary] underline-offset-2 hover:underline"
                        href={`/dashboard/orders/${order.id}`}
                      >
                        {order.orderCode}
                      </Link>
                      <p className="mt-1 text-xs text-[--text-secondary]">
                        {formatPrice(order.totalPrice)}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p>{order.customerName}</p>
                      <p className="mt-1 text-xs text-[--text-secondary]">
                        {order.customerEmail}
                      </p>
                      {order.customerPhone ? (
                        <p className="mt-1 text-xs text-[--text-secondary]">
                          {order.customerPhone}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p>
                        {order.items[0]
                          ? formatOrderItemSummary(order.items[0])
                          : order.product.name}
                      </p>
                      {order.items.length > 1 ? (
                        <p className="mt-1 text-xs text-[--text-secondary]">
                          +{order.items.length - 1} more
                        </p>
                      ) : null}
                      {order.items.some((item) => item.selectionMode === "service") ? (
                        <div className="mt-2 space-y-1">
                          {order.items
                            .filter((item) => item.selectionMode === "service")
                            .map((item) => (
                              <p
                                className="text-xs text-[--text-secondary]"
                                key={`${order.id}-${item.id}-manual`}
                              >
                                {item.product.name} · manual fulfillment
                              </p>
                            ))}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p>QRPH</p>
                      <p className="mt-1 text-xs text-[--text-secondary]">
                        Ref · {order.paymentReference ?? "—"}
                      </p>
                      {Number(order.tipAmount) > 0 ? (
                        <p className="mt-1 text-xs text-[--text-secondary]">
                          Tip · {formatPrice(order.tipAmount)}
                        </p>
                      ) : null}
                      {order.receiptPath ? (
                        <a
                          className="mt-2 inline-flex text-xs text-[--accent] hover:underline"
                          href={getReceiptHref(order.receiptPath)}
                          rel="noreferrer"
                          target="_blank"
                        >
                          View receipt ↗
                        </a>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-4 align-top text-xs text-[--text-secondary]">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <Link
                          aria-label={`Manage order ${order.orderCode}`}
                          className={buttonStyles({ size: "sm", variant: "surface" })}
                          href={`/dashboard/orders/${order.id}`}
                        >
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-10 text-[--text-secondary]"
                    colSpan={8}
                  >
                    No orders matched the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[--text-secondary]">
            {ordersPage.totalCount} order{ordersPage.totalCount === 1 ? "" : "s"} found.
          </p>

          <div className="flex gap-3">
            {hasPreviousPage ? (
              <Link
                className={buttonStyles({ variant: "ghost" })}
                href={buildPath({
                  page: Math.max(1, ordersPage.currentPage - 1),
                  query,
                  status,
                })}
              >
                Previous
              </Link>
            ) : (
              <span className={buttonStyles({ className: "pointer-events-none", variant: "ghost" })}>
                Previous
              </span>
            )}
            <span className="inline-flex items-center rounded-full border border-[--border] px-4 py-2 text-sm text-[--text-secondary]">
              Page {ordersPage.currentPage} of {ordersPage.totalPages}
            </span>
            {hasNextPage ? (
              <Link
                className={buttonStyles({ variant: "ghost" })}
                href={buildPath({
                  page: Math.min(ordersPage.totalPages, ordersPage.currentPage + 1),
                  query,
                  status,
                })}
              >
                Next
              </Link>
            ) : (
              <span className={buttonStyles({ className: "pointer-events-none", variant: "ghost" })}>
                Next
              </span>
            )}
          </div>
          <BulkActionBar />
        </div>
      </OrderSelectionProvider>
    </div>
  )
}
