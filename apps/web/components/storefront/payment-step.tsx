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
import { Badge, Input, buttonStyles } from "@wongdigital/ui";

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
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[--text-muted]">
          Choose payment method
        </p>

        {/* PH users: QRPH + Binance + Alipay */}
        {isPH && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {([
              { value: "qrph" as const, label: "QRPH / GCash", icon: <QrCode size={16} />, disabled: false },
              { value: "binance" as const, label: "Binance/Crypto", icon: <Zap size={16} />, disabled: false },
              { value: "alipay" as const, label: "Alipay", icon: <Globe size={16} />, disabled: false },
            ] as const).map((method) => (
              <button
                key={method.value}
                type="button"
                disabled={method.disabled}
                className={`relative flex flex-col items-center justify-center gap-1.5 rounded-[--radius-inner] border px-2 py-3 text-xs sm:text-sm font-semibold transition-colors duration-150 ${
                  method.disabled
                    ? "border-[--border] bg-[--bg-surface] text-[--text-muted] cursor-not-allowed opacity-60"
                    : currentMethod === method.value
                      ? "border-[--text-primary] bg-[--text-primary] text-[--bg-base]"
                      : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--text-primary] hover:text-[--text-primary]"
                }`}
                onClick={() => {
                  if (!method.disabled) form.setValue("paymentMethod", method.value);
                }}
              >
                {method.disabled && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[--radius-inner] bg-[--bg-card] px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-[--text-muted] border border-[--border] z-10">
                    Soon
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              className={`flex flex-col items-center justify-center gap-1.5 rounded-[--radius-inner] border px-2 py-3 text-xs sm:text-sm font-semibold transition-colors duration-150 ${
                currentMethod === "binance"
                  ? "border-[--text-primary] bg-[--text-primary] text-[--bg-base]"
                  : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--text-primary] hover:text-[--text-primary]"
              }`}
              onClick={() => form.setValue("paymentMethod", "binance")}
            >
              <Zap size={16} />
              Binance Pay
            </button>
            <button
              type="button"
              className={`flex flex-col items-center justify-center gap-1.5 rounded-[--radius-inner] border px-2 py-3 text-xs sm:text-sm font-semibold transition-colors duration-150 ${
                currentMethod === "alipay"
                  ? "border-[--text-primary] bg-[--text-primary] text-[--bg-base]"
                  : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--text-primary] hover:text-[--text-primary]"
              }`}
              onClick={() => form.setValue("paymentMethod", "alipay")}
            >
              <Globe size={16} />
              Alipay
            </button>
          </div>
        )}

        {hasWalletBalance && (
          <button
            type="button"
            className={`w-full flex items-center justify-center gap-2 rounded-[--radius-inner] border px-4 py-3 text-sm font-semibold transition-colors duration-150 ${
              isWallet
                ? "border-[--color-success] bg-[--color-success] text-white"
                : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--color-success] hover:text-[--color-success-text]"
            }`}
            onClick={() => form.setValue("paymentMethod", "wallet")}
          >
            <Wallet size={14} />
            Pay with Wallet ({walletBalance} USDT)
          </button>
        )}
      </div>

      {/* ── Active Method Header ── */}
      <div className="relative overflow-hidden rounded-[--radius-card] border border-[--text-primary] bg-[--bg-card] p-5">
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[--radius-inner] bg-[--accent] text-[--accent-fg]">
              {isWallet ? (
                <Wallet size={18} aria-hidden="true" />
              ) : (
                <QrCode size={18} aria-hidden="true" />
              )}
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                Selected method
              </p>
              <p className="mt-1 font-display text-xl sm:text-2xl font-semibold tracking-tight text-[--text-primary]">
                {isWallet
                  ? "Wallet Pay"
                  : currentMethod === "binance"
                    ? "Binance Pay"
                    : currentMethod === "alipay"
                      ? "Alipay QR"
                      : "QRPH"}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[--text-secondary]">
                {isWallet
                  ? "Instant checkout — debited from your wallet"
                  : currentMethod === "binance"
                    ? "Send payment, upload receipt & reference"
                    : "Scan QR, upload receipt & reference"}
              </p>
            </div>
          </div>
          <Badge tone="accent" size="sm" className="hidden sm:inline-flex shrink-0 gap-1">
            <CheckCircle2 size={9} aria-hidden="true" />
            Active
          </Badge>
        </div>
      </div>

      {/* ── QR / Binance Instructions (manual payments only) ── */}
      {isManualPayment && (
      <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-5 sm:p-6">
        <div className="section-rule mb-5">
          <span>Scan &amp; pay</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          {form.watch("paymentMethod") === "alipay" ? (
            <div className="relative overflow-hidden rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] p-4 text-center flex flex-col items-center justify-center">
              <Image
                alt="Alipay QR code"
                className="mx-auto aspect-[1/1] w-full max-w-[260px] object-contain rounded-[--radius-inner]"
                height={260}
                sizes="(max-width: 640px) 200px, 260px"
                src="/payments/alipay-qr.webp"
                width={260}
              />
            </div>
          ) : form.watch("paymentMethod") === "qrph" ? (
            <div className="relative overflow-hidden rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] p-4 text-center flex flex-col items-center justify-center">
              <Image
                alt="QRPH QR code"
                className="mx-auto aspect-[1/1] w-full max-w-[260px] object-contain rounded-[--radius-inner]"
                height={260}
                sizes="(max-width: 640px) 200px, 260px"
                src="/payments/gcash-qr.webp"
                width={260}
              />
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] p-5 text-center">
              <div className="w-full max-w-[220px] rounded-[--radius-inner] overflow-hidden bg-white p-2 mb-4">
                <Image
                  alt="Binance QR code"
                  className="mx-auto aspect-[1/1] w-full object-contain"
                  height={220}
                  sizes="(max-width: 640px) 200px, 220px"
                  src="/payments/binance-qr.webp"
                  width={220}
                />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                Binance UID
              </p>
              <p className="mt-1 font-mono text-xl font-bold tracking-wider text-[--text-primary]">
                {storeSettings.binancePayId || "—"}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-[--text-primary]">
              {form.watch("paymentMethod") === "binance"
                ? storeSettings.binanceInstructions
                : form.watch("paymentMethod") === "alipay"
                  ? "Scan the Alipay QR code to complete your payment."
                  : storeSettings.qrphInstructions}
            </p>

            {form.watch("paymentMethod") === "qrph" && (
              <a
                className={buttonStyles({
                  className: "w-full justify-center gap-2",
                  size: "lg",
                })}
                href="gcash://qrscan"
              >
                <QrCode size={14} aria-hidden="true" />
                Open QR Scanner
              </a>
            )}
            <div className="grid gap-px bg-[--border] border border-[--border] rounded-[--radius-inner] overflow-hidden grid-cols-2">
              <div className="bg-[--bg-card] p-3">
                <div className="flex items-center gap-2">
                  <Phone size={11} className="text-[--text-muted]" aria-hidden="true" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--text-muted]">
                    {form.watch("paymentMethod") === "binance"
                      ? "Pay ID"
                      : form.watch("paymentMethod") === "alipay"
                        ? "Alipay account"
                        : "Number"}
                  </p>
                </div>
                <p className="mt-1.5 text-sm font-medium text-[--text-primary]">
                  {form.watch("paymentMethod") === "binance"
                    ? storeSettings.binancePayId
                    : form.watch("paymentMethod") === "alipay"
                      ? "WongDigital"
                      : storeSettings.qrphNumber}
                </p>
              </div>
              <div className="bg-[--bg-card] p-3">
                <div className="flex items-center gap-2">
                  <Mail size={11} className="text-[--text-muted]" aria-hidden="true" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--text-muted]">
                    Support
                  </p>
                </div>
                <a
                  className="mt-1.5 block text-sm font-medium text-[--text-primary] underline-offset-2 hover:underline truncate"
                  href={`mailto:${storeSettings.supportEmail}`}
                >
                  {storeSettings.supportEmail}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] px-3 py-2">
              <Clock size={11} className="shrink-0 text-[--text-muted]" aria-hidden="true" />
              <p className="text-xs text-[--text-secondary]">
                Handling: {handlingHoursLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── Wallet Instant Pay Banner (wallet only) ── */}
      {isWallet && (
        <div className="rounded-[--radius-card] border border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_6%,var(--bg-card))] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[--radius-inner] bg-[--color-success] text-white">
              <Wallet size={18} />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-[--text-primary]">
                1-Click Instant Checkout
              </p>
              <p className="text-xs text-[--text-muted]">
                No receipt required — payment is debited instantly from your wallet.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-[--radius-inner] border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[--bg-card] px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
              Available balance
            </span>
            <span className="font-display text-lg font-semibold tabular-nums text-[--color-success-text]">
              USDT {Number(walletBalance ?? 0).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] px-3 py-2.5">
            <Zap size={12} className="shrink-0 text-[--text-muted]" />
            <p className="text-xs text-[--text-secondary]">
              Wallet payments are instant — no manual review required.
            </p>
          </div>
        </div>
      )}

      {/* ── Receipt Upload (manual payments only) ── */}
      {isManualPayment && (
      <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-5 sm:p-6">
        <div className="section-rule mb-5">
          <span>Upload proof</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="block font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[--text-muted]"
              htmlFor="paymentReference"
            >
              Reference number
            </label>
            <Input
              id="paymentReference"
              placeholder="Payment reference number"
              {...form.register("paymentReference")}
            />
            <FieldError
              error={form.formState.errors.paymentReference?.message}
            />
          </div>

          <div className="space-y-2">
            <label
              className="block font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[--text-muted]"
              htmlFor="receiptFile"
            >
              Upload receipt
            </label>
            <label
              className={`group cursor-pointer overflow-hidden rounded-[--radius-inner] border border-dashed transition-colors duration-200 ${
                previewUrl || receiptFile
                  ? "border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_6%,transparent)]"
                  : "border-[--border] bg-[--bg-surface] hover:border-[--text-primary]"
              } ${
                previewUrl
                  ? "block"
                  : "flex min-h-[120px] flex-col items-center justify-center gap-2 px-4 py-6"
              }`}
              htmlFor="receiptFile"
            >
              {previewUrl ? (
                <div className="relative h-44 w-full">
                  <Image
                    alt="Uploaded receipt preview"
                    className="object-cover"
                    fill
                    src={previewUrl}
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-[rgba(0,0,0,0.85)] to-transparent px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-[--accent]" aria-hidden="true" />
                      <span className="truncate font-mono text-[10px] uppercase tracking-[0.08em] font-semibold text-white">
                        Uploaded
                      </span>
                    </div>
                    <span className="rounded-[--radius-inner] border border-white/30 bg-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] font-medium text-white backdrop-blur-sm">
                      Change
                    </span>
                  </div>
                </div>
              ) : receiptFile ? (
                <div className="flex flex-col items-center justify-center gap-2 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[--radius-inner] border border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[--color-success-text]">
                    <CheckCircle2 size={16} aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-[--color-success-text] text-center truncate max-w-full px-2">
                    {receiptFile.name}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[--text-muted]">
                    Tap to change
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex h-9 w-9 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-card] text-[--text-primary]">
                    <Upload size={15} aria-hidden="true" />
                  </div>
                  <span className="text-sm text-[--text-secondary] text-center">
                    Tap to upload receipt
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[--text-muted]">
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

      {/* Trust indicators */}
      <div className="grid gap-px bg-[--border] border border-[--border] rounded-[--radius-card] overflow-hidden grid-cols-3">
        {[
          { icon: Shield, label: "Secure", sub: "Encrypted" },
          { icon: Zap, label: "Fast", sub: handlingHoursLabel },
          { icon: Sparkles, label: "Instant", sub: "Email confirmation" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-2.5 bg-[--bg-card] p-3"
            >
              <Icon size={13} className="shrink-0 text-[--text-muted]" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[--text-primary]">
                  {item.label}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[--text-muted] truncate">
                  {item.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
