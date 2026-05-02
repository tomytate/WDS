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
      className="relative scroll-mt-28 overflow-hidden rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-4 sm:p-5"
      id={summaryId}
      ref={summaryRef}
    >
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[--border] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] text-[--text-primary]">
            <ShoppingCart size={15} aria-hidden="true" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
              Cart summary
            </p>
            <p className="mt-0.5 font-display text-lg font-semibold leading-tight tracking-tight text-[--text-primary]">
              {items.length === 0
                ? "Empty"
                : `${items.length} item${items.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent" size="sm" className="gap-1">
            <Sparkles size={9} aria-hidden="true" />
            Live
          </Badge>
          {items.length > 0 ? (
            <button
              className={buttonStyles({
                size: "sm",
                variant: "ghost",
                className: `gap-1.5 ${clearPending ? "!text-[--color-danger-text] !border-[--color-danger]" : ""}`,
              })}
              onClick={onClear}
              type="button"
            >
              <Trash2 size={13} aria-hidden="true" />
              {clearPending ? "Confirm?" : "Clear"}
            </button>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-[--radius-inner] border border-dashed border-[--border] bg-[--bg-surface] p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-card] text-[--text-muted]">
              <Package size={16} />
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
        <div className="relative mt-4 space-y-1.5">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16, scale: 0.96 }}
                transition={{ duration: 0.18, delay: index * 0.04 }}
                layout
                className="group/item flex items-center justify-between gap-4 rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] p-3 transition-colors duration-150 hover:border-[--text-primary]"
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
                <span className="shrink-0 flex flex-col items-end text-right text-sm text-[--text-primary]">
                  <span className="font-semibold tabular-nums leading-[1.1]">
                    {formatPrimaryPrice(item.unitPrice, item.product?.slug, item.accessPlan)}
                  </span>
                  {showSecondary && (
                    <span className="text-[10px] font-medium text-[--text-muted] leading-[1.1] mt-0.5">
                      ≈ {formatSecondaryPrice(item.unitPrice, item.product?.slug, item.accessPlan)}
                    </span>
                  )}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="relative mt-4 rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] p-4">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-[--text-secondary]">Subtotal</span>
          <span className="shrink-0 flex flex-col items-end text-right font-medium tabular-nums text-[--text-primary]">
            <span>{formattedSubtotal}</span>
            {showSecondary && (
              <span className="text-[10px] text-[--text-muted]">
                ≈ {formatSecondaryPrice(subtotalPrice)}
              </span>
            )}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-4 text-sm">
          <span className="text-[--text-secondary]">Tip</span>
          <span className="shrink-0 flex flex-col items-end text-right font-medium tabular-nums text-[--text-primary]">
            <span>{formattedTip}</span>
            {showSecondary && (
              <span className="text-[10px] text-[--text-muted]">
                ≈ {formatSecondaryPrice(tipAmount)}
              </span>
            )}
          </span>
        </div>
        {Number(discountAmount) > 0 && (
          <div className="mt-2 flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-[--color-success-text]">
              Discount{" "}
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] px-1.5 py-0.5 rounded-[--radius-inner]">
                {appliedPromoCode}
              </span>
            </span>
            <span className="shrink-0 text-right font-medium tabular-nums text-[--color-success-text]">
              − {formattedDiscount}
            </span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-4 border-t border-[--border] pt-3">
          <span className="font-semibold text-[--text-primary]">Grand total</span>
          <span className="shrink-0 flex flex-col items-end text-right">
            <span className="font-display text-2xl font-semibold tabular-nums tracking-tight text-[--text-primary]">
              {formattedTotal}
            </span>
            {showSecondary && (
              <span className="text-[10px] font-medium text-[--text-muted] mt-0.5">
                ≈ {formatSecondaryPrice(totalPrice)}
              </span>
            )}
          </span>
        </div>

        {onApplyPromo && items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dashed border-[--border]">
            {appliedPromoCode ? (
              <div className="flex items-center justify-between gap-3 rounded-[--radius-inner] border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-3 py-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-[--color-success]" aria-hidden="true" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[--color-success-text]">
                    {appliedPromoCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemovePromo?.()}
                  className="rounded-[--radius-inner] p-1.5 text-[--text-muted] hover:bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] hover:text-[--color-danger-text] transition-colors"
                  aria-label="Remove promo code"
                >
                  <Trash2 size={13} aria-hidden="true" />
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
                    placeholder="Promo code"
                    className="h-10 w-full min-w-0 flex-1 rounded-[--radius-inner] border border-[--border] bg-[--bg-card] px-3 text-sm font-medium uppercase text-[--text-primary] placeholder:normal-case placeholder:font-normal placeholder:text-[--text-muted] focus:border-[--text-primary] focus:outline-none transition-colors disabled:opacity-50"
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
                    className="flex h-10 shrink-0 items-center justify-center rounded-[--radius-inner] border border-[--text-primary] bg-[--text-primary] px-4 text-sm font-semibold text-[--bg-base] hover:bg-[--accent] hover:text-[--accent-fg] hover:border-[--accent] transition-colors disabled:opacity-50"
                  >
                    {isValidatingPromo ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
                {promoError && (
                  <p className="mt-2 text-[11px] font-medium text-[--color-danger-text] animate-slide-in-top">
                    {promoError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-start gap-2 rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] px-3 py-2.5">
          <Info
            size={13}
            className="mt-0.5 shrink-0 text-[--text-muted]"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-[--text-secondary]">
            {hasServiceItems
              ? "Service orders need the correct platform link or target in the Details step."
              : `Digital access durations vary by product. Default is 1 Year unless explicitly stated.`}
          </p>
        </div>
        {Number(discountAmount || "0") > 0 && (
          <div className="flex items-start gap-2 rounded-[--radius-inner] border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)] px-3 py-2.5">
            <Sparkles
              size={13}
              className="mt-0.5 shrink-0 text-[--color-success]"
              aria-hidden="true"
            />
            <p className="text-xs leading-relaxed text-[--color-success-text]">
              Your discount has been applied successfully. You can remove it
              anytime before submitting your order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
