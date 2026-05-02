import type { Metadata } from "next"
import Link from "next/link"
import {
  Wallet,
  ShoppingBag,
  Crown,
  Calendar,
  ChevronRight,
  ArrowRight,
} from "lucide-react"

import { Card, CardContent, Badge } from "@wongdigital/ui"
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
  if (!auth) return null

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[--border] pb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[--text-muted] mb-2">
            / My account
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-[--text-primary]">
            Welcome back, {customer.name.split(" ")[0]}.
          </h1>
        </div>
        <Badge tone={tierTone[customer.customerTier] ?? "muted"} size="md" className="gap-1.5">
          <Crown size={11} />
          {tierLabel[customer.customerTier] ?? "Standard"}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-px bg-[--border] border border-[--border] rounded-[--radius-card] overflow-hidden sm:grid-cols-3">
        {/* Wallet Balance */}
        <div className="bg-[--bg-card] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
              Wallet balance
            </p>
            <Wallet size={13} className="text-[--text-muted]" />
          </div>
          <p className="font-display text-3xl font-semibold tabular-nums tracking-tight text-[--text-primary]">
            {formatPrice(customer.walletBalance)}
          </p>
          <Link
            href="/account/wallet"
            className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] font-semibold text-[--text-primary] underline-offset-2 hover:underline"
          >
            Top up
            <ArrowRight size={11} />
          </Link>
        </div>

        {/* Total Orders */}
        <div className="bg-[--bg-card] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
              Total orders
            </p>
            <ShoppingBag size={13} className="text-[--text-muted]" />
          </div>
          <p className="font-display text-3xl font-semibold tabular-nums tracking-tight text-[--text-primary]">
            {orders.length}
          </p>
          <p className="mt-2 text-xs text-[--text-muted]">
            Lifetime: {formatPrice(totalSpent)}
          </p>
        </div>

        {/* Member Since */}
        <div className="bg-[--bg-card] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
              Member since
            </p>
            <Calendar size={13} className="text-[--text-muted]" />
          </div>
          <p className="font-display text-2xl font-semibold tracking-tight text-[--text-primary]">
            {formatDate(customer.createdAt)}
          </p>
          <p className="mt-2 text-xs text-[--text-muted] truncate">
            {customer.email}
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/account/wallet">
          <Card variant="interactive" className="h-full">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] text-[--text-primary]">
                  <Wallet size={16} />
                </div>
                <div>
                  <p className="font-display text-base font-semibold text-[--text-primary]">
                    Wallet hub
                  </p>
                  <p className="text-xs text-[--text-muted]">
                    Top up balance & view transactions
                  </p>
                </div>
              </div>
              <ChevronRight size={14} className="text-[--text-muted]" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/account/orders">
          <Card variant="interactive" className="h-full">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] text-[--text-primary]">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <p className="font-display text-base font-semibold text-[--text-primary]">
                    My orders
                  </p>
                  <p className="text-xs text-[--text-muted]">
                    Track and manage your purchases
                  </p>
                </div>
              </div>
              <ChevronRight size={14} className="text-[--text-muted]" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-end justify-between border-b border-[--border] pb-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                / Recent orders
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-[--text-primary]">
                Latest activity
              </h2>
            </div>
            <Link
              href="/account/orders"
              className="font-mono text-[11px] uppercase tracking-[0.08em] font-semibold text-[--text-primary] underline-offset-2 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden divide-y divide-[--border]">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-[--bg-surface]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] text-[--text-muted]">
                    <ShoppingBag size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-[--text-primary] truncate">
                      {order.orderCode}
                    </p>
                    <p className="text-xs text-[--text-muted]">
                      {formatDate(order.createdAt)} · {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    size="sm"
                    tone={
                      order.status === "completed" || order.status === "delivered"
                        ? "success"
                        : "muted"
                    }
                  >
                    {order.status}
                  </Badge>
                  <p className="font-display text-sm font-semibold tabular-nums text-[--text-primary]">
                    {formatPrice(order.totalPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
