"use client";

import { Package } from "lucide-react";
import Link from "next/link";

import type { Product } from "@wongdigital/db";
import { EmptyState, SectionHeading, buttonStyles } from "@wongdigital/ui";

import {
  normalizeFilter,
  productFilters,
  type ProductFilter,
} from "@/lib/catalog";

import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";
import { ProductCard } from "./product-card";

type ProductGridProps = {
  activeFilter: ProductFilter;
  products: Product[];
};

export function ProductGrid({ activeFilter, products }: ProductGridProps) {
  const sectionRef = useIntersectionReveal<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="reveal container-shell py-16 sm:py-20 lg:py-28 border-t border-[--border]"
      id="products"
    >
      <div className="space-y-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            counter={products.length}
            eyebrow="Catalog"
            title="Premium digital products."
            description="1-year or lifetime access for subscriptions, and platform-specific growth services with quantity-based pricing."
          />
        </div>

        {/* Editorial filter row — bordered tabs */}
        <div className="border-y border-[--border] -mx-4 sm:mx-0">
          <div
            className="flex items-stretch overflow-x-auto sm:flex-wrap"
            style={{ scrollbarWidth: "none" }}
          >
            {productFilters.map((filter) => {
              const selected = normalizeFilter(filter.value) === activeFilter;

              return (
                <Link
                  className={`shrink-0 px-4 sm:px-5 py-3 font-mono text-[11px] uppercase tracking-[0.1em] whitespace-nowrap transition-colors border-r border-[--border] last:border-r-0 ${
                    selected
                      ? "bg-[--text-primary] text-[--bg-base]"
                      : "bg-transparent text-[--text-secondary] hover:bg-[--bg-surface] hover:text-[--text-primary]"
                  }`}
                  href={
                    filter.value === "all"
                      ? "/#products"
                      : `/?category=${filter.value}#products`
                  }
                  key={filter.value}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>

        {products.length > 0 ? (
          <div className="bento-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package size={28} />}
            title="No products in this filter yet"
            description="Try another category or return to the full catalog to view every active listing."
            action={
              <Link
                className={buttonStyles({ variant: "ghost" })}
                href="/#products"
              >
                Show All Products
              </Link>
            }
          />
        )}
      </div>
    </section>
  );
}
