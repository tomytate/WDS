import type { StoreSettings } from "@wongdigital/db";
import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  QrCode,
  Upload,
  CheckCircle2,
  Clock,
  Globe,
  Mail,
  Phone,
  Sparkles,
  Shield,
  Zap,
  Wallet,
} from "lucide-react";
import { Badge, Input } from "@wongdigital/ui";

import { FieldError } from "@/components/storefront/field-error";
import { handlingHoursLabel } from "@/lib/urgency";
import type { OrderFormValues } from "@/lib/schemas";

export type PaymentStepProps = {
  receiptError: string | null;
  receiptFile: File | null;
  setReceiptError: (error: string | null) => void;
  setReceiptFile: (file: File | null) => void;
  storeSettings: StoreSettings;
  countryCode?: string;
  walletBalance?: string | null;
  defaultPaymentMethod: "qrph" | "binance" | "alipay";
};

export function PaymentStep({
  receiptError,
  receiptFile,
  setReceiptError,
  setReceiptFile,
  storeSettings,
  countryCode = "PH",
  walletBalance,
  defaultPaymentMethod: _defaultPaymentMethod,
}: PaymentStepProps) {
  const form = useFormContext<OrderFormValues>();
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const currentMethod = form.watch("paymentMethod");
  const isWallet = currentMethod === "wallet";
  const isManualPayment = currentMethod === "qrph" || currentMethod === "binance" || currentMethod === "alipay";
  const isPH = countryCode === "PH";

  const hasWalletBalance = Number(walletBalance || 0) > 0;

  // Create a local preview URL when receiptFile changes
  useEffect(() => {
    if (!receiptFile) {
      setLocalPreviewUrl(null);
      return;
    }

    // Only create preview for image files
    if (receiptFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(receiptFile);
      setLocalPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalPreviewUrl(null);
    }
  }, [receiptFile]);

  const previewUrl = localPreviewUrl;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Payment Method Selector ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[--text-muted]">Choose Payment Method</p>

        {/* PH users: QRPH + Binance + Alipay */}
        {isPH && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {([
              { value: "qrph" as const, label: "QRPH / GCash", icon: <QrCode size={18} />, disabled: false },
              { value: "binance" as const, label: "Binance/Crypto", icon: <Zap size={18} />, disabled: false },
              { value: "alipay" as const, label: "Alipay", icon: <Globe size={18} />, disabled: false },
            ] as const).map((method) => (
              <button
                key={method.value}
                type="button"
                disabled={method.disabled}
                className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs sm:text-sm font-semibold transition-all ${
                  method.disabled
                    ? "border-[color-mix(in_srgb,var(--border)_40%,transparent)] bg-[color-mix(in_srgb,var(--bg-surface)_30%,transparent)] text-[--text-muted] cursor-not-allowed opacity-60"
                    : currentMethod === method.value
                      ? "border-[--accent] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[--accent] shadow-[0_0_12px_color-mix(in_srgb,var(--accent)_16%,transparent)]"
                      : "border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] text-[--text-secondary] hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] hover:text-[--text-primary]"
                }`}
                onClick={() => {
                  if (!method.disabled) form.setValue("paymentMethod", method.value);
                }}
              >
                {method.disabled && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[--bg-surface] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[--text-muted] border border-[--border] shadow-sm z-10">
                    Coming Soon
                  </span>
                )}
                {method.icon}
                {method.label}
              </button>
            ))}
          </div>
        )}

        {/* Non-PH users: Binance + Alipay */}
        {!isPH && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <button
              type="button"
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs sm:text-sm font-semibold transition-all ${
                currentMethod === "binance"
                  ? "border-[--accent] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[--accent] shadow-[0_0_12px_color-mix(in_srgb,var(--accent)_16%,transparent)]"
                  : "border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] text-[--text-secondary] hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] hover:text-[--text-primary]"
              }`}
              onClick={() => form.setValue("paymentMethod", "binance")}
            >
              <Zap size={18} />
              Binance Pay
            </button>
            <button
              type="button"
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs sm:text-sm font-semibold transition-all ${
                currentMethod === "alipay"
                  ? "border-[--accent] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[--accent] shadow-[0_0_12px_color-mix(in_srgb,var(--accent)_16%,transparent)]"
                  : "border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] text-[--text-secondary] hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] hover:text-[--text-primary]"
              }`}
              onClick={() => form.setValue("paymentMethod", "alipay")}
            >
              <Globe size={18} />
              Alipay
            </button>
          </div>
        )}

        {hasWalletBalance && (
          <button
            type="button"
            className={`w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs sm:text-sm font-semibold transition-all ${
              isWallet
                ? "border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[--color-success] shadow-[0_0_12px_color-mix(in_srgb,var(--color-success)_16%,transparent)]"
                : "border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] text-[--text-secondary] hover:border-[color-mix(in_srgb,var(--color-success)_30%,var(--border))] hover:text-[--text-primary]"
            }`}
            onClick={() => form.setValue("paymentMethod", "wallet")}
          >
            <Wallet size={16} />
            Pay with Wallet ({walletBalance} USDT)
          </button>
        )}
      </div>

      {/* ── Active Method Header ── */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-[--accent] bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_10%,transparent)] to-[color-mix(in_srgb,var(--accent)_4%,transparent)] p-4 sm:p-5 shadow-[0_0_24px_color-mix(in_srgb,var(--accent)_12%,transparent)]">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[--accent] text-[--accent-fg] shadow-[0_4px_12px_color-mix(in_srgb,var(--accent)_30%,transparent)]">
              {isWallet ? (
                <Wallet
                  size={18}
                  className="sm:h-[22px] sm:w-[22px]"
                  aria-hidden="true"
                />
              ) : (
                <QrCode
                  size={18}
                  className="sm:h-[22px] sm:w-[22px]"
                  aria-hidden="true"
                />
              )}
            </div>
            <div>
              <p className="font-display text-lg sm:text-2xl lg:text-3xl tracking-tight text-[--text-primary]">
                {isWallet
                  ? "Wallet Pay"
                  : currentMethod === "binance"
                    ? "Binance Pay"
                    : currentMethod === "alipay"
                      ? "Alipay QR"
                      : "QRPH Payment"}
              </p>
              <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm leading-relaxed text-[--text-secondary]">
                {isWallet
                  ? "Instant checkout — debited from your wallet"
                  : currentMethod === "binance"
                    ? "Send payment, upload receipt & reference"
                    : "Scan QR, upload receipt & reference"}
              </p>
            </div>
          </div>
          <Badge
            tone="accent"
            className="hidden sm:flex shrink-0 gap-1.5 shadow-[0_0_8px_color-mix(in_srgb,var(--accent)_16%,transparent)]"
          >
            <CheckCircle2 size={10} aria-hidden="true" />
            Selected
          </Badge>
        </div>
      </div>

      {/* ── QR / Binance Instructions (manual payments only) ── */}
      {isManualPayment && (
      <div className="rounded-xl sm:rounded-2xl border border-[--border] bg-[--bg-card] p-4 sm:p-5 lg:p-6">
        <div className="flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-5">
          <div
            className="h-px flex-1 bg-gradient-to-r from-transparent to-[--border]"
            aria-hidden="true"
          />
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[--text-muted] font-semibold">
            Scan &amp; Pay
          </p>
          <div
            className="h-px flex-1 bg-gradient-to-l from-transparent to-[--border]"
            aria-hidden="true"
          />
        </div>

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          {form.watch("paymentMethod") === "alipay" ? (
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] backdrop-blur-xl p-3 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] text-center flex flex-col items-center justify-center">
              <Image
                alt="Alipay QR code"
                className="mx-auto aspect-[1/1] w-full max-w-[200px] sm:max-w-[260px] object-contain drop-shadow-md rounded-lg"
                height={260}
                sizes="(max-width: 640px) 200px, 260px"
                src="/payments/alipay-qr.webp"
                width={260}
              />
            </div>
          ) : form.watch("paymentMethod") === "qrph" ? (
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] backdrop-blur-xl p-3 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] text-center flex flex-col items-center justify-center">
              <Image
                alt="QRPH QR code"
                className="mx-auto aspect-[1/1] w-full max-w-[200px] sm:max-w-[260px] object-contain drop-shadow-md rounded-lg"
                height={260}
                sizes="(max-width: 640px) 200px, 260px"
                src="/payments/gcash-qr.webp"
                width={260}
              />
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-[color-mix(in_srgb,var(--accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--accent)_5%,transparent)] backdrop-blur-xl p-4 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] text-center">
              <div className="w-full max-w-[200px] sm:max-w-[220px] rounded-xl overflow-hidden bg-white p-2 shadow-sm mb-4">
                <Image
                  alt="Binance QR code"
                  className="mx-auto aspect-[1/1] w-full object-contain"
                  height={220}
                  sizes="(max-width: 640px) 200px, 220px"
                  src="/payments/binance-qr.webp"
                  width={220}
                />
              </div>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.16em] text-[--text-muted] font-semibold">
                Binance UID
              </p>
              <p className="mt-1 font-mono text-xl sm:text-2xl font-bold tracking-wider text-[--text-primary]">
                {storeSettings.binancePayId || "—"}
              </p>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm leading-relaxed text-[--text-primary]">
              {form.watch("paymentMethod") === "binance"
                ? storeSettings.binanceInstructions
                : form.watch("paymentMethod") === "alipay"
                  ? "Scan the Alipay QR code to complete your payment."
                  : storeSettings.qrphInstructions}
            </p>

            {form.watch("paymentMethod") === "qrph" && (
              <a
                className="group inline-flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-full border border-[#0052FF] bg-[#0052FF] text-sm sm:text-base font-semibold tracking-[0.02em] text-white shadow-[0_4px_16px_rgba(0,82,255,0.3)] transition-all duration-300 active:scale-[0.98]"
                href="gcash://qrscan"
              >
                <QrCode
                  size={16}
                  className="sm:h-[18px] sm:w-[18px]"
                  aria-hidden="true"
                />
                Open QR Scanner
              </a>
            )}
            <div className="grid gap-2 sm:gap-3 grid-cols-2">
              <div className="rounded-lg sm:rounded-xl border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_70%,transparent)] p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Phone
                    size={12}
                    className="sm:h-3.5 sm:w-3.5 text-[--text-muted]"
                    aria-hidden="true"
                  />
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[--text-muted] font-semibold">
                    {form.watch("paymentMethod") === "binance"
                      ? "Pay ID"
                      : form.watch("paymentMethod") === "alipay"
                        ? "Alipay Account"
                        : "Number"}
                  </p>
                </div>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium text-[--text-primary]">
                  {form.watch("paymentMethod") === "binance"
                    ? storeSettings.binancePayId
                    : form.watch("paymentMethod") === "alipay"
                      ? "WongDigital"
                      : storeSettings.qrphNumber}
                </p>
              </div>
              <div className="rounded-lg sm:rounded-xl border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_70%,transparent)] p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Mail
                    size={12}
                    className="sm:h-3.5 sm:w-3.5 text-[--text-muted]"
                    aria-hidden="true"
                  />
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[--text-muted] font-semibold">
                    Support
                  </p>
                </div>
                <a
                  className="mt-1.5 sm:mt-2 block text-xs sm:text-sm font-medium text-[--accent] hover:underline truncate"
                  href={`mailto:${storeSettings.supportEmail}`}
                >
                  {storeSettings.supportEmail}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)] p-2.5 sm:p-3">
              <Clock
                size={12}
                className="sm:h-3.5 sm:w-3.5 shrink-0 text-[--color-info]"
                aria-hidden="true"
              />
              <p className="text-[10px] sm:text-xs text-[--text-secondary]">
                Handling: {handlingHoursLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── Wallet Instant Pay Banner (wallet only) ── */}
      {isWallet && (
        <div className="rounded-xl sm:rounded-2xl border-2 border-[--color-success] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-success)_8%,var(--bg-card))] to-[var(--bg-card)] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[--color-success] text-white shadow-[0_4px_16px_color-mix(in_srgb,var(--color-success)_30%,transparent)]">
              <Wallet size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[--text-primary]">
                1-Click Instant Checkout
              </p>
              <p className="text-xs text-[--text-muted]">
                No receipt required — payment is debited instantly from your wallet.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-success)_20%,transparent)] px-4 py-3">
            <span className="text-xs uppercase tracking-[0.2em] text-[--text-muted] font-semibold">
              Available Balance
            </span>
            <span className="font-display text-lg font-bold text-[--color-success]">
              USDT {Number(walletBalance ?? 0).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)] p-2.5 sm:p-3">
            <Zap size={12} className="shrink-0 text-[--color-info]" />
            <p className="text-[10px] sm:text-xs text-[--text-secondary]">
              Wallet payments are instant — no manual review required.
            </p>
          </div>
        </div>
      )}

      {/* ── Receipt Upload (manual payments only) ── */}
      {isManualPayment && (
      <div className="rounded-xl sm:rounded-2xl border border-[--border] bg-[--bg-card] p-4 sm:p-5 lg:p-6">
        <div className="flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-5">
          <div
            className="h-px flex-1 bg-gradient-to-r from-transparent to-[--border]"
            aria-hidden="true"
          />
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[--text-muted] font-semibold">
            Upload Proof
          </p>
          <div
            className="h-px flex-1 bg-gradient-to-l from-transparent to-[--border]"
            aria-hidden="true"
          />
        </div>

        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:space-y-2.5">
            <label
              className="text-xs sm:text-sm font-medium text-[--text-primary]"
              htmlFor="paymentReference"
            >
              Reference Number
            </label>
            <Input
              id="paymentReference"
              placeholder="Payment reference number"
              className="h-11 sm:h-12 text-sm sm:text-base"
              {...form.register("paymentReference")}
            />
            <FieldError
              error={form.formState.errors.paymentReference?.message}
            />
          </div>

          <div className="space-y-2 sm:space-y-2.5">
            <label
              className="text-xs sm:text-sm font-medium text-[--text-primary]"
              htmlFor="receiptFile"
            >
              Upload Receipt
            </label>
            <label
              className={`group cursor-pointer overflow-hidden rounded-lg sm:rounded-xl border-2 border-dashed transition-all duration-300 active:scale-[0.99] ${
                previewUrl || receiptFile
                  ? "border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_6%,transparent)]"
                  : "border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)]"
              } ${
                previewUrl
                  ? "block"
                  : "flex min-h-[100px] sm:min-h-[120px] flex-col items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-4 sm:py-6"
              }`}
              htmlFor="receiptFile"
            >
              {previewUrl ? (
                <div className="relative h-40 sm:h-48 w-full">
                  <Image
                    alt="Uploaded receipt preview"
                    className="object-cover"
                    fill
                    src={previewUrl}
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 sm:gap-3 bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent px-3 py-3 sm:px-4 sm:py-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <CheckCircle2
                        size={12}
                        className="sm:h-3.5 sm:w-3.5 text-[--color-success]"
                        aria-hidden="true"
                      />
                      <span className="truncate text-[10px] sm:text-xs font-medium text-white">
                        Uploaded
                      </span>
                    </div>
                    <span className="rounded-full border border-white/30 bg-white/10 px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium text-white backdrop-blur-sm">
                      Change
                    </span>
                  </div>
                </div>
              ) : receiptFile ? (
                <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 py-4 sm:py-6">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[--color-success]">
                    <CheckCircle2
                      size={16}
                      className="sm:h-[18px] sm:w-[18px]"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[--color-success] text-center truncate max-w-full px-2">
                    {receiptFile.name}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[--text-muted]">
                    Tap to change
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[--accent]">
                    <Upload
                      size={16}
                      className="sm:h-[18px] sm:w-[18px]"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-xs sm:text-sm text-[--text-secondary] text-center">
                    Tap to upload receipt
                  </span>
                  <span className="text-[10px] sm:text-xs text-[--text-muted]">
                    JPG, PNG, WEBP, PDF
                  </span>
                </>
              )}
            </label>
            <input
              accept="image/jpeg,image/png,image/webp,application/pdf"
              capture="environment"
              className="sr-only"
              id="receiptFile"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setReceiptFile(nextFile);
                setReceiptError(null);
              }}
              type="file"
            />
            <FieldError error={receiptError ?? undefined} />
          </div>
        </div>
      </div>
      )}

      {/* Trust indicators - horizontal scroll on mobile */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border border-[--border] bg-[--bg-card] p-2.5 sm:p-3 shrink-0 min-w-[140px] sm:min-w-0">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[--color-success]">
            <Shield
              size={12}
              className="sm:h-3.5 sm:w-3.5"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[--text-primary]">
              Secure
            </p>
            <p className="text-[9px] sm:text-[10px] text-[--text-muted]">
              Encrypted
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border border-[--border] bg-[--bg-card] p-2.5 sm:p-3 shrink-0 min-w-[140px] sm:min-w-0">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[--accent]">
            <Zap size={12} className="sm:h-3.5 sm:w-3.5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[--text-primary]">
              Fast
            </p>
            <p className="text-[9px] sm:text-[10px] text-[--text-muted]">
              {handlingHoursLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border border-[--border] bg-[--bg-card] p-2.5 sm:p-3 shrink-0 min-w-[140px] sm:min-w-0">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[--color-info]">
            <Sparkles
              size={12}
              className="sm:h-3.5 sm:w-3.5"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[--text-primary]">
              Instant Delivery
            </p>
            <p className="text-[9px] sm:text-[10px] text-[--text-muted]">
              Email confirmation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
