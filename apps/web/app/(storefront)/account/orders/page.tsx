import type { Metadata } from "next"
import Link from "next/link"
import { ShoppingBag, Package, ChevronRight } from "lucide-react"

import { Card, CardContent, Badge, buttonStyles } from "@wongdigital/ui"
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

  const statusTone: Record<string, "muted" | "accent"> = {
    pending: "muted",
    processing: "accent",
    delivered: "accent",
    completed: "accent",
    cancelled: "muted",
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <nav className="mb-3 flex items-center gap-1.5 text-xs text-[--text-muted]">
          <Link
            href="/account"
            className="hover:text-[--accent] transition-colors"
          >
            Account
          </Link>
          <ChevronRight size={12} />
          <span className="text-[--text-primary] font-medium">My Orders</span>
        </nav>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[--text-primary]">
          My Orders
        </h1>
        <p className="mt-1.5 text-sm text-[--text-secondary]">
          {orders.length} order{orders.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[--accent-tint-soft] text-[--accent] mb-4">
              <ShoppingBag size={28} />
            </div>
            <h2 className="font-display text-xl font-bold text-[--text-primary]">
              No orders yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-[--text-secondary]">
              Browse our catalog and place your first order. All your purchases
              will appear here automatically.
            </p>
            <Link
              href="/order"
              className={buttonStyles({ className: "mt-6" })}
            >
              <Package size={16} />
              Browse Products
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} variant="interactive">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Left: Order Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[--bg-surface]">
                      {order.product?.iconUrl ? (
                        <ProductLogo
                          iconUrl={order.product.iconUrl}
                          name={order.product.name}
                          size="sm"
                        />
                      ) : (
                        <ShoppingBag
                          size={18}
                          className="text-[--text-muted]"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[--text-primary]">
                          {order.orderCode}
                        </p>
                        <Badge tone={statusTone[order.status] ?? "muted"}>
                          {statusLabel(order.status)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-[--text-muted]">
                        {formatDate(order.createdAt)} ·{" "}
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {order.items.slice(0, 3).map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center rounded-md bg-[--bg-surface] px-2 py-0.5 text-[10px] font-medium text-[--text-secondary]"
                          >
                            {item.product.name}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="inline-flex items-center rounded-md bg-[--bg-surface] px-2 py-0.5 text-[10px] font-medium text-[--text-muted]">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-col sm:items-end">
                    <p className="font-display text-lg font-bold text-[--text-primary]">
                      {formatPrice(order.totalPrice)}
                    </p>
                    <Link
                      href={`/order/success/${order.orderCode}`}
                      className="text-xs font-medium text-[--accent] hover:underline flex items-center gap-1"
                    >
                      Details
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
