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
    <section ref={sectionRef} className="reveal container-shell py-8 border-t border-[--border]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-[--text-muted]" aria-hidden="true" />
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[--text-muted]">
              Recently Viewed
            </h2>
          </div>
          <span className="font-mono text-[11px] text-[--text-muted]">
            {String(recentProducts.length).padStart(2, "0")} {recentProducts.length !== 1 ? "items" : "item"}
          </span>
        </div>

        <div
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)] sm:[mask-image:none]"
          style={{ scrollbarWidth: "none" }}
        >
          {recentProducts.map((product) => (
            <Link
              className="group flex min-w-[220px] max-w-[260px] shrink-0 snap-start items-center gap-3 rounded-[--radius-inner] border border-[--border] bg-[--bg-card] p-3 transition-colors duration-200 hover:border-[--text-primary]"
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
                <p className="truncate text-sm font-medium text-[--text-primary]">
                  {product.name}
                </p>
                <p className="font-mono text-xs font-semibold text-[--text-primary] tabular-nums">
                  {formatPrimaryPrice(product.price, product.slug)}
                </p>
                {showSecondary && (
                  <p className="font-mono text-[10px] text-[--text-muted]">
                    ≈ {formatSecondaryPrice(product.price, product.slug)}
                  </p>
                )}
              </div>
              <ArrowRight
                size={13}
                className="shrink-0 text-[--text-muted] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[--text-primary]"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
