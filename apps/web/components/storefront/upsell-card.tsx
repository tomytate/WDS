"use client";

import type { Product } from "@wongdigital/db";
import {
  getProductSelectionMode,
  getServiceStartingPrice,
} from "@wongdigital/db/pricing";
import { Badge, buttonStyles } from "@wongdigital/ui";
import { Plus } from "lucide-react";

import { ProductLogo } from "@/components/product-logo";
import { useGeoPricing } from "@/hooks/use-geo-pricing";
import { getProductSummary } from "@/lib/product-copy";

type UpsellCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
};

export function UpsellCard({ product, onAdd }: UpsellCardProps) {
  const { formatPrimaryPrice, formatSecondaryPrice, showSecondary } = useGeoPricing();
  const selectionMode = getProductSelectionMode(product);
  const isService = selectionMode === "service";
  const displayPrice = isService ? getServiceStartingPrice(product) : product.price;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-[--accent-border] bg-gradient-to-r from-[--accent-tint-soft] to-[--bg-surface] p-4 transition-all hover:border-[--accent] hover:shadow-[0_0_16px_var(--accent-tint-soft)]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[--bg-card] shadow-sm">
        <ProductLogo
          iconUrl={product.iconUrl}
          name={product.name}
          size="md"
          className="!h-8 !w-8"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-display text-lg tracking-tight text-[--text-primary] line-clamp-1">
            {product.name}
          </p>
          <Badge
            tone="accent"
            className="text-[9px] uppercase tracking-wider py-0.5 px-1.5 hidden sm:inline-flex"
          >
            Suggested
          </Badge>
        </div>
        <p className="text-xs text-[--text-secondary] line-clamp-1 sm:line-clamp-2">
          {getProductSummary(product)}
        </p>
      </div>

      <div className="flex w-full sm:w-auto items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-1.5 border-t sm:border-0 border-[--border] pt-3 sm:pt-0 mt-1 sm:mt-0">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-[--text-muted] font-medium text-left sm:text-right">
            {isService ? "Starting at" : "1 Year"}
          </p>
          <p className="font-display font-semibold text-lg text-[--accent]">
            {formatPrimaryPrice(displayPrice, product.slug)}
          </p>
          {showSecondary && (
            <p className="text-[10px] text-[--text-muted] text-left sm:text-right">
              ≈ {formatSecondaryPrice(displayPrice)}
            </p>
          )}
        </div>
        <button
          className={buttonStyles({
            size: "sm",
            variant: "ghost",
            className:
              "h-8 bg-[--bg-card] hover:bg-[--accent] hover:text-[--accent-fg] border border-[--border] hover:border-[--accent]",
          })}
          onClick={() => onAdd(product)}
          type="button"
        >
          <Plus size={14} className="mr-1.5" />
          Add Item
        </button>
      </div>
    </div>
  );
}
