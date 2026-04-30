import { ChevronRight, Users as UsersIcon, DollarSign, Repeat } from "lucide-react"
import { listDashboardCustomers } from "@wongdigital/db/storefront"
import { Button, Card, CardContent, Input, KpiCard, PageHeader, buttonStyles } from "@wongdigital/ui"

import { StatusBadge } from "@/components/dashboard/status-badge"
import { formatDate, formatOrderItemSummary, formatPrice } from "@/lib/format"
import Link from "next/link"

type CustomersPageProps = {
  searchParams: Promise<{
    page?: string
    query?: string
  }>
}

function buildPath({
  page,
  query,
}: {
  page?: number
  query?: string
}) {
  const params = new URLSearchParams()

  if (query) {
    params.set("query", query)
  }

  if (page && page > 1) {
    params.set("page", String(page))
  }

  const nextQuery = params.toString()

  return nextQuery ? `/dashboard/customers?${nextQuery}` : "/dashboard/customers"
}

export default async function DashboardCustomersPage({
  searchParams,
}: CustomersPageProps) {
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams.query?.trim() ?? ""
  const page = Number(resolvedSearchParams.page ?? "1")
  const customersPage = await listDashboardCustomers({ page, query })
  const customers = customersPage.customers
  const totalRevenue = customers
    .reduce((sum, entry) => sum + Number(entry.totalSpent), 0)
    .toFixed(2)
  const repeatBuyers = customers.filter((entry) => entry.ordersCount > 1).length
  const hasPreviousPage = customersPage.currentPage > 1
  const hasNextPage = customersPage.currentPage < customersPage.totalPages

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Customers"
        description="Lifetime value, repeat purchases, and order history — all in one place."
      />

      <section aria-label="Customer metrics" className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard
          icon={<UsersIcon />}
          label="Matching customers"
          value={String(customers.length)}
        />
        <KpiCard
          icon={<DollarSign />}
          label="Combined revenue"
          value={formatPrice(totalRevenue)}
        />
        <KpiCard
          icon={<Repeat />}
          label="Repeat buyers"
          value={String(repeatBuyers)}
        />
      </section>

      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <form
            action="/dashboard/customers"
            className="grid gap-3 md:grid-cols-[1fr_auto]"
            method="get"
          >
            <Input
              defaultValue={query}
              name="query"
              placeholder="Search customer name or email"
            />
            <Button type="submit">Search</Button>
          </form>

          <div className="space-y-4">
            {customers.length > 0 ? (
              customers.map((entry) => (
                <details
                  className="group rounded-2xl border border-[--border] bg-[--bg-surface] p-4"
                  key={entry.customer.id}
                >
                  <summary className="cursor-pointer list-none">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,0.6fr)] lg:items-center">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[--border] bg-[--bg-card] text-[--text-secondary] transition-transform group-open:rotate-90">
                            <ChevronRight size={16} aria-hidden="true" />
                          </span>
                          <div>
                            <p className="font-display text-2xl tracking-tight">
                              {entry.customer.name}
                            </p>
                            <p className="mt-1 text-sm text-[--text-secondary]">
                              {entry.customer.email}
                            </p>
                            {entry.customer.phone ? (
                              <p className="mt-1 text-xs text-[--text-secondary]">
                                {entry.customer.phone}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <InfoStat
                        label="Orders"
                        value={String(entry.ordersCount)}
                      />
                      <InfoStat
                        label="Total spent"
                        value={formatPrice(entry.totalSpent)}
                      />
                      <InfoStat
                        label="Joined"
                        value={formatDate(entry.customer.createdAt)}
                      />
                      <InfoStat
                        label="Last order"
                        value={entry.lastOrderAt ? formatDate(entry.lastOrderAt) : "No orders"}
                      />
                    </div>
                  </summary>

                  <div className="mt-5 space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">
                      Order history
                    </p>
                    {entry.orders.length > 0 ? (
                      entry.orders.map((order) => (
                        <div
                          className="rounded-xl border border-[--border] bg-[--bg-card] p-4"
                          key={order.id}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-mono text-xs text-[--text-primary]">
                                {order.orderCode}
                              </p>
                              <p className="mt-2 text-sm text-[--text-primary]">
                                {order.items
                                  .map((item) => formatOrderItemSummary(item))
                                  .join(", ")}
                              </p>
                              <p className="mt-1 text-xs text-[--text-secondary]">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 sm:items-end">
                              <StatusBadge status={order.status} />
                              <p className="text-sm font-medium">
                                {formatPrice(order.totalPrice)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[--text-secondary]">
                        No orders yet.
                      </p>
                    )}
                  </div>
                </details>
              ))
            ) : (
              <div className="rounded-2xl border border-[--border] bg-[--bg-surface] p-6 text-sm text-[--text-secondary]">
                No customers match this search.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[--text-secondary]">
              {customersPage.totalCount} customer
              {customersPage.totalCount === 1 ? "" : "s"} found.
            </p>

            <div className="flex gap-3">
              {hasPreviousPage ? (
                <Link
                  className={buttonStyles({ variant: "ghost", className: "px-4 py-2" })}
                  href={buildPath({
                    page: Math.max(1, customersPage.currentPage - 1),
                    query,
                  })}
                >
                  Previous
                </Link>
              ) : (
                <span className={buttonStyles({ variant: "ghost", className: "px-4 py-2 opacity-60 pointer-events-none" })}>
                  Previous
                </span>
              )}

              <span className={buttonStyles({ variant: "ghost", className: "px-4 py-2 pointer-events-none" })}>
                Page {customersPage.currentPage} of {customersPage.totalPages}
              </span>

              {hasNextPage ? (
                <Link
                  className={buttonStyles({ variant: "ghost", className: "px-4 py-2" })}
                  href={buildPath({
                    page: Math.min(customersPage.totalPages, customersPage.currentPage + 1),
                    query,
                  })}
                >
                  Next
                </Link>
              ) : (
                <span className={buttonStyles({ variant: "ghost", className: "px-4 py-2 opacity-60 pointer-events-none" })}>
                  Next
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">{label}</p>
      <p className="mt-2 text-sm text-[--text-primary]">{value}</p>
    </div>
  )
}
