import type { Metadata } from "next"
import Link from "next/link"
import { ShoppingBag, Package, ChevronRight } from "lucide-react"

import { Card, CardContent, Badge, EmptyState, buttonStyles } from "@wongdigital/ui"
import { lookupOrdersByEmail } from "@wongdigital/db/storefront"

import { requireCustomer } from "@/lib/customer-auth"
import { formatPrice, formatDate, statusLabel } from "@/lib/format"
import { ProductLogo } from "@/components/product-logo"

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and track all your Wong Digital orders in one place.",
}

export default async function MyOrdersPage() {
  const auth = await requireCustomer("/account/orders")
  if (!auth) return null

  const { customer } = auth
  const orders = await lookupOrdersByEmail(customer.email)

  const statusTone: Record<string, "muted" | "success" | "accent" | "danger"> = {
    pending: "muted",
    processing: "accent",
    delivered: "success",
    completed: "success",
    cancelled: "danger",
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[--border] pb-6">
        <nav className="mb-3 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[--text-muted]">
          <Link
            href="/account"
            className="hover:text-[--text-primary] transition-colors"
          >
            Account
          </Link>
          <ChevronRight size={11} />
          <span className="text-[--text-primary] font-semibold">My Orders</span>
        </nav>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-[--text-primary]">
          My orders.
        </h1>
        <p className="mt-2 text-[15px] text-[--text-secondary]">
          {orders.length} order{orders.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={20} />}
          title="No orders yet"
          description="Browse our catalog and place your first order. All your purchases will appear here automatically."
          action={
            <Link href="/order" className={buttonStyles({ className: "gap-2" })}>
              <Package size={14} />
              Browse products
            </Link>
          }
        />
      ) : (
        <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden divide-y divide-[--border]">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order/success/${order.orderCode}`}
              className="block transition-colors hover:bg-[--bg-surface]"
            >
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Left: Order Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-surface]">
                      {order.product?.iconUrl ? (
                        <ProductLogo
                          iconUrl={order.product.iconUrl}
                          name={order.product.name}
                          size="sm"
                        />
                      ) : (
                        <ShoppingBag
                          size={15}
                          className="text-[--text-muted]"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-mono text-xs font-semibold text-[--text-primary]">
                          {order.orderCode}
                        </p>
                        <Badge size="sm" tone={statusTone[order.status] ?? "muted"}>
                          {statusLabel(order.status)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-[--text-muted]">
                        {formatDate(order.createdAt)} ·{" "}
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {order.items.slice(0, 3).map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] px-1.5 py-0.5 text-[10px] font-medium text-[--text-secondary]"
                          >
                            {item.product.name}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="inline-flex items-center rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] px-1.5 py-0.5 text-[10px] font-medium text-[--text-muted]">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-col sm:items-end">
                    <p className="font-display text-lg font-semibold tabular-nums text-[--text-primary]">
                      {formatPrice(order.totalPrice)}
                    </p>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] font-semibold text-[--text-muted] flex items-center gap-1">
                      Details
                      <ChevronRight size={11} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// Card kept for backwards-compat
void Card
void CardContent
