"use client";

import { Package, Sparkles } from "lucide-react";
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
      className="reveal container-shell py-14 sm:py-18 lg:py-24"
      id="products"
    >
      <div className="space-y-8 sm:space-y-10">
        {/* Section heading */}
        <SectionHeading
          counter={products.length}
          eyebrow="Catalog"
          title="Premium digital products"
          description="1-year or lifetime access for subscriptions, and platform-specific growth services with quantity-based pricing."
        />

        {/* Category pill selector */}
        <div
          className="flex items-center gap-2 overflow-x-auto p-2 glass-panel rounded-2xl snap-x snap-mandatory sm:flex-wrap sm:snap-none"
          style={{ scrollbarWidth: "none" }}
        >
          {productFilters.map((filter, index) => {
            const selected = normalizeFilter(filter.value) === activeFilter;
            const isFirst = index === 0;

            return (
              <Link
                className={`min-w-fit snap-start rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 whitespace-nowrap ${
                  selected
                    ? "border-[--accent] bg-[--accent] text-[--accent-fg]"
                    : "border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] text-[--text-secondary] hover:border-[--accent-border] hover:text-[--text-primary] backdrop-blur-sm"
                }`}
                href={
                  filter.value === "all"
                    ? "/#products"
                    : `/?category=${filter.value}#products`
                }
                key={filter.value}
              >
                {isFirst && selected ? (
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={12} aria-hidden="true" />
                    {filter.label}
                  </span>
                ) : (
                  filter.label
                )}
              </Link>
            );
          })}
        </div>

        {/* Product grid — bento layout */}
        {products.length > 0 ? (
          <div className="bento-grid">
            {products.map((product, _index) => (
              <ProductCard
                key={product.id}
                product={product}
              />
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
