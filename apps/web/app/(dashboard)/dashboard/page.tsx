import Link from "next/link"
import {
  LayoutGrid,
  ShoppingBag,
  TrendingUp,
  Package,
  Users,
  ClipboardList,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

import { getDashboardOverview, getRevenueOverTime, getOrdersByStatus } from "@wongdigital/db/storefront"
import { buttonStyles, Card, CardContent, KpiCard, PageHeader } from "@wongdigital/ui"

import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { StatusChart } from "@/components/dashboard/status-chart"

import { StatusBadge } from "@/components/dashboard/status-badge"
import { formatDate, formatOrderItemSummary, formatPrice } from "@/lib/format"

export const dynamic = "force-dynamic"

function formatRelativeTime(date: Date | string): string {
  const then = typeof date === "string" ? new Date(date) : date
  const diffMs = Date.now() - then.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

export default async function DashboardOverviewPage() {
  const [overview, revenueData, statusData] = await Promise.all([
    getDashboardOverview(),
    getRevenueOverTime(30),
    getOrdersByStatus()
  ])

  const pendingCount = overview.pendingOrders
  const pendingInRecent = overview.recentOrders.filter((order) => order.status === "pending")
  const oldestPending = pendingInRecent.at(-1)
  const hasPending = pendingCount > 0

  const inactiveProducts = Math.max(overview.totalProducts - overview.activeProducts, 0)

  return (
    <div>
      <PageHeader
        icon={<LayoutGrid />}
        eyebrow="Dashboard"
        title="Overview"
        description="Your store at a glance."
        actions={
          <>
            <Link
              className={buttonStyles({ variant: "ghost", className: "gap-1.5" })}
              href="/dashboard/orders"
            >
              <ClipboardList size={14} aria-hidden="true" />
              All orders
            </Link>
            <Link
              className={buttonStyles({
                className: "gap-1.5",
                variant: hasPending ? "ghost" : "accent",
              })}
              href="/dashboard/products"
            >
              <Package size={14} aria-hidden="true" />
              Manage products
            </Link>
            {hasPending ? (
              <Link
                className={buttonStyles({ className: "gap-1.5" })}
                href="/dashboard/orders?status=pending"
              >
                <AlertCircle size={14} aria-hidden="true" />
                Review pending
              </Link>
            ) : null}
          </>
        }
      />

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          icon={<ShoppingBag />}
          hint="All-time"
          label="Total orders"
          value={String(overview.totalOrders)}
        />
        <KpiCard
          icon={hasPending ? <AlertCircle /> : <CheckCircle2 />}
          hint={hasPending ? "Awaiting fulfillment" : "All caught up"}
          label="Pending"
          value={String(pendingCount)}
        />
        <KpiCard
          icon={<TrendingUp />}
          hint="This month"
          label="Revenue"
          value={formatPrice(overview.revenueThisMonth)}
        />
        <KpiCard
          icon={<Package />}
          hint={`${overview.activeProducts} live · ${inactiveProducts} hidden`}
          label="Products"
          value={String(overview.totalProducts)}
        />
        <KpiCard
          icon={<Users />}
          hint="Registered"
          label="Customers"
          value={String(overview.totalCustomers)}
        />
      </section>

      <div className="mt-5 sm:mt-8 grid gap-4 sm:gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <RevenueChart data={revenueData} totalRevenue={Number(overview.revenueThisMonth)} />
        <StatusChart data={statusData} />
      </div>

      <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Recent Orders */}
        <Card>
          <CardContent className="p-3.5 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[--bg-surface] text-[--text-secondary]">
                  <ClipboardList size={15} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[--text-muted] font-semibold">
                    Recent orders
                  </p>
                  <p className="mt-0.5 font-display text-lg font-semibold tracking-tight sm:text-xl text-[--text-primary]">
                    Latest activity
                  </p>
                </div>
              </div>
              <Link
                className={buttonStyles({ size: "sm", variant: "ghost", className: "gap-1.5 text-xs sm:text-sm min-h-[44px] sm:min-h-0" })}
                href="/dashboard/orders"
              >
                View all
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-4 sm:mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead className="text-[--text-secondary]">
                  <tr>
                    <th scope="col" className="pb-2.5 sm:pb-3 text-[10px] sm:text-xs uppercase tracking-[0.16em] font-semibold">Order</th>
                    <th scope="col" className="pb-2.5 sm:pb-3 text-[10px] sm:text-xs uppercase tracking-[0.16em] font-semibold">Customer</th>
                    <th scope="col" className="pb-2.5 sm:pb-3 text-[10px] sm:text-xs uppercase tracking-[0.16em] font-semibold">Items</th>
                    <th scope="col" className="pb-2.5 sm:pb-3 text-[10px] sm:text-xs uppercase tracking-[0.16em] font-semibold">Total</th>
                    <th scope="col" className="pb-2.5 sm:pb-3 text-[10px] sm:text-xs uppercase tracking-[0.16em] font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recentOrders.length > 0 ? (
                    overview.recentOrders.map((order) => (
                      <tr
                        className="border-t border-[--border]"
                        key={order.id}
                      >
                        <td className="py-3 sm:py-4">
                          <p className="font-mono text-[10px] sm:text-xs text-[--text-primary]">
                            {order.orderCode}
                          </p>
                          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[--text-muted]">
                            {formatDate(order.createdAt)}
                          </p>
                        </td>
                        <td className="py-3 sm:py-4">
                          <p className="text-xs sm:text-sm">{order.customerName}</p>
                          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[--text-muted]">
                            {order.customerEmail}
                          </p>
                        </td>
                        <td className="py-3 sm:py-4">
                          <p className="text-xs sm:text-sm">
                            {order.items[0]
                              ? formatOrderItemSummary(order.items[0])
                              : order.product.name}
                          </p>
                          {order.items.length > 1 ? (
                            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[--text-muted]">
                              +{order.items.length - 1} more
                            </p>
                          ) : null}
                        </td>
                        <td className="py-3 sm:py-4 font-medium text-xs sm:text-sm">
                          {formatPrice(order.totalPrice)}
                        </td>
                        <td className="py-3 sm:py-4">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="py-8 text-xs sm:text-sm text-[--text-muted]"
                        colSpan={5}
                      >
                        No orders yet. First checkout lands here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pending — single source of truth for outstanding fulfillment */}
        <Card
          aria-live="polite"
          className={hasPending ? "border-[--accent-border]" : undefined}
        >
          <CardContent className="flex h-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  hasPending
                    ? "bg-[--accent-tint-soft] text-[--accent]"
                    : "bg-[--bg-surface] text-[--color-success]"
                }`}
              >
                {hasPending ? (
                  <AlertCircle size={15} aria-hidden="true" />
                ) : (
                  <CheckCircle2 size={15} aria-hidden="true" />
                )}
              </div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[--text-muted] font-semibold">
                {hasPending ? "Pending" : "Fulfillment"}
              </p>
            </div>

            <div>
              <p className="font-display text-3xl font-semibold tracking-tight text-[--text-primary] sm:text-4xl">
                {hasPending ? pendingCount : "All caught up"}
              </p>
              <p className="mt-1.5 text-sm text-[--text-secondary]">
                {hasPending
                  ? `${pendingCount === 1 ? "order" : "orders"} awaiting fulfillment${
                      oldestPending
                        ? ` · oldest ${formatRelativeTime(oldestPending.createdAt)}`
                        : ""
                    }.`
                  : "No orders waiting on you."}
              </p>
            </div>

            <div className="mt-auto">
              <Link
                className={buttonStyles({
                  variant: hasPending ? "accent" : "surface",
                  className: "w-full justify-center gap-1.5 text-sm",
                })}
                href={hasPending ? "/dashboard/orders?status=pending" : "/dashboard/orders"}
              >
                {hasPending ? "Review pending" : "View orders"}
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
