"use client";

import { Search, ArrowRight, FileText, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Product } from "@wongdigital/db";

import { ProductLogo } from "@/components/product-logo";
import { useGeoPricing } from "@/hooks/use-geo-pricing";
import {
  useCommandPalette,
  fuzzyMatch,
  type CommandItem,
} from "@/hooks/use-command-palette";

const staticPages: CommandItem[] = [
  { id: "page-home", label: "Home", href: "/", group: "page" },
  { id: "page-order", label: "Order Now", href: "/order", group: "page" },
  { id: "page-track", label: "Track Order", href: "/track", group: "page" },
  { id: "page-review", label: "Write Review", href: "/review", group: "page" },
  {
    id: "page-products",
    label: "All Products",
    href: "/#products",
    group: "page",
  },
];

type CommandPaletteProps = {
  products: Product[];
};

export function CommandPalette({ products }: CommandPaletteProps) {
  const { open, close } = useCommandPalette();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { formatPrimaryPrice } = useGeoPricing();

  // Build search index from products
  const productItems: CommandItem[] = useMemo(
    () =>
      products.map((p) => ({
        id: `product-${p.id}`,
        label: p.name,
        href: `/order?product=${p.slug}`,
        group: "product" as const,
        iconUrl: p.iconUrl ?? undefined,
        price: formatPrimaryPrice(p.price, p.slug),
      })),
    [products],
  );

  const allItems = useMemo(
    () => [...productItems, ...staticPages],
    [productItems],
  );

  const filteredItems = useMemo(
    () =>
      query
        ? allItems.filter((item) => fuzzyMatch(query, item.label))
        : allItems,
    [query, allItems],
  );

  const groupedResults = useMemo(() => {
    const productResults = filteredItems.filter((i) => i.group === "product");
    const pageResults = filteredItems.filter((i) => i.group === "page");
    return { products: productResults, pages: pageResults };
  }, [filteredItems]);

  const flatResults = useMemo(
    () => [...groupedResults.products, ...groupedResults.pages],
    [groupedResults],
  );

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // Auto-focus input
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Easter Egg
  useEffect(() => {
    if (query.toUpperCase() === "SECRET50") {
      close();
      router.push("/order?promo=SECRET50");
      setTimeout(() => {
        // Dynamic import to keep sonner out of the initial bundle for this
        // code-path that 99.9% of users will never hit.
        void import("sonner").then(({ toast }) => {
          toast.success("🎊 Easter Egg unlocked!", {
            description:
              "You found the secret code. A 50% discount has been applied to your session.",
            duration: 10000,
          });
        });
      }, 300);
    }
  }, [query, close, router]);

  // Navigate to selected item
  const navigateTo = useCallback(
    (item: CommandItem) => {
      close();
      router.push(item.href);
    },
    [close, router],
  );

  // Keyboard navigation
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = flatResults[activeIndex];
        if (item) navigateTo(item);
      }
    },
    [flatResults, activeIndex, navigateTo],
  );

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] sm:pt-[16vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg-base)_70%,transparent)] backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-xl mx-4 overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_85%,transparent)] shadow-elevated backdrop-blur-2xl animate-scale-in"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-[color-mix(in_srgb,var(--border)_40%,transparent)] px-4 py-3">
          <Search size={18} className="shrink-0 text-[--text-muted]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search products, pages..."
            className="flex-1 bg-transparent text-sm text-[--text-primary] placeholder:text-[--text-muted] outline-none"
            type="search"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline rounded border border-[--border] bg-[--bg-surface] px-1.5 py-0.5 text-[10px] font-mono text-[--text-muted]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[50vh] overflow-y-auto py-2"
          role="listbox"
        >
          {flatResults.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[--text-muted]">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {/* Products group */}
              {groupedResults.products.length > 0 && (
                <div className="px-3 pt-2 pb-1">
                  <p className="px-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-[--text-muted]">
                    Products
                  </p>
                </div>
              )}
              {groupedResults.products.map((item) => {
                runningIndex++;
                const idx = runningIndex;
                return (
                  <button
                    key={item.id}
                    data-index={idx}
                    onClick={() => navigateTo(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    role="option"
                    aria-selected={activeIndex === idx}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      activeIndex === idx
                        ? "bg-[--accent-tint-soft] text-[--accent]"
                        : "text-[--text-primary] hover:bg-[--accent-tint-soft]"
                    }`}
                    type="button"
                  >
                    {item.iconUrl ? (
                      <ProductLogo
                        iconUrl={item.iconUrl}
                        name={item.label}
                        size="sm"
                      />
                    ) : (
                      <Package
                        size={16}
                        className="shrink-0 text-[--text-muted]"
                      />
                    )}
                    <span className="flex-1 font-medium truncate">
                      {item.label}
                    </span>
                    {item.price && (
                      <span className="text-xs font-mono text-[--text-muted]">
                        {item.price}
                      </span>
                    )}
                    <ArrowRight
                      size={14}
                      className="shrink-0 text-[--text-muted]"
                    />
                  </button>
                );
              })}

              {/* Pages group */}
              {groupedResults.pages.length > 0 && (
                <div className="px-3 pt-3 pb-1">
                  <p className="px-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-[--text-muted]">
                    Pages
                  </p>
                </div>
              )}
              {groupedResults.pages.map((item) => {
                runningIndex++;
                const idx = runningIndex;
                return (
                  <button
                    key={item.id}
                    data-index={idx}
                    onClick={() => navigateTo(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    role="option"
                    aria-selected={activeIndex === idx}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      activeIndex === idx
                        ? "bg-[--accent-tint-soft] text-[--accent]"
                        : "text-[--text-primary] hover:bg-[--accent-tint-soft]"
                    }`}
                    type="button"
                  >
                    <FileText
                      size={16}
                      className="shrink-0 text-[--text-muted]"
                    />
                    <span className="flex-1 font-medium truncate">
                      {item.label}
                    </span>
                    <ArrowRight
                      size={14}
                      className="shrink-0 text-[--text-muted]"
                    />
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[color-mix(in_srgb,var(--border)_40%,transparent)] px-4 py-2 text-[10px] text-[--text-muted]">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}
