"use client";

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

import type { Product } from "@wongdigital/db";

import { ProductLogo } from "@/components/product-logo";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";
import { useGeoPricing } from "@/hooks/use-geo-pricing";

type RecentlyViewedRowProps = {
  /** All active products — we filter client-side by slug */
  products: Product[];
};

export function RecentlyViewedRow({ products }: RecentlyViewedRowProps) {
  const { slugs } = useRecentlyViewed();
  const sectionRef = useIntersectionReveal<HTMLElement>();
  const { formatPrimaryPrice, formatSecondaryPrice, showSecondary } = useGeoPricing();

  // Build ordered list from slugs, skipping any that no longer exist
  const recentProducts = slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => p != null);

  if (recentProducts.length === 0) return null;

  return (
    <section ref={sectionRef} className="reveal container-shell py-6 sm:py-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[--accent]" aria-hidden="true" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[--text-secondary]">
              Recently Viewed
            </h2>
          </div>
          <span className="text-xs text-[--text-muted]">
            {recentProducts.length} item{recentProducts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)] sm:[mask-image:none]"
          style={{ scrollbarWidth: "none" }}
        >
          {recentProducts.map((product) => (
            <Link
              className="group glass-panel flex min-w-[220px] max-w-[260px] shrink-0 snap-start items-center gap-3 rounded-xl p-3 transition-all duration-300 hover:border-[--accent-border] hover:shadow-[0_0_20px_var(--accent-glow)]"
              href={`/order?product=${product.slug}`}
              key={product.id}
            >
              <ProductLogo
                iconUrl={product.iconUrl}
                name={product.name}
                size="sm"
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[--text-primary] group-hover:text-[--accent] transition-colors duration-200">
                  {product.name}
                </p>
                <p className="text-xs font-semibold text-[--accent]">
                  {formatPrimaryPrice(product.price, product.slug)}
                </p>
                {showSecondary && (
                  <p className="text-[10px] text-[--text-muted]">
                    ≈ {formatSecondaryPrice(product.price, product.slug)}
                  </p>
                )}
              </div>
              <ArrowRight
                size={14}
                className="shrink-0 text-[--text-muted] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-[--accent]"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
