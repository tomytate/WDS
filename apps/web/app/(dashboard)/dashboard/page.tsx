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
import { buttonStyles, Card, KpiCard, PageHeader } from "@wongdigital/ui"

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
          <div className="flex items-center justify-between gap-3 border-b border-[--border] px-5 py-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                Recent orders
              </p>
              <p className="mt-1 font-display text-lg font-semibold tracking-tight text-[--text-primary]">
                Latest activity
              </p>
            </div>
            <Link
              className={buttonStyles({
                size: "sm",
                variant: "ghost",
                className: "gap-1.5 text-xs",
              })}
              href="/dashboard/orders"
            >
              View all
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[--bg-surface] text-[--text-muted]">
                <tr>
                  <th
                    scope="col"
                    className="px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] font-medium"
                  >
                    Order
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] font-medium"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] font-medium"
                  >
                    Items
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] font-medium"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] font-medium"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {overview.recentOrders.length > 0 ? (
                  overview.recentOrders.map((order) => (
                    <tr
                      className="border-t border-[--border] transition-colors hover:bg-[--bg-surface]"
                      key={order.id}
                    >
                      <td className="px-5 py-3">
                        <p className="font-mono text-xs text-[--text-primary]">
                          {order.orderCode}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[--text-muted]">
                          {formatDate(order.createdAt)}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-[--text-primary]">
                          {order.customerName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[--text-muted]">
                          {order.customerEmail}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-[--text-primary]">
                          {order.items[0]
                            ? formatOrderItemSummary(order.items[0])
                            : order.product.name}
                        </p>
                        {order.items.length > 1 ? (
                          <p className="mt-0.5 text-[11px] text-[--text-muted]">
                            +{order.items.length - 1} more
                          </p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 font-medium tabular-nums text-sm text-[--text-primary]">
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-5 py-8 text-sm text-[--text-muted]"
                      colSpan={5}
                    >
                      No orders yet. First checkout lands here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pending — single source of truth for outstanding fulfillment */}
        <Card
          aria-live="polite"
          className={
            hasPending
              ? "border-[--text-primary] shadow-[2px_2px_0_var(--accent)]"
              : undefined
          }
        >
          <div className="flex h-full flex-col gap-5 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                {hasPending ? "Pending fulfillment" : "Fulfillment status"}
              </p>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-[--radius-inner] ${
                  hasPending
                    ? "bg-[--accent] text-[--accent-fg]"
                    : "border border-[--border] bg-[--bg-surface] text-[--color-success-text]"
                }`}
              >
                {hasPending ? (
                  <AlertCircle size={14} aria-hidden="true" />
                ) : (
                  <CheckCircle2 size={14} aria-hidden="true" />
                )}
              </span>
            </div>

            <div>
              <p className="font-display text-4xl font-semibold tracking-tight tabular-nums text-[--text-primary] sm:text-5xl">
                {hasPending ? pendingCount : "0"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[--text-secondary]">
                {hasPending
                  ? `${pendingCount === 1 ? "order" : "orders"} awaiting fulfillment${
                      oldestPending
                        ? ` · oldest ${formatRelativeTime(oldestPending.createdAt)}`
                        : ""
                    }.`
                  : "All caught up — no orders waiting on you."}
              </p>
            </div>

            <Link
              className={buttonStyles({
                variant: hasPending ? "accent" : "ghost",
                className: "mt-auto w-full justify-between gap-1.5 text-sm",
              })}
              href={
                hasPending ? "/dashboard/orders?status=pending" : "/dashboard/orders"
              }
            >
              {hasPending ? "Review pending" : "View orders"}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
