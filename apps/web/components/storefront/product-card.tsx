"use client";

import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

import type { Product } from "@wongdigital/db";
import { Badge, Card } from "@wongdigital/ui";

import {
  getProductDurationConfigs,
  getServiceProductConfig,
  getServiceStartingPrice,
} from "@wongdigital/db/pricing";

import { ProductLogo } from "@/components/product-logo";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { categoryLabel } from "@/lib/catalog";
import { getProductSummary, getProductDuration } from "@/lib/product-copy";
import { useGeoPricing } from "@/hooks/use-geo-pricing";

type ProductCardProps = {
  product: Product;
  isHero?: boolean;
};

function getBadges(product: Product) {
  const badges: Array<{
    label: string;
    tone: "accent" | "info" | "success";
  }> = [];
  if (product.slug === "google-ai-pro") {
    badges.push({ label: "Best Seller", tone: "accent" });
  }
  return badges.slice(0, 2);
}

export function ProductCard({ product, isHero }: ProductCardProps) {
  const serviceConfig = getServiceProductConfig(product);
  const startsAtPrice = serviceConfig
    ? getServiceStartingPrice(product)
    : product.price;
  const badges = getBadges(product);
  const { formatPrimaryPrice, formatSecondaryPrice, showSecondary } = useGeoPricing();
  const planDuration = getProductDuration(product.slug);
  const durationConfigs = getProductDurationConfigs(product.slug);
  const startsAtPlan = durationConfigs[0]?.plan;

  return (
    <Card
      variant="interactive"
      className={`group relative flex h-full flex-col glow-ring overflow-hidden ${
        isHero ? "bento-hero" : ""
      }`}
      style={
        {
          viewTransitionName: `product-card-${product.slug}`,
        } as React.CSSProperties
      }
    >
      {/* Top meta strip */}
      <div className="flex items-center justify-between border-b border-[--border] px-5 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
          {categoryLabel(product.category)}
        </span>
        <div className="flex items-center gap-2">
          {badges.map((badge) => (
            <span
              key={badge.label}
              className="inline-flex items-center gap-1 rounded-[--radius-inner] bg-[--accent] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[--accent-fg]"
            >
              ★ {badge.label}
            </span>
          ))}
          <WishlistButton productId={product.id} />
        </div>
      </div>

      <div
        className={`relative flex h-full flex-col gap-5 ${
          isHero ? "p-6 sm:p-8" : "p-5 sm:p-6"
        }`}
      >
        {/* Header: Logo + Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="relative">
            <div className="flex items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-base] p-3 transition-colors duration-300 group-hover:border-[--text-primary]">
              <ProductLogo
                iconUrl={product.iconUrl}
                name={product.name}
                size="md"
              />
            </div>
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
            className="mt-1 shrink-0 whitespace-nowrap"
            tone={serviceConfig ? "accent" : "muted"}
            size="sm"
          >
            {serviceConfig ? (
              <>
                <Zap size={9} aria-hidden="true" />
                Service
              </>
            ) : (
              planDuration.badge
            )}
          </Badge>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3
            className={`font-display leading-[1.15] tracking-tight text-[--text-primary] ${
              isHero ? "text-2xl sm:text-3xl" : "text-xl"
            } font-semibold`}
          >
            {product.name}
          </h3>
          <p
            className={`text-sm leading-relaxed text-[--text-secondary] ${
              isHero ? "line-clamp-4" : "line-clamp-2"
            }`}
          >
            {getProductSummary(product)}
          </p>
        </div>

        {/* Pricing — flat, editorial */}
        <div className="mt-auto space-y-4">
          <div className="border-t border-[--border] pt-4">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                Starts at
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--text-muted]">
                {serviceConfig ? "per order" : "base"}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-display font-semibold tracking-tight text-[--text-primary] ${
                  isHero ? "text-4xl" : "text-3xl"
                }`}
              >
                {formatPrimaryPrice(startsAtPrice, product.slug, startsAtPlan)}
              </span>
              {showSecondary && (
                <span className="text-xs font-medium text-[--text-muted]">
                  ≈ {formatSecondaryPrice(startsAtPrice, product.slug, startsAtPlan)}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[--text-secondary]">
              {serviceConfig ? (
                <>
                  {formatPrimaryPrice(serviceConfig.pricePerThousand, product.slug)} per 1K · quantities:{" "}
                  {serviceConfig.quantities
                    .map((q) => new Intl.NumberFormat("en-US").format(q))
                    .join(", ")}
                </>
              ) : (
                planDuration.description
              )}
            </p>
          </div>

          <Link
            className={`group/btn inline-flex w-full h-11 items-center justify-between gap-2 rounded-[--radius-inner] border border-[--text-primary] bg-[--text-primary] px-4 text-sm font-semibold text-[--bg-base] transition-colors hover:bg-[--accent] hover:text-[--accent-fg] hover:border-[--accent]`}
            href={`/order?product=${product.slug}`}
          >
            Order now
            <ArrowRight
              aria-hidden="true"
              size={14}
              className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </Card>
  );
}
