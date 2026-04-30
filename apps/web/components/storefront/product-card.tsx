"use client";

import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

import type { Product } from "@wongdigital/db";
import { Badge, buttonStyles, Card } from "@wongdigital/ui";

import {
  getServiceProductConfig,
  getServiceStartingPrice,
} from "@wongdigital/db/pricing";

import { ProductLogo } from "@/components/product-logo";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { categoryLabel } from "@/lib/catalog";
import { getProductSummary, getProductDuration } from "@/lib/product-copy";
import { useTilt } from "@/hooks/use-tilt";
import { useGeoPricing } from "@/hooks/use-geo-pricing";

type ProductCardProps = {
  product: Product;
  isHero?: boolean;
};

function getBadges(product: Product) {
  const badges: Array<{
    label: string;
    emoji: string;
    tone: "accent" | "info" | "success";
  }> = [];
  if (product.slug === "google-ai-pro") {
    badges.push({ label: "Best Seller", emoji: "⭐", tone: "accent" });
  }
  return badges.slice(0, 2);
}

export function ProductCard({ product, isHero }: ProductCardProps) {
  const serviceConfig = getServiceProductConfig(product);
  const startsAtPrice = serviceConfig
    ? getServiceStartingPrice(product)
    : product.price;
  const badges = getBadges(product);
  const { ref, handlers } = useTilt<HTMLDivElement>();
  const { formatPrimaryPrice, formatSecondaryPrice, showSecondary } = useGeoPricing();
  const planDuration = getProductDuration(product.slug);

  return (
    <Card
      ref={ref}
      variant="interactive"
      {...handlers}
      className={`group relative flex h-full flex-col glow-ring ${
        isHero ? "bento-hero" : ""
      }`}
      style={
        {
          transition:
            "transform 0.4s cubic-bezier(0.25, 0.4, 0.25, 1), box-shadow 0.3s ease, border-color 0.3s ease",
          viewTransitionName: `product-card-${product.slug}`,
        } as React.CSSProperties
      }
    >
      {/* Accent top-line — subtle, reveals on hover */}
      <div className="absolute inset-x-0 top-0 z-20 h-px bg-[color-mix(in_srgb,var(--accent)_50%,transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Badges */}
      {badges.length > 0 && (
        <div className="absolute left-4 top-4 z-10 flex gap-1.5">
          {badges.map((badge) => (
            <span
              key={badge.label}
              className="inline-flex items-center gap-1 rounded-full border border-[--accent-tint-strong] bg-[--accent-tint-soft] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[--accent]"
            >
              {badge.emoji} {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Wishlist */}
      <div className="absolute right-3 top-3 z-10">
        <WishlistButton productId={product.id} className="shadow-sm" />
      </div>

      <div
        className={`relative z-[1] flex h-full flex-col gap-5 ${isHero ? "p-6 sm:p-8" : "p-5 sm:p-6"}`}
      >
        {/* Header: Logo + Badge */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="flex items-center justify-center rounded-2xl border border-[--accent-tint-medium] bg-[--accent-tint-soft] p-2.5 transition-transform duration-500 group-hover:-translate-y-1">
              <ProductLogo
                iconUrl={product.iconUrl}
                name={product.name}
                size="md"
              />
            </div>
            {/* Availability dot — `role="img"` lets aria-label be read as the
                accessible name of a graphic (WCAG 2.2 / aria-prohibited-attr). */}
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center"
              role="img"
              aria-label="Available"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[--color-success] opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[--color-success] border border-[--bg-card]" />
            </span>
          </div>
          <Badge
            className="mt-1 shrink-0 whitespace-nowrap gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold leading-none tracking-[0.12em] uppercase"
            tone="accent"
          >
            {serviceConfig ? (
              <>
                <Zap size={10} aria-hidden="true" />
                Service
              </>
            ) : (
              planDuration.badge
            )}
          </Badge>
        </div>

        {/* Content */}
        <div className="space-y-2.5">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[--text-muted]">
            {categoryLabel(product.category)}
          </p>
          <h3
            className={`font-display leading-tight tracking-tight text-[--text-primary] group-hover:text-[--accent] transition-colors duration-300 ${
              isHero ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
            }`}
          >
            {product.name}
          </h3>
          <p
            className={`text-sm leading-[1.65] text-[--text-secondary] ${isHero ? "line-clamp-4" : "line-clamp-2"}`}
          >
            {getProductSummary(product)}
          </p>
        </div>

        {/* Pricing */}
        <div className="mt-auto space-y-4">
          <div className="rounded-xl bg-[color-mix(in_srgb,var(--bg-surface)_70%,transparent)] p-3.5 border border-[color-mix(in_srgb,var(--border)_40%,transparent)]">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[--text-muted]">
                  Starts at
                </p>
                <p
                  className={`font-display font-bold tracking-tight text-[--accent] mt-0.5 ${isHero ? "text-3xl" : "text-2xl"}`}
                >
                  {formatPrimaryPrice(startsAtPrice, product.slug)}
                </p>
                {/* Secondary reference price */}
                {showSecondary && (
                  <p className="mt-0.5 text-[11px] font-medium text-[--text-muted]">
                    ≈ {formatSecondaryPrice(startsAtPrice)}
                  </p>
                )}
              </div>
              <p className="text-[10px] uppercase tracking-[0.16em] font-medium text-[--text-muted]">
                {serviceConfig ? "Per Order" : "Base Price"}
              </p>
            </div>
            <p className="mt-2.5 text-xs leading-[1.55] text-[--text-secondary] border-t border-[color-mix(in_srgb,var(--border)_40%,transparent)] pt-2.5">
              {serviceConfig
                ? <>{formatPrimaryPrice(serviceConfig.pricePerThousand, product.slug)} per 1K {showSecondary ? `(≈ ${formatSecondaryPrice(serviceConfig.pricePerThousand, product.slug)})` : ""} · quantities: {serviceConfig.quantities
                    .map((quantity) =>
                      new Intl.NumberFormat("en-US").format(quantity),
                    )
                    .join(", ")}</>
                : planDuration.description}
            </p>
          </div>

          <Link
            className={buttonStyles({
              className: `group/btn w-full justify-center gap-2 font-medium rounded-xl ${
                isHero ? "h-12 sm:h-13 text-base" : "h-11"
              }`,
            })}
            href={`/order?product=${product.slug}`}
          >
            Order now
            <ArrowRight
              aria-hidden="true"
              size={15}
              className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </Card>
  );
}
