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

const items: { icon: ElementType; label: string }[] = [
  { icon: BadgeCheck, label: "Verified since 2024" },
  { icon: InfinityIcon, label: "1-year or lifetime plans" },
  { icon: TrendingUp, label: "100+ premium services" },
  { icon: Zap, label: "Delivery in hours" },
  { icon: Banknote, label: "Secure global payments" },
  { icon: Sparkles, label: "Authentic accounts" },
];

export function TrustBar() {
  return (
    <ScrollReveal>
      <section className="container-shell py-8">
        <div className="relative overflow-hidden border-y border-[--border] py-4 [mask-image:linear-gradient(to_right,transparent,black_64px,black_calc(100%-64px),transparent)]">
          <div className="flex marquee-track items-center">
            {[...items, ...items, ...items, ...items].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={`${item.label}-${index}`}
                  className="flex shrink-0 items-center gap-8 pr-8"
                >
                  <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[--text-secondary]">
                    <Icon
                      className="text-[--accent-strong]"
                      size={14}
                      aria-hidden="true"
                      strokeWidth={1.75}
                    />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className="h-1 w-1 rounded-sm bg-[--border]"
                    aria-hidden="true"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

