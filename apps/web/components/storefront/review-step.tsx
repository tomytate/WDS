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
        className={`relative overflow-hidden rounded-[--radius-card] border p-4 ${
          hasAllRequiredInfo
            ? "border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)]"
            : "border-[--color-warning] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)]"
        }`}
      >
        <div className="relative flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[--radius-inner] ${
              hasAllRequiredInfo
                ? "bg-[--color-success] text-white"
                : "bg-[--color-warning] text-white"
            }`}
          >
            {hasAllRequiredInfo ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
          </div>
          <div>
            <p
              className={`font-display text-base font-semibold tracking-tight ${
                hasAllRequiredInfo
                  ? "text-[--color-success-text]"
                  : "text-[--color-warning-text]"
              }`}
            >
              {hasAllRequiredInfo ? "Ready to submit" : "Review information"}
            </p>
            <p className="text-sm leading-relaxed text-[--text-secondary]">
              {hasAllRequiredInfo
                ? "All required information is complete. Please verify the details below."
                : "Some fields may need attention before submitting."}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items Card */}
      <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[--border] bg-[--bg-surface] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={13} className="text-[--text-muted]" aria-hidden="true" />
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
              Order items
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[--text-muted]">
            {String(selectedCartItems.length).padStart(2, "0")} {selectedCartItems.length !== 1 ? "items" : "item"}
          </span>
        </div>

        <div className="p-5 space-y-3">
          {selectedCartItems.map((item, index) => (
            <div
              className="flex items-center justify-between gap-4 rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] p-3 transition-colors duration-150 hover:border-[--text-primary]"
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
              <span className="shrink-0 font-display text-sm font-semibold tabular-nums text-[--text-primary]">
                {formatPrimaryPrice(item.unitPrice, item.product?.slug, item.accessPlan)}
              </span>
            </div>
          ))}

          {/* Service Target Links */}
          {selectedServiceItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[--border] space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={13} className="text-[--text-muted]" />
                <p className="font-mono text-[10px] text-[--text-muted] uppercase tracking-[0.12em]">
                  Service targets
                </p>
              </div>
              {selectedServiceItems.map((serviceItem) => (
                <div
                  key={`target-${serviceItem.product.id}`}
                  className="flex flex-col gap-1 rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] px-3 py-2.5"
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
                <span className="font-medium tabular-nums text-[--color-success-text]">
                  {formattedTip}
                </span>
              </div>
            )}
            {Number(discountAmount || "0") > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-[--color-success-text]">
                  <Sparkles size={12} className="text-[--color-success]" />
                  Discount{" "}
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] font-semibold border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] px-1.5 py-0.5 rounded-[--radius-inner]">
                    {appliedPromoCode}
                  </span>
                </span>
                <span className="shrink-0 text-right font-medium tabular-nums text-[--color-success-text]">
                  {formattedDiscount}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-[--border]">
              <span className="font-semibold text-[--text-primary]">
                Grand total
              </span>
              <span className="shrink-0 flex flex-col items-end text-right">
                <span className="font-display text-2xl font-semibold tabular-nums tracking-tight text-[--text-primary]">
                  {formattedTotal}
                </span>
                {showSecondary && (
                  <span className="font-mono text-[10px] font-medium text-[--text-muted] mt-0.5">
                    ≈ {formatSecondaryPrice(totalPrice)}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3 rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] px-3 py-2">
              <Clock size={12} className="shrink-0 text-[--text-muted]" />
              <span className="text-xs text-[--text-secondary]">
                Handling: {handlingHoursLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details Card */}
      <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-[--border] bg-[--bg-surface] px-5 py-3">
          <User size={13} className="text-[--text-muted]" aria-hidden="true" />
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
            Customer details
          </p>
        </div>

        <div className="p-5">
          <div className="grid gap-px bg-[--border] border border-[--border] rounded-[--radius-inner] overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-[--bg-card] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <User size={12} className="text-[--text-muted]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--text-muted]">
                  Name
                </span>
              </div>
              <p
                className={`text-sm font-medium ${customerNameValue ? "text-[--text-primary]" : "text-[--text-muted]"}`}
              >
                {customerNameValue || "—"}
              </p>
            </div>

            <div className="bg-[--bg-card] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Mail size={12} className="text-[--text-muted]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--text-muted]">
                  Email
                </span>
              </div>
              <p
                className={`text-sm font-medium break-all ${customerEmailValue ? "text-[--text-primary]" : "text-[--text-muted]"}`}
              >
                {customerEmailValue || "—"}
              </p>
            </div>

            <div className="bg-[--bg-card] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Phone size={12} className="text-[--text-muted]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--text-muted]">
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
            <div className="mt-4 rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <FileText size={12} className="text-[--text-muted]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--text-muted]">
                  Extra instructions
                </span>
              </div>
              <p className="text-sm text-[--text-primary] whitespace-pre-wrap">
                {serviceDetailsValue}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Card */}
      <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[--border] bg-[--bg-surface] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <CreditCard size={13} className="text-[--text-muted]" aria-hidden="true" />
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
              Payment
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-[--radius-inner] border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[--color-success-text]">
            <Sparkles size={9} />
            {paymentLabel}
          </span>
        </div>

        <div className="p-5">
          <div className="grid gap-px bg-[--border] border border-[--border] rounded-[--radius-inner] overflow-hidden sm:grid-cols-2">
            <div className="bg-[--bg-card] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <FileText size={12} className="text-[--text-muted]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--text-muted]">
                  Reference #
                </span>
              </div>
              <p
                className={`text-sm font-medium font-mono ${paymentReferenceValue ? "text-[--text-primary]" : "text-[--text-muted]"}`}
              >
                {paymentReferenceValue || "—"}
              </p>
            </div>

            <div className="bg-[--bg-card] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2
                  size={12}
                  className={
                    receiptFile
                      ? "text-[--color-success]"
                      : "text-[--text-muted]"
                  }
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--text-muted]">
                  Receipt
                </span>
              </div>
              <p
                className={`text-sm font-medium truncate ${receiptFile ? "text-[--color-success-text]" : "text-[--text-muted]"}`}
              >
                {receiptFile?.name ?? "No file uploaded"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] px-3 py-2.5">
            <Mail size={12} className="shrink-0 text-[--text-muted]" />
            <span className="text-xs text-[--text-secondary]">
              Support:{" "}
              <a
                href={`mailto:${storeSettings.supportEmail}`}
                className="font-medium text-[--text-primary] underline-offset-2 hover:underline"
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
