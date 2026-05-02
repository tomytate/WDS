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

import { Badge, EmptyState } from "@wongdigital/ui"
import { listWalletTransactions, getStoreSettings } from "@wongdigital/db/storefront"

import { requireCustomer } from "@/lib/customer-auth"
import { formatDate } from "@/lib/format"
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
    getStoreSettings(),
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
    affiliate_credit: "Affiliate credit",
  }

  const statusTone: Record<string, "muted" | "success" | "danger"> = {
    pending: "muted",
    completed: "success",
    failed: "danger",
    cancelled: "muted",
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
          <span className="text-[--text-primary] font-semibold">Wallet</span>
        </nav>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-[--text-primary]">
          Wallet hub.
        </h1>
      </div>

      {/* Balance Card — full-bleed ink block */}
      <div className="ink-block rounded-[--radius-card] border border-[--border]">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[--accent] mb-3">
                / Available balance
              </p>
              <p className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[0.95] tracking-[-0.03em] text-[--text-on-ink] tabular-nums">
                USDT {Number(customer.walletBalance).toFixed(2)}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[--radius-inner] bg-[--accent] text-[--accent-fg]">
              <Wallet size={20} />
            </div>
          </div>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-[--text-on-ink] opacity-75">
            Use your wallet balance for instant 1-click purchases across the store.
          </p>
        </div>
      </div>

      {/* Top-Up Section */}
      <WalletTopUpForm customerId={customer.id} storeSettings={storeSettings} />

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-end justify-between border-b border-[--border] pb-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
              / Transaction history
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-[--text-primary]">
              All movements
            </h2>
          </div>
        </div>

        {transactions.length === 0 ? (
          <EmptyState
            icon={<Clock size={20} />}
            title="No transactions yet"
            description="Your deposits and purchases will appear here."
          />
        ) : (
          <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden divide-y divide-[--border]">
            {transactions.map((tx) => {
              const Icon = txTypeIcon[tx.transactionType] ?? ArrowDownRight
              const isCredit =
                tx.transactionType === "deposit" ||
                tx.transactionType === "refund" ||
                tx.transactionType === "affiliate_credit"

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-[--bg-surface]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[--radius-inner] border ${
                        isCredit
                          ? "border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[--color-success-text]"
                          : "border-[--border] bg-[--bg-surface] text-[--text-primary]"
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[--text-primary]">
                          {txTypeLabel[tx.transactionType] ?? tx.transactionType}
                        </p>
                        <Badge size="sm" tone={statusTone[tx.status] ?? "muted"}>
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
                    className={`font-display text-sm font-semibold tabular-nums ${
                      isCredit ? "text-[--color-success-text]" : "text-[--text-primary]"
                    }`}
                  >
                    {isCredit ? "+" : "−"}
                    USDT {Number(tx.amount).toFixed(2)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
