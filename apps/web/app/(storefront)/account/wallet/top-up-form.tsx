"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  QrCode,
  Loader2,
  CheckCircle2,
  Wallet,
} from "lucide-react"

import { Card, CardContent, Input, buttonStyles } from "@wongdigital/ui"

import { requestDeposit } from "./actions"

/** Preset top-up amounts shown in USDT (the internal denomination) */
const PRESET_AMOUNTS_USDT = [10, 25, 50, 100]

import type { StoreSettings } from "@wongdigital/db"

export function WalletTopUpForm({ customerId, storeSettings }: { customerId: string, storeSettings: StoreSettings }) {
  const router = useRouter()
  const [amountUsdt, setAmountUsdt] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"qrph" | "binance_pay">(
    "binance_pay",
  )
  const [referenceId, setReferenceId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.set("amountUsdt", amountUsdt)
      formData.set("paymentMethod", paymentMethod)
      formData.set("referenceId", referenceId)

      const result = await requestDeposit(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess(true)
      router.refresh()
    })
  }

  if (success) {
    return (
      <Card className="border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_6%,transparent)]">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[--color-success] mb-4">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="font-display text-xl font-bold text-[--text-primary]">
            Deposit Request Submitted
          </h3>
          <p className="mt-2 max-w-md text-sm text-[--text-secondary]">
            Your deposit of{" "}
            <strong className="text-[--text-primary]">
              ₱ {Number(amountUsdt).toFixed(2)} (USDT)
            </strong>{" "}
            via {paymentMethod === "qrph" ? "QRPH" : "Binance Pay"} has been
            submitted. An admin will review and credit your wallet within 24
            hours.
          </p>
          <button
            className={buttonStyles({
              className: "mt-6",
              variant: "surface",
            })}
            onClick={() => {
              setSuccess(false)
              setAmountUsdt("")
              setReferenceId("")
            }}
            type="button"
          >
            Submit Another
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[--accent]">
            <Wallet size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[--text-primary]">
              Top Up Your Wallet
            </h3>
            <p className="text-xs text-[--text-muted]">
              Send payment and submit your reference to request a deposit.
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Preset USDT Amounts */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[--text-primary]">
              Select Amount
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_AMOUNTS_USDT.map((preset) => (
                <button
                  key={preset}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    amountUsdt === String(preset)
                      ? "border-[--accent] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[--accent] shadow-sm"
                      : "border-[--border] bg-[--bg-surface] text-[--text-secondary] hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))]"
                  }`}
                  onClick={() => setAmountUsdt(String(preset))}
                  type="button"
                >
                  USDT {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <label
              className="text-xs font-medium text-[--text-primary]"
              htmlFor="custom-amount"
            >
              Or enter custom amount (USDT)
            </label>
            <Input
              id="custom-amount"
              type="number"
              min={1}
              max={10000}
              step="0.01"
              placeholder="Amount in USDT"
              value={amountUsdt}
              onChange={(e) => setAmountUsdt(e.target.value)}
              required
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[--text-primary]">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={false}
                className={`relative flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  paymentMethod === "qrph"
                    ? "border-[--accent] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[--accent] shadow-sm"
                    : "border-[--border] bg-[--bg-surface] text-[--text-secondary] hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))]"
                }`}
                onClick={() => setPaymentMethod("qrph")}
                type="button"
              >

                <QrCode size={16} />
                QRPH
              </button>
              <button
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  paymentMethod === "binance_pay"
                    ? "border-[--accent] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[--accent] shadow-sm"
                    : "border-[--border] bg-[--bg-surface] text-[--text-secondary] hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))]"
                }`}
                onClick={() => setPaymentMethod("binance_pay")}
                type="button"
              >
                <Wallet size={16} />
                Binance Pay
              </button>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] bg-[--bg-surface] border border-[--border] rounded-xl p-3 sm:p-4 mt-2">
            {paymentMethod === "qrph" ? (
              <div className="relative overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] backdrop-blur-xl p-3 shadow-sm">
                <Image
                  alt="QRPH QR code"
                  className="mx-auto aspect-[1/1] w-full max-w-[180px] object-contain drop-shadow-sm rounded-lg"
                  src="/payments/gcash-qr.webp"
                  width={180}
                  height={180}
                  priority
                />
              </div>
            ) : (
              <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--accent)_5%,transparent)] backdrop-blur-xl p-4 shadow-sm text-center">
                <div className="w-full max-w-[160px] rounded-xl overflow-hidden bg-white p-2 shadow-sm mb-3">
                  <Image
                    alt="Binance QR code"
                    className="mx-auto aspect-[1/1] w-full object-contain"
                    src="/payments/binance-qr.webp"
                    width={160}
                    height={160}
                  />
                </div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[--text-muted] font-semibold">
                  Binance UID
                </p>
                <p className="mt-1 font-mono text-lg font-bold tracking-wider text-[--text-primary]">
                  {storeSettings.binancePayId || "—"}
                </p>
              </div>
            )}

            <div className="space-y-3 flex flex-col justify-center">
              <p className="text-xs sm:text-sm leading-relaxed text-[--text-primary]">
                {paymentMethod === "binance_pay"
                  ? storeSettings.binanceInstructions
                  : storeSettings.qrphInstructions}
              </p>
              <div className="rounded-lg bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] p-3 text-xs text-[--accent]">
                <p className="font-semibold mb-1">How to top up:</p>
                <ul className="list-disc pl-4 space-y-1 opacity-90">
                  <li>Scan the QR code and pay the amount shown.</li>
                  <li>Copy your transaction/reference ID after payment.</li>
                  <li>Paste the reference below to request your deposit.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <label
              className="text-xs font-medium text-[--text-primary]"
              htmlFor="deposit-reference"
            >
              Payment Reference Number
            </label>
            <Input
              id="deposit-reference"
              placeholder="Enter your reference / transaction ID"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-xl border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] px-4 py-3 text-sm text-[--color-danger]">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            className={buttonStyles({ className: "w-full justify-center" })}
            disabled={isPending || !amountUsdt}
            type="submit"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Wallet size={16} />
                Request Deposit
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-[--text-muted]">
            Deposits are manually reviewed. Your balance will be credited within 24 hours.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
