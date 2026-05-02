import { useFormContext } from "react-hook-form";
import {
  User,
  Mail,
  Phone,
  Link2,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Input, Textarea } from "@wongdigital/ui";

import { FieldError } from "@/components/storefront/field-error";
import { ProductLogo } from "@/components/product-logo";
import type { Product } from "@wongdigital/db";

import type { SelectedCartItem } from "@/components/storefront/cart-summary";
import type { OrderFormValues, OrderSelectionValue } from "@/lib/schemas";
import { formatOrderItemMeta } from "@/lib/format";
import { useGeoPricing } from "@/hooks/use-geo-pricing";
import { getServiceTargetConfig } from "@wongdigital/db/pricing";

const tipPresets = [
  { value: "0", emoji: null },
  { value: "20", emoji: "☕" },
  { value: "50", emoji: "🧋" },
  { value: "100", emoji: "🍕" },
  { value: "200", emoji: "🎁" },
] as const;

export type CustomerDetailsStepProps = {
  hasServiceItems: boolean;
  selectedServiceItems: Array<{
    index: number;
    item: OrderSelectionValue;
    product: Product;
  }>;
  tipAmountValue: string;
  setTipAmount: (value: string) => void;
  buildSelectedCartItem: (product: Product, item: OrderSelectionValue) => SelectedCartItem;
};

