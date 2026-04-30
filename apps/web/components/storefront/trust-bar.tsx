"use client";

import {
  Sparkles,
  Infinity as InfinityIcon,
  TrendingUp,
  Zap,
  Banknote,
  BadgeCheck,
} from "lucide-react";
import type { ElementType } from "react";

import { ScrollReveal } from "@/components/scroll-reveal";

const items: { icon: ElementType; label: string; highlight?: boolean }[] = [
  { icon: BadgeCheck, label: "Verified since 2024", highlight: true },
  { icon: InfinityIcon, label: "1-year or lifetime plans" },
  { icon: TrendingUp, label: "100+ premium services" },
  { icon: Zap, label: "Delivery in hours" },
  { icon: Banknote, label: "Secure global payments" },
  { icon: Sparkles, label: "Authentic accounts" },
];

export function TrustBar() {
  return (
    <ScrollReveal>
      <section className="container-shell py-6 sm:py-10">
        <div className="relative overflow-hidden rounded-2xl border border-transparent bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] backdrop-blur-sm py-4 sm:py-5 [mask-image:linear-gradient(to_right,transparent,black_32px,black_calc(100%-32px),transparent)] before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gradient-to-r before:from-[--accent-tint-soft] before:via-[--accent-border] before:to-[--accent-tint-soft] before:p-[1px] before:content-[''] before:[mask-composite:exclude] before:[mask-image:linear-gradient(#fff_0_0),linear-gradient(#fff_0_0)]">
          <div className="flex marquee-track gap-3 sm:gap-4">
            {[...items, ...items, ...items, ...items].map((item, index) => (
              <div
                className={`mx-1 flex min-w-fit shrink-0 items-center gap-2.5 rounded-full border px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-medium transition-all duration-300 ${
                  item.highlight
                    ? "border-[--accent-border] bg-[--accent-tint-soft] text-[--text-primary] shadow-[0_0_16px_var(--accent-tint-soft)]"
                    : "border-[--border] bg-[color-mix(in_srgb,var(--bg-card)_80%,transparent)] text-[--text-secondary] hover:border-[--accent-border] hover:bg-[--accent-tint-soft] hover:text-[--text-primary]"
                }`}
                key={`${item.label}-${index}`}
              >
                <item.icon
                  className={
                    item.highlight
                      ? "text-[--accent]"
                      : "text-[--accent] opacity-80"
                  }
                  size={16}
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
