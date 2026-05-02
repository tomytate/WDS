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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-4 transition-colors hover:border-[--text-primary]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-surface]">
        <ProductLogo
          iconUrl={product.iconUrl}
          name={product.name}
          size="md"
          className="!h-7 !w-7"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-display text-base font-semibold tracking-tight text-[--text-primary] line-clamp-1">
            {product.name}
          </p>
          <Badge tone="accent" size="sm" className="hidden sm:inline-flex">
            Suggested
          </Badge>
        </div>
        <p className="text-xs leading-relaxed text-[--text-secondary] line-clamp-1 sm:line-clamp-2">
          {getProductSummary(product)}
        </p>
      </div>

      <div className="flex w-full sm:w-auto items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-1.5 border-t sm:border-0 border-[--border] pt-3 sm:pt-0 mt-1 sm:mt-0">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--text-muted] text-left sm:text-right">
            {isService ? "Starting at" : "1 Year"}
          </p>
          <p className="font-display font-semibold text-lg tracking-tight tabular-nums text-[--text-primary]">
            {formatPrimaryPrice(displayPrice, product.slug)}
          </p>
          {showSecondary && (
            <p className="font-mono text-[10px] text-[--text-muted] text-left sm:text-right">
              ≈ {formatSecondaryPrice(displayPrice)}
            </p>
          )}
        </div>
        <button
          className={buttonStyles({
            size: "sm",
            className: "h-9 gap-1.5",
          })}
          onClick={() => onAdd(product)}
          type="button"
        >
          <Plus size={13} />
          Add
        </button>
      </div>
    </div>
  );
}
