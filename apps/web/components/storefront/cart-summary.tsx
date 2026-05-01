import { ShoppingCart, Sparkles, Info, Trash2, Package } from "lucide-react";
import { Badge, buttonStyles } from "@wongdigital/ui";
import { ProductLogo } from "@/components/product-logo";
import { formatOrderItemMeta } from "@/lib/format";
import { useGeoPricing } from "@/hooks/use-geo-pricing";
import type { Product, AccessPlan } from "@wongdigital/db";
import type { OrderItemSelectionMode } from "@wongdigital/db/types";
import { motion, AnimatePresence } from "motion/react";

export type SelectedCartItem = {
  product: Product;
  productId: string;
  selectionMode: OrderItemSelectionMode;
  accessPlan: AccessPlan;
  quantity: number;
  serviceOption: string | null;
  unitPrice: string;
};

export function CartSummary({
  clearPending,
  hasServiceItems,
  items,
  onClear,
  summaryId,
  summaryRef,
  subtotalPrice,
  tipAmount,
  totalPrice,
  discountAmount,
  appliedPromoCode,
  promoError,
  isValidatingPromo,
  onApplyPromo,
  onRemovePromo,
}: {
  clearPending: boolean;
  hasServiceItems: boolean;
  items: SelectedCartItem[];
  onClear: () => void;
  summaryId: string;
  summaryRef: React.RefObject<HTMLDivElement | null>;
  subtotalPrice: string;
  tipAmount: string;
  totalPrice: string;
  discountAmount?: string;
  appliedPromoCode?: string;
  promoError?: string | null;
  isValidatingPromo?: boolean;
  onApplyPromo?: (code: string) => void;
  onRemovePromo?: () => void;
}) {
  const { formatPrimaryPrice, formatSecondaryPrice, calculateDisplayTotals, showSecondary } = useGeoPricing();

  const { formattedSubtotal, formattedTip, formattedDiscount, formattedTotal } = calculateDisplayTotals(items, tipAmount, discountAmount || "0");

  return (
    <div
      className="relative scroll-mt-28 overflow-hidden rounded-xl sm:rounded-2xl border border-[--accent-border] bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_4%,var(--bg-card))] to-[var(--bg-card)] p-3.5 sm:p-5 shadow-[0_0_24px_var(--accent-tint-soft)]"
      id={summaryId}
      ref={summaryRef}
    >
      {/* Decorative element */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[--accent-tint-soft] blur-2xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-[--accent-tint-soft] text-[--accent]">
            <ShoppingCart size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[--text-muted] font-semibold">
              Cart Summary
            </p>
            <p className="mt-0.5 font-display text-lg leading-tight tracking-tight sm:text-2xl text-[--text-primary]">
              {items.length === 0
                ? "Empty"
                : `${items.length} item${items.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            tone="accent"
            className="gap-1.5 shadow-[0_0_8px_var(--accent-tint-medium)]"
          >
            <Sparkles size={10} aria-hidden="true" />
            Live Total
          </Badge>
          {items.length > 0 ? (
            <button
              className={buttonStyles({
                size: "sm",
                variant: "ghost",
                className: `gap-1.5 ${clearPending ? "!text-[--color-danger] !border-[--color-danger]" : ""}`,
              })}
              onClick={onClear}
              type="button"
            >
              <Trash2 size={14} aria-hidden="true" />
              {clearPending ? "Confirm?" : "Clear"}
            </button>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 sm:mt-5 rounded-lg sm:rounded-xl border border-dashed border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] p-4 sm:p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--bg-surface)_80%,transparent)] text-[--text-muted]">
              <Package size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-[--text-secondary]">
            Your cart is empty
          </p>
          <p className="mt-1 text-xs text-[--text-muted]">
            Choose one or more products to continue
          </p>
        </div>
      ) : (
        <div className="relative mt-4 sm:mt-5 space-y-1.5 sm:space-y-2">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                layout
                className="group/item flex items-center justify-between gap-4 rounded-xl border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-surface)_40%,transparent)] p-3 transition-all duration-200 hover:border-[--accent-border] hover:bg-[--accent-tint-faint]"
                key={`${item.productId}-${item.selectionMode}-${item.quantity}-${item.serviceOption ?? "na"}-${item.accessPlan}`}
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
                <span className="shrink-0 flex flex-col items-end rounded-lg bg-[--accent-tint-soft] px-2.5 py-1 text-right text-sm text-[--accent]">
                  <span className="font-semibold leading-[1.1]">{formatPrimaryPrice(item.unitPrice, item.product?.slug, item.accessPlan)}</span>
                  {showSecondary && (
                    <span className="text-[9px] font-medium opacity-70 leading-[1.1] mt-0.5">≈ {formatSecondaryPrice(item.unitPrice, item.product?.slug, item.accessPlan)}</span>
                  )}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="relative mt-4 sm:mt-5 rounded-lg sm:rounded-xl border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)] p-3 sm:p-4">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-[--text-secondary]">Subtotal</span>
          <span className="shrink-0 flex flex-col items-end text-right font-medium text-[--text-primary]">
            <span>{formattedSubtotal}</span>
            {showSecondary && (
              <span className="text-[10px] opacity-60">≈ {formatSecondaryPrice(subtotalPrice)}</span>
            )}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-4 text-sm">
          <span className="text-[--text-secondary]">Tip</span>
          <span className="shrink-0 flex flex-col items-end text-right font-medium text-[--text-primary]">
            <span>{formattedTip}</span>
            {showSecondary && (
              <span className="text-[10px] opacity-60">≈ {formatSecondaryPrice(tipAmount)}</span>
            )}
          </span>
        </div>
        {Number(discountAmount) > 0 && (
          <div className="mt-2 flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-[--color-success]">
              Discount{" "}
              <span className="text-xs uppercase tracking-wide opacity-80 border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] px-1.5 py-0.5 rounded-full">
                {appliedPromoCode}
              </span>
            </span>
            <span className="shrink-0 text-right font-medium text-[--color-success]">
              - {formattedDiscount}
            </span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-4 border-t border-[--border] pt-3">
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


        {/* Promo Code Input */}
        {onApplyPromo && items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dashed border-[--border]">
            {appliedPromoCode ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] p-2 backdrop-blur-sm">
                <div className="flex items-center gap-2 pl-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)] text-[--color-success]">
                    <Sparkles size={12} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold text-[--color-success] uppercase tracking-wider">
                    {appliedPromoCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemovePromo?.()}
                  className="rounded-lg p-1.5 text-[--text-muted] hover:bg-[color-mix(in_srgb,var(--color-danger)_15%,transparent)] hover:text-[--color-danger] transition-colors"
                  aria-label="Remove promo code"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <label htmlFor="cart-promo-input" className="sr-only">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="cart-promo-input"
                    name="promoCode"
                    type="text"
                    placeholder="Have a promo code?"
                    className="h-10 w-full min-w-0 flex-1 rounded-xl border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)] px-3 text-sm font-medium uppercase text-[--text-primary] placeholder:normal-case placeholder:font-normal placeholder:opacity-70 focus:border-[--accent] focus:outline-none focus:ring-1 focus:ring-[--accent] transition-shadow disabled:opacity-50"
                    disabled={isValidatingPromo}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onApplyPromo(e.currentTarget.value);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(
                        "cart-promo-input",
                      ) as HTMLInputElement;
                      if (input) onApplyPromo(input.value);
                    }}
                    disabled={isValidatingPromo}
                    className="flex h-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] px-4 text-sm font-semibold text-[--accent] border border-[--border] hover:bg-[--accent-tint-soft] hover:border-[--accent-tint-strong] transition-all disabled:opacity-50"
                  >
                    {isValidatingPromo ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[--accent] border-t-transparent" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
                {promoError && (
                  <p className="mt-2 text-[11px] font-medium text-[--color-danger] animate-slide-in-top">
                    {promoError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 sm:mt-4 flex flex-col gap-2">
        <div className="flex items-start gap-2 rounded-lg bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)] p-2.5 sm:p-3">
          <Info
            size={14}
            className="mt-0.5 shrink-0 text-[--color-info]"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-[--text-secondary]">
            {hasServiceItems
              ? "Service orders need the correct platform link or target in the Details step."
              : `Digital access durations vary by product. Default is 1 Year unless explicitly stated.`}
          </p>
        </div>
        {Number(discountAmount || "0") > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)] p-2.5 sm:p-3">
            <Sparkles
              size={14}
              className="mt-0.5 shrink-0 text-[--color-success]"
              aria-hidden="true"
            />
            <p className="text-xs leading-relaxed text-[--text-secondary]">
              Your discount has been applied successfully. You can remove it
              anytime before submitting your order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
