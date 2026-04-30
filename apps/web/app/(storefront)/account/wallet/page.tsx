import type { Metadata } from "next"
import Link from "next/link"
import {
  Wallet,
  ChevronRight,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  Gift,
  Clock,
} from "lucide-react"

import { Card, CardContent, Badge } from "@wongdigital/ui"
import { listWalletTransactions, getStoreSettings } from "@wongdigital/db/storefront"

import { requireCustomer } from "@/lib/customer-auth"
import { formatPrice, formatDate } from "@/lib/format"
import { WalletTopUpForm } from "./top-up-form"

export const metadata: Metadata = {
  title: "Wallet",
  description:
    "Manage your Wong Digital wallet balance. Top up and view transaction history.",
}

export default async function WalletPage() {
  const auth = await requireCustomer("/account/wallet")
  if (!auth) return null

  const { customer } = auth
  const [transactions, storeSettings] = await Promise.all([
    listWalletTransactions(customer.id),
    getStoreSettings()
  ])

  const txTypeIcon: Record<string, typeof ArrowDownRight> = {
    deposit: ArrowDownRight,
    purchase: ArrowUpRight,
    refund: RotateCcw,
    affiliate_credit: Gift,
  }

  const txTypeLabel: Record<string, string> = {
    deposit: "Deposit",
    purchase: "Purchase",
    refund: "Refund",
    affiliate_credit: "Affiliate Credit",
  }

  const statusTone: Record<string, "muted" | "accent"> = {
    pending: "muted",
    completed: "accent",
    failed: "muted",
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
          <span className="text-[--text-primary] font-medium">Wallet</span>
        </nav>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[--text-primary]">
          Wallet Hub
        </h1>
      </div>

      {/* Balance Card */}
      <Card className="relative overflow-hidden border-[color-mix(in_srgb,var(--accent)_25%,var(--border))] bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_10%,var(--bg-card))] to-[var(--bg-card)]">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] blur-2xl"
          aria-hidden="true"
        />
        <CardContent className="relative p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[--accent] text-[--accent-fg] shadow-[0_4px_16px_color-mix(in_srgb,var(--accent)_30%,transparent)]">
              <Wallet size={22} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[--text-muted] font-semibold">
                Available Balance
              </p>
              <p className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[--text-primary]">
                USDT {Number(customer.walletBalance).toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-xs text-[--text-muted]">
            Use your wallet balance for instant 1-click purchases across the store.
          </p>
        </CardContent>
      </Card>

      {/* Top-Up Section */}
      <WalletTopUpForm customerId={customer.id} storeSettings={storeSettings} />

      {/* Transaction History */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold tracking-tight text-[--text-primary]">
          Transaction History
        </h2>

        {transactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[--accent] mb-3">
                <Clock size={24} />
              </div>
              <p className="text-sm font-medium text-[--text-primary]">
                No transactions yet
              </p>
              <p className="mt-1 text-xs text-[--text-muted]">
                Your deposits and purchases will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const Icon = txTypeIcon[tx.transactionType] ?? ArrowDownRight
              const isCredit =
                tx.transactionType === "deposit" ||
                tx.transactionType === "refund" ||
                tx.transactionType === "affiliate_credit"

              return (
                <Card key={tx.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isCredit
                            ? "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[--color-success]"
                            : "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[--accent]"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[--text-primary]">
                            {txTypeLabel[tx.transactionType] ?? tx.transactionType}
                          </p>
                          <Badge tone={statusTone[tx.status] ?? "muted"}>
                            {tx.status}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-[--text-muted]">
                          {formatDate(tx.createdAt)}
                          {tx.referenceId ? ` · Ref: ${tx.referenceId}` : ""}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        isCredit
                          ? "text-[--color-success]"
                          : "text-[--text-primary]"
                      }`}
                    >
                      {isCredit ? "+" : "−"}
                      USDT {Number(tx.amount).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