export function CustomerDetailsStep({
  hasServiceItems,
  selectedServiceItems,
  tipAmountValue,
  setTipAmount,
  buildSelectedCartItem,
}: CustomerDetailsStepProps) {
  const form = useFormContext<OrderFormValues>();
  const { formatPrimaryPrice, formatSecondaryPrice, showSecondary, isPhp } = useGeoPricing();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Contact Information Card */}
      <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-5 sm:p-6">
        <div className="section-rule mb-5">
          <span>Contact information</span>
        </div>

        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:space-y-2.5">
            <label
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[--text-primary]"
              htmlFor="customerName"
            >
              <User
                size={12}
                className="sm:h-3.5 sm:w-3.5 text-[--text-muted]"
                aria-hidden="true"
              />
              Full Name
            </label>
            <Input
              id="customerName"
              placeholder="Juan Dela Cruz"
              className="h-11 sm:h-12 text-sm sm:text-base"
              {...form.register("customerName")}
            />
            <FieldError error={form.formState.errors.customerName?.message} />
          </div>

          <div className="space-y-2 sm:space-y-2.5">
            <label
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[--text-primary]"
              htmlFor="customerEmail"
            >
              <Mail
                size={12}
                className="sm:h-3.5 sm:w-3.5 text-[--text-muted]"
                aria-hidden="true"
              />
              Email Address
            </label>
            <Input
              id="customerEmail"
              placeholder="you@example.com"
              type="email"
              className="h-11 sm:h-12 text-sm sm:text-base"
              {...form.register("customerEmail")}
            />
            <FieldError error={form.formState.errors.customerEmail?.message} />
          </div>
        </div>

        <div className="mt-4 sm:mt-5 grid gap-4 sm:gap-5 sm:grid-cols-[1fr_1.1fr]">
          <div className="space-y-2 sm:space-y-2.5">
            <label
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[--text-primary]"
              htmlFor="customerPhone"
            >
              <Phone
                size={12}
                className="sm:h-3.5 sm:w-3.5 text-[--text-muted]"
                aria-hidden="true"
              />
              Mobile Number
            </label>
            <Input
              id="customerPhone"
              placeholder="09XXXXXXXXX"
              className="h-11 sm:h-12 text-sm sm:text-base"
              {...form.register("customerPhone")}
            />
            <FieldError error={form.formState.errors.customerPhone?.message} />
          </div>
        </div>
      </div>

      {hasServiceItems ? (
        <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-5 sm:p-6 space-y-5">
          <div>
            <div className="section-rule mb-2">
              <span>Service targets</span>
            </div>
            <p className="text-xs text-[--text-secondary]">
              Add target links for each service
            </p>
          </div>

          {selectedServiceItems.map((serviceItem) => {
            const targetConfig = getServiceTargetConfig(serviceItem.product);

            return (
              <div
                className="rounded-xl border border-[color-mix(in_srgb,var(--border)_70%,transparent)] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] p-3 sm:p-4 transition-all duration-300 active:scale-[0.99]"
                key={`${serviceItem.product.id}-${serviceItem.index}-target`}
              >
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <ProductLogo
                    iconUrl={serviceItem.product.iconUrl}
                    name={serviceItem.product.name}
                    size="sm"
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-[--text-primary]">
                      {serviceItem.product.name}
                    </p>
                    <p className="mt-0.5 text-[10px] sm:text-xs text-[--text-muted]">
                      {formatOrderItemMeta(
                        buildSelectedCartItem(
                          serviceItem.product,
                          serviceItem.item,
                        ),
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-2.5">
                  <label
                    className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[--text-primary]"
                    htmlFor={`items.${serviceItem.index}.targetUrl`}
                  >
                    <Link2
                      size={12}
                      className="sm:h-3.5 sm:w-3.5 text-[--text-muted]"
                      aria-hidden="true"
                    />
                    {targetConfig.label}
                  </label>
                  <Input
                    id={`items.${serviceItem.index}.targetUrl`}
                    placeholder={targetConfig.placeholder}
                    className="h-11 sm:h-12 text-sm sm:text-base"
                    {...form.register(`items.${serviceItem.index}.targetUrl`)}
                  />
                  <p className="text-[10px] sm:text-xs leading-relaxed text-[--text-muted]">
                    {targetConfig.help}
                  </p>
                  <FieldError
                    error={
                      form.formState.errors.items?.[serviceItem.index]
                        ?.targetUrl?.message
                    }
                  />
                </div>
              </div>
            );
          })}

          <div className="space-y-2 sm:space-y-2.5 pt-2">
            <label
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[--text-primary]"
              htmlFor="serviceDetails"
            >
              <MessageSquare
                size={12}
                className="sm:h-3.5 sm:w-3.5 text-[--text-muted]"
                aria-hidden="true"
              />
              Extra Instructions
            </label>
            <Textarea
              id="serviceDetails"
              placeholder="Optional notes for the order..."
              rows={3}
              className="text-sm sm:text-base"
              {...form.register("serviceDetails")}
            />
            <FieldError error={form.formState.errors.serviceDetails?.message} />
          </div>
        </div>
      ) : null}

      {/* Tip Section */}
      <div className="relative overflow-hidden rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-5 sm:p-6">
        <div className="relative flex items-center gap-3 mb-5">
          <div className="flex-1 min-w-0">
            <div className="section-rule">
              <span>Add a tip</span>
            </div>
            <p className="mt-1 text-xs text-[--text-secondary]">
              Optional — show appreciation
            </p>
          </div>
          {Number(tipAmountValue) > 0 && (
            <span className="flex items-center gap-1 rounded-[--radius-inner] border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[--color-success-text]">
              <Sparkles size={9} />+{" "}
              {isPhp ? `₱${tipAmountValue}` : formatPrimaryPrice(Number(tipAmountValue))}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {tipPresets.map((tipOption) => {
            const selected = tipAmountValue === tipOption.value;
            const isCustom =
              !tipPresets.some((p) => p.value === tipAmountValue) &&
              tipAmountValue !== "0";

            return (
              <button
                aria-pressed={selected && !isCustom}
                className={`relative rounded-[--radius-inner] border px-2 py-2.5 sm:px-3 sm:py-3 text-sm font-medium transition-colors duration-150 ${
                  selected && !isCustom
                    ? "border-[--text-primary] bg-[--text-primary] text-[--bg-base]"
                    : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--text-primary] hover:text-[--text-primary]"
                }`}
                key={tipOption.value}
                onClick={() => setTipAmount(tipOption.value)}
                type="button"
              >
                {tipOption.emoji && (
                  <span
                    className="block text-sm mb-0.5"
                    aria-hidden="true"
                  >
                    {tipOption.emoji}
                  </span>
                )}
                <span className="block text-xs sm:text-sm tabular-nums">
                  {tipOption.value === "0"
                    ? "No tip"
                    : isPhp ? `₱${tipOption.value}` : formatPrimaryPrice(Number(tipOption.value))}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
          <div className="relative">
            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-[--text-muted] font-medium">
              {isPhp ? "₱" : "USDT"}
            </span>
            <Input
              id="tipAmount"
              inputMode="numeric"
              className="h-11 sm:h-12 pl-7 sm:pl-8 text-sm sm:text-base"
              onChange={(event) => {
                const nextValue = event.target.value;

                if (/^\d*$/.test(nextValue)) {
                  setTipAmount(nextValue);
                }
              }}
              placeholder="Custom amount"
              value={tipAmountValue === "0" ? "" : tipAmountValue}
            />
          </div>
          <p className="text-[10px] sm:text-xs leading-relaxed text-[--text-muted]">
            Tips help support the service. Thank you!
          </p>
          <FieldError error={form.formState.errors.tipAmount?.message} />
        </div>
      </div>
    </div>
  );
}
