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

import { Card, CardContent, FieldWrapper, Input, buttonStyles } from "@wongdigital/ui"

import { requestDeposit } from "./actions"

const PRESET_AMOUNTS_USDT = [10, 25, 50, 100]

import type { StoreSettings } from "@wongdigital/db"

export function WalletTopUpForm({
  customerId: _customerId,
  storeSettings,
}: {
  customerId: string
  storeSettings: StoreSettings
}) {
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
      <Card className="border-[--color-success]">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-[--radius-inner] border border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[--color-success-text] mb-4">
            <CheckCircle2 size={22} />
          </div>
          <h3 className="font-display text-2xl font-semibold tracking-tight text-[--text-primary]">
            Deposit request submitted.
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[--text-secondary]">
            Your deposit of{" "}
            <strong className="text-[--text-primary]">
              USDT {Number(amountUsdt).toFixed(2)}
            </strong>{" "}
            via {paymentMethod === "qrph" ? "QRPH" : "Binance Pay"} has been
            submitted. An admin will review and credit your wallet within 24
            hours.
          </p>
          <button
            className={buttonStyles({ className: "mt-6", variant: "ghost" })}
            onClick={() => {
              setSuccess(false)
              setAmountUsdt("")
              setReferenceId("")
            }}
            type="button"
          >
            Submit another
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <div className="border-b border-[--border] px-5 sm:px-6 py-3 flex items-center gap-2.5">
        <Wallet size={13} className="text-[--text-muted]" />
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
          / Top up your wallet
        </p>
      </div>
      <CardContent className="p-5 sm:p-6 space-y-5">
        <p className="text-sm text-[--text-secondary]">
          Send payment and submit your reference to request a deposit.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Preset USDT Amounts */}
          <div className="space-y-2">
            <label className="block font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[--text-muted]">
              Select amount
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_AMOUNTS_USDT.map((preset) => (
                <button
                  key={preset}
                  className={`rounded-[--radius-inner] border px-3 py-2.5 text-sm font-semibold tabular-nums transition-colors duration-150 ${
                    amountUsdt === String(preset)
                      ? "border-[--text-primary] bg-[--text-primary] text-[--bg-base]"
                      : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--text-primary] hover:text-[--text-primary]"
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
          <FieldWrapper htmlFor="custom-amount" label="Or enter custom amount (USDT)">
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
          </FieldWrapper>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="block font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[--text-muted]">
              Payment method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`flex items-center justify-center gap-2 rounded-[--radius-inner] border px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  paymentMethod === "qrph"
                    ? "border-[--text-primary] bg-[--text-primary] text-[--bg-base]"
                    : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--text-primary] hover:text-[--text-primary]"
                }`}
                onClick={() => setPaymentMethod("qrph")}
                type="button"
              >
                <QrCode size={14} />
                QRPH
              </button>
              <button
                className={`flex items-center justify-center gap-2 rounded-[--radius-inner] border px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  paymentMethod === "binance_pay"
                    ? "border-[--text-primary] bg-[--text-primary] text-[--bg-base]"
                    : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--text-primary] hover:text-[--text-primary]"
                }`}
                onClick={() => setPaymentMethod("binance_pay")}
                type="button"
              >
                <Wallet size={14} />
                Binance Pay
              </button>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] p-4">
            {paymentMethod === "qrph" ? (
              <div className="rounded-[--radius-inner] border border-[--border] bg-[--bg-card] p-3">
                <Image
                  alt="QRPH QR code"
                  className="mx-auto aspect-[1/1] w-full max-w-[180px] object-contain rounded-[--radius-inner]"
                  src="/payments/gcash-qr.webp"
                  width={180}
                  height={180}
                  priority
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-card] p-4 text-center">
                <div className="w-full max-w-[160px] rounded-[--radius-inner] overflow-hidden bg-white p-2 mb-3">
                  <Image
                    alt="Binance QR code"
                    className="mx-auto aspect-[1/1] w-full object-contain"
                    src="/payments/binance-qr.webp"
                    width={160}
                    height={160}
                  />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                  Binance UID
                </p>
                <p className="mt-1 font-mono text-base font-bold tracking-wider text-[--text-primary]">
                  {storeSettings.binancePayId || "—"}
                </p>
              </div>
            )}

            <div className="space-y-3 flex flex-col justify-center">
              <p className="text-sm leading-relaxed text-[--text-primary]">
                {paymentMethod === "binance_pay"
                  ? storeSettings.binanceInstructions
                  : storeSettings.qrphInstructions}
              </p>
              <div className="rounded-[--radius-inner] border-l-2 border-[--accent] bg-[--bg-card] p-3 text-xs text-[--text-secondary]">
                <p className="font-mono uppercase tracking-[0.08em] font-semibold text-[--text-primary] mb-1">
                  How to top up
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Scan the QR code and pay the amount shown.</li>
                  <li>Copy your transaction/reference ID after payment.</li>
                  <li>Paste the reference below to request your deposit.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reference Number */}
          <FieldWrapper htmlFor="deposit-reference" label="Payment reference number">
            <Input
              id="deposit-reference"
              placeholder="Enter your reference / transaction ID"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
            />
          </FieldWrapper>

          {/* Error */}
          {error && (
            <p className="rounded-[--radius-inner] border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-2.5 text-sm font-medium text-[--color-danger-text]">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            className={buttonStyles({ className: "w-full justify-center gap-2" })}
            disabled={isPending || !amountUsdt}
            type="submit"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Wallet size={14} />
                Request deposit
              </>
            )}
          </button>

          <p className="text-center text-xs text-[--text-muted]">
            Deposits are manually reviewed. Your balance will be credited within 24 hours.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
