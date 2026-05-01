import type { Product, StoreSettings } from "@wongdigital/db";
import { useFormContext } from "react-hook-form";
import {
  ShoppingCart,
  User,
  CreditCard,
  Clock,
  CheckCircle2,
  Link2,
  Mail,
  Phone,
  FileText,
  Heart,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import { ProductLogo } from "@/components/product-logo";
import type { SelectedCartItem } from "@/components/storefront/cart-summary";
import type { OrderFormValues, OrderSelectionValue } from "@/lib/schemas";
import { formatOrderItemMeta } from "@/lib/format";
import { useGeoPricing } from "@/hooks/use-geo-pricing";
import { getServiceTargetConfig } from "@wongdigital/db/pricing";
import { handlingHoursLabel } from "@/lib/urgency";

export type ReviewStepProps = {
  hasServiceItems: boolean;
  receiptFile: File | null;
  selectedCartItems: SelectedCartItem[];
  selectedServiceItems: Array<{
    index: number;
    item: OrderSelectionValue;
    product: Product;
  }>;
  storeSettings: StoreSettings;
  subtotalPrice: string;
  safeTipAmount: number;
  discountAmount?: string;
  appliedPromoCode?: string;
  totalPrice: string;
};

export function ReviewStep({
  hasServiceItems,
  receiptFile,
  selectedCartItems,
  selectedServiceItems,
  storeSettings,
  subtotalPrice,
  safeTipAmount,
  discountAmount,
  appliedPromoCode,
  totalPrice,
}: ReviewStepProps) {
  const form = useFormContext<OrderFormValues>();
  const { formatPrimaryPrice, formatSecondaryPrice, calculateDisplayTotals, showSecondary } = useGeoPricing();

  const { formattedSubtotal, formattedTip, formattedDiscount, formattedTotal } = calculateDisplayTotals(selectedCartItems, safeTipAmount, discountAmount || "0");
  const customerNameValue = form.watch("customerName");
  const customerEmailValue = form.watch("customerEmail");
  const customerPhoneValue = form.watch("customerPhone");
  const paymentMethodValue = form.watch("paymentMethod");
  const paymentReferenceValue = form.watch("paymentReference");
  const serviceDetailsValue = form.watch("serviceDetails");

  const paymentMethodLabels: Record<string, string> = {
    qrph: "QRPH",
    binance: "Binance Pay",
    alipay: "Alipay",
    wallet: "Wallet",
  };
  const paymentLabel = paymentMethodLabels[paymentMethodValue] ?? "Payment";

  const hasAllRequiredInfo =
    selectedCartItems.length > 0 &&
    customerNameValue &&
    customerEmailValue &&
    paymentReferenceValue &&
    receiptFile;

  return (
    <div className="space-y-5">
      {/* Ready to Submit Banner */}
      <div
        className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 ${
          hasAllRequiredInfo
            ? "border-[--color-success] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-success)_10%,transparent)] to-[color-mix(in_srgb,var(--color-success)_4%,transparent)]"
            : "border-[--color-warning] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] to-[color-mix(in_srgb,var(--color-warning)_4%,transparent)]"
        }`}
      >
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] blur-xl"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              hasAllRequiredInfo
                ? "bg-[--color-success] text-white shadow-[0_4px_12px_color-mix(in_srgb,var(--color-success)_30%,transparent)]"
                : "bg-[--color-warning] text-white shadow-[0_4px_12px_color-mix(in_srgb,var(--color-warning)_30%,transparent)]"
            }`}
          >
            {hasAllRequiredInfo ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
          </div>
          <div>
            <p
              className={`font-semibold ${hasAllRequiredInfo ? "text-[--color-success]" : "text-[--color-warning]"}`}
            >
              {hasAllRequiredInfo ? "Ready to Submit" : "Review Information"}
            </p>
            <p className="text-sm text-[--text-secondary]">
              {hasAllRequiredInfo
                ? "All required information is complete. Please verify the details below."
                : "Some fields may need attention before submitting."}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items Card */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[--accent-tint-soft] text-[--accent]">
              <ShoppingCart size={16} aria-hidden="true" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-[--text-muted] font-semibold">
              Order Items
            </p>
          </div>
          <span className="rounded-full bg-[--accent-tint-soft] px-2.5 py-1 text-xs font-semibold text-[--accent]">
            {selectedCartItems.length} item
            {selectedCartItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="p-5 space-y-3">
          {selectedCartItems.map((item, index) => (
            <div
              className="flex items-center justify-between gap-4 rounded-xl border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-surface)_40%,transparent)] p-3 transition-all duration-200 hover:border-[--accent-border]"
              key={`${item.productId}-${index}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <ProductLogo
                  iconUrl={item.product.iconUrl}
                  name={item.product.name}
                  size="sm"
                />
                <div className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[--text-primary]">
                    {item.product.name}
                  </span>
                  <span className="block text-xs text-[--text-muted]">
                    {formatOrderItemMeta(item)}
                  </span>
                </div>
              </div>
              <span className="shrink-0 rounded-lg bg-[--accent-tint-soft] px-2.5 py-1.5 text-sm font-semibold text-[--accent]">
                {formatPrimaryPrice(item.unitPrice, item.product?.slug, item.accessPlan)}
              </span>
            </div>
          ))}

          {/* Service Target Links */}
          {selectedServiceItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[--border] space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={14} className="text-[--text-muted]" />
                <p className="text-xs text-[--text-muted] uppercase tracking-[0.15em] font-medium">
                  Service Targets
                </p>
              </div>
              {selectedServiceItems.map((serviceItem) => (
                <div
                  key={`target-${serviceItem.product.id}`}
                  className="flex flex-col gap-1 rounded-lg bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)] px-3 py-2.5"
                >
                  <span className="text-xs text-[--text-muted]">
                    {serviceItem.product.name} ·{" "}
                    {getServiceTargetConfig(serviceItem.product).label}
                  </span>
                  <span className="text-sm text-[--text-primary] break-all">
                    {serviceItem.item.targetUrl?.trim() || (
                      <span className="text-[--text-muted]">—</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="mt-4 pt-4 border-t border-[--border] space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[--text-secondary]">Subtotal</span>
              <span className="font-medium text-[--text-primary]">
                {formattedSubtotal}
              </span>
            </div>
            {safeTipAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-[--text-secondary]">
                  <Heart size={12} className="text-[--color-success]" />
                  Tip
                </span>
                <span className="font-medium text-[--color-success]">
                  {formattedTip}
                </span>
              </div>
            )}
            {Number(discountAmount || "0") > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-[--color-success]">
                  <Sparkles size={12} className="text-[--color-success]" />
                  Discount{" "}
                  <span className="text-[10px] uppercase font-semibold opacity-80 border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] px-1 rounded-full">
                    {appliedPromoCode}
                  </span>
                </span>
                <span className="shrink-0 text-right font-medium text-[--color-success]">
                  {formattedDiscount}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-dashed border-[--border]">
              <span className="font-semibold text-[--text-primary]">
                Grand Total
              </span>
              <span className="shrink-0 flex flex-col items-end rounded-lg bg-[--accent] px-3 py-1.5 text-right text-lg font-bold text-[--accent-fg] shadow-[0_2px_8px_var(--accent-tint-strong)]">
                <span>{formattedTotal}</span>
                {showSecondary && (
                  <span className="text-[10px] font-medium opacity-80 leading-[1.1] mt-0.5">≈ {formatSecondaryPrice(totalPrice)}</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3 rounded-lg bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)] px-3 py-2">
              <Clock size={12} className="shrink-0 text-[--color-info]" />
              <span className="text-xs text-[--text-secondary]">
                Handling: {handlingHoursLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details Card */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[--accent-tint-soft] text-[--accent]">
            <User size={16} aria-hidden="true" />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-[--text-muted] font-semibold">
            Customer Details
          </p>
        </div>

        <div className="p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-surface)_40%,transparent)] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <User size={12} className="text-[--text-muted]" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-[--text-muted] font-medium">
                  Name
                </span>
              </div>
              <p
                className={`text-sm font-medium ${customerNameValue ? "text-[--text-primary]" : "text-[--text-muted]"}`}
              >
                {customerNameValue || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-surface)_40%,transparent)] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Mail size={12} className="text-[--text-muted]" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-[--text-muted] font-medium">
                  Email
                </span>
              </div>
              <p
                className={`text-sm font-medium break-all ${customerEmailValue ? "text-[--text-primary]" : "text-[--text-muted]"}`}
              >
                {customerEmailValue || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-surface)_40%,transparent)] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Phone size={12} className="text-[--text-muted]" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-[--text-muted] font-medium">
                  Phone
                </span>
              </div>
              <p
                className={`text-sm font-medium ${customerPhoneValue ? "text-[--text-primary]" : "text-[--text-muted]"}`}
              >
                {customerPhoneValue || "—"}
              </p>
            </div>
          </div>

          {hasServiceItems && serviceDetailsValue?.trim() && (
            <div className="mt-4 pt-4 border-t border-[--border]">
              <div className="rounded-xl border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-surface)_40%,transparent)] p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <FileText size={12} className="text-[--text-muted]" />
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[--text-muted] font-medium">
                    Extra Instructions
                  </span>
                </div>
                <p className="text-sm text-[--text-primary] whitespace-pre-wrap">
                  {serviceDetailsValue}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Card */}
      <div className="rounded-2xl border border-[--border] bg-[--bg-card] overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[--accent-tint-soft] text-[--accent]">
              <CreditCard size={16} aria-hidden="true" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-[--text-muted] font-semibold">
              Payment
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] px-2.5 py-1 text-xs font-semibold text-[--color-success]">
            <Sparkles size={10} />
            {paymentLabel}
          </span>
        </div>

        <div className="p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-surface)_40%,transparent)] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <FileText size={12} className="text-[--text-muted]" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-[--text-muted] font-medium">
                  Reference #
                </span>
              </div>
              <p
                className={`text-sm font-medium font-mono ${paymentReferenceValue ? "text-[--text-primary]" : "text-[--text-muted]"}`}
              >
                {paymentReferenceValue || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-surface)_40%,transparent)] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2
                  size={12}
                  className={
                    receiptFile
                      ? "text-[--color-success]"
                      : "text-[--text-muted]"
                  }
                />
                <span className="text-[10px] uppercase tracking-[0.15em] text-[--text-muted] font-medium">
                  Receipt
                </span>
              </div>
              <p
                className={`text-sm font-medium truncate ${receiptFile ? "text-[--color-success]" : "text-[--text-muted]"}`}
              >
                {receiptFile?.name ?? "No file uploaded"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)] px-3 py-2.5">
            <Mail size={12} className="shrink-0 text-[--text-muted]" />
            <span className="text-xs text-[--text-secondary]">
              Support:{" "}
              <a
                href={`mailto:${storeSettings.supportEmail}`}
                className="text-[--accent] hover:underline"
              >
                {storeSettings.supportEmail}
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
