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
    <div className="group rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden transition-colors duration-200 hover:border-[--text-primary]">
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-surface]">
          <ProductLogo
            iconUrl={product.iconUrl}
            name={product.name}
            size="md"
          />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
            {eyebrow}
          </p>
          <h3 className="mt-2 font-display text-2xl sm:text-3xl font-semibold leading-tight tracking-tight text-[--text-primary]">
            {product.name}
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-[--text-secondary]">
            {getProductSummary(product)}
          </p>
          {note ? (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[--accent-strong] font-semibold">
              {note}
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-[--border] bg-[--bg-surface] p-5 sm:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted] mb-3">
          What&apos;s included
        </p>
        <ul className="space-y-2.5">
          {details.map((detail) => (
            <li
              className="flex items-start gap-3"
              key={`${product.slug}-${detail}`}
            >
              <CheckCircle2
                size={14}
                className="mt-0.5 shrink-0 text-[--accent-strong]"
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
