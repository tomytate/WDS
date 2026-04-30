import { CheckCircle2 } from "lucide-react";
import type { Product } from "@wongdigital/db";

import { ProductLogo } from "@/components/product-logo";
import { getProductDetails, getProductSummary } from "@/lib/product-copy";

type ProductDetailBlockProps = {
  product: Pick<Product, "name" | "slug" | "description" | "iconUrl">;
  eyebrow?: string;
  note?: string;
};

export function ProductDetailBlock({
  product,
  eyebrow = "Plan Details",
  note,
}: ProductDetailBlockProps) {
  const details = getProductDetails(product.slug);

  if (details.length === 0) {
    return null;
  }

  return (
    <div className="group rounded-2xl border border-[--border] bg-[--bg-card] p-5 sm:p-6 transition-all duration-300 hover:border-[--accent-border] hover:shadow-[0_0_24px_var(--accent-tint-soft)]">
      <div className="flex items-start gap-4">
        <ProductLogo
          className="shrink-0"
          iconUrl={product.iconUrl}
          name={product.name}
          size="lg"
        />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[--text-muted] font-semibold">
            {eyebrow}
          </p>
          <h3 className="mt-2 font-display text-2xl sm:text-3xl leading-tight tracking-tight text-[--text-primary]">
            {product.name}
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-[--text-secondary]">
            {getProductSummary(product)}
          </p>
          {note ? (
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[--accent] font-semibold">
              {note}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[color-mix(in_srgb,var(--border)_70%,transparent)] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[--text-muted] font-semibold mb-3">
          What&apos;s Included
        </p>
        <ul className="space-y-2.5">
          {details.map((detail) => (
            <li
              className="flex items-start gap-3"
              key={`${product.slug}-${detail}`}
            >
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0 text-[--accent]"
                aria-hidden="true"
              />
              <span className="text-sm leading-relaxed text-[--text-secondary]">
                {detail}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
