import type { Metadata } from "next"
import Link from "next/link"
import {
  User,
  Wallet,
  ShoppingBag,
  Crown,
  Calendar,
  ChevronRight,
  ArrowRight,
} from "lucide-react"

import { Card, CardContent, Badge, buttonStyles } from "@wongdigital/ui"
import { lookupOrdersByEmail } from "@wongdigital/db/storefront"

import { requireCustomer } from "@/lib/customer-auth"
import { formatPrice, formatDate } from "@/lib/format"

export const metadata: Metadata = {
  title: "My Account",
  description:
    "View your Wong Digital account, wallet balance, and manage your subscriptions.",
}

export default async function AccountPage() {
  const auth = await requireCustomer()
  if (!auth) return null // requireCustomer redirects

  const { customer } = auth
  const orders = await lookupOrdersByEmail(customer.email)
  const recentOrders = orders.slice(0, 5)
  const totalSpent = orders
    .reduce((sum, order) => sum + Number(order.totalPrice), 0)
    .toFixed(2)

  const tierLabel: Record<string, string> = {
    standard: "Standard",
    gold: "Gold Member",
    reseller: "Reseller",
  }

  const tierTone: Record<string, "muted" | "accent"> = {
    standard: "muted",
    gold: "accent",
    reseller: "accent",
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[--accent]">
            My Account
          </p>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[--text-primary]">
            Welcome back, {customer.name.split(" ")[0]}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            tone={tierTone[customer.customerTier] ?? "muted"}
            className="gap-1.5"
          >
            <Crown size={12} />
            {tierLabel[customer.customerTier] ?? "Standard"}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Wallet Balance */}
        <Card className="group relative overflow-hidden border-[--accent-border] bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_8%,var(--bg-card))] to-[var(--bg-card)]">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[--accent-tint-soft] blur-2xl"
            aria-hidden="true"
          />
          <CardContent className="relative p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[--accent-tint-soft] text-[--accent]">
                <Wallet size={16} />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-[--text-muted] font-semibold">
                Wallet Balance
              </p>
            </div>
            <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[--text-primary]">
              {formatPrice(customer.walletBalance)}
            </p>
            <Link
              href="/account/wallet"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[--accent] hover:underline"
            >
              Top Up
              <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-info)_14%,transparent)] text-[--color-info]">
                <ShoppingBag size={16} />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-[--text-muted] font-semibold">
                Total Orders
              </p>
            </div>
            <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[--text-primary]">
              {orders.length}
            </p>
            <p className="mt-1 text-xs text-[--text-muted]">
              Lifetime total: {formatPrice(totalSpent)}
            </p>
          </CardContent>
        </Card>

        {/* Member Since */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[--color-success]">
                <Calendar size={16} />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-[--text-muted] font-semibold">
                Member Since
              </p>
            </div>
            <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[--text-primary]">
              {formatDate(customer.createdAt)}
            </p>
            <p className="mt-1 text-xs text-[--text-muted]">
              {customer.email}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/account/wallet">
          <Card variant="interactive" className="h-full">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent-tint-soft] text-[--accent]">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[--text-primary]">
                    Wallet Hub
                  </p>
                  <p className="text-xs text-[--text-muted]">
                    Top up balance & view transactions
                  </p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-[--text-muted]"
              />
            </CardContent>
          </Card>
        </Link>
        <Link href="/account/orders">
          <Card variant="interactive" className="h-full">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[--color-info]">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[--text-primary]">
                    My Orders
                  </p>
                  <p className="text-xs text-[--text-muted]">
                    Track and manage your purchases
                  </p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-[--text-muted]"
              />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold tracking-tight text-[--text-primary]">
              Recent Orders
            </h2>
            <Link
              href="/account/orders"
              className="text-xs font-medium text-[--accent] hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[--bg-surface] text-[--text-muted]">
                      <ShoppingBag size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[--text-primary] truncate">
                        {order.orderCode}
                      </p>
                      <p className="text-xs text-[--text-muted]">
                        {formatDate(order.createdAt)} ·{" "}
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      tone={
                        order.status === "completed" || order.status === "delivered"
                          ? "accent"
                          : "muted"
                      }
                    >
                      {order.status}
                    </Badge>
                    <p className="text-sm font-semibold text-[--text-primary]">
                      {formatPrice(order.totalPrice)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
