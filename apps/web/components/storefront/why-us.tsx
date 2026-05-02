"use client";

import {
  Zap,
  ShieldCheck,
  Globe2,
  Package,
  CreditCard,
  Rocket,
} from "lucide-react";
import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";
import { SectionHeading } from "@wongdigital/ui";

const features = [
  {
    icon: Zap,
    title: "Fast delivery",
    description: "Most orders are processed within 2–6 hours — not days.",
    metric: "2–6h",
  },
  {
    icon: ShieldCheck,
    title: "Verified accounts",
    description:
      "Every account is authenticated and activation-guaranteed. No bots, no resellers of resellers.",
    metric: "100%",
  },
  {
    icon: Globe2,
    title: "Global, local pricing",
    description: "₱ PHP for Philippine buyers, USDT worldwide.",
    metric: "PHP/USD",
  },
  {
    icon: Package,
    title: "Flexible plans",
    description:
      "Choose 1-year or lifetime access for every subscription. Upgrade anytime.",
    metric: "1Y / ∞",
  },
  {
    icon: CreditCard,
    title: "Pay your way",
    description:
      "QRPH for local buyers (GCash, Maya, all PH banks). Binance / crypto worldwide.",
    metric: "QR · USDT",
  },
  {
    icon: Rocket,
    title: "100+ products",
    description:
      "AI tools, streaming, design suites, and social growth — one checkout.",
    metric: "100+",
  },
];

export function WhyUs() {
  const sectionRef = useIntersectionReveal<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="reveal container-shell py-16 sm:py-20 lg:py-28 border-t border-[--border]"
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionHeading
            eyebrow="Why Wong Digital"
            title="Built for serious buyers."
            description="Every detail engineered for speed, trust, and quality."
          />
        </div>

        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[--border] border border-[--border] rounded-[--radius-card] overflow-hidden reveal-stagger">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-[--bg-card] p-6 sm:p-7 transition-colors duration-200 hover:bg-[--bg-base]"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] text-[--text-primary] transition-colors group-hover:border-[--text-primary] group-hover:bg-[--accent] group-hover:text-[--accent-fg]">
                      <Icon size={18} strokeWidth={1.75} />
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[--text-muted]">
                      {feature.metric}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold tracking-tight text-[--text-primary] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[--text-secondary]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
