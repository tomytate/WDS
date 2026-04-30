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
import { SectionHeading, Card } from "@wongdigital/ui";

const features = [
  {
    icon: Zap,
    title: "Fast delivery",
    description:
      "Most orders are processed within 2–6 hours — not days.",
    color: "var(--color-warning)",
  },
  {
    icon: ShieldCheck,
    title: "Verified accounts",
    description:
      "Every account is authenticated and activation-guaranteed. No bots, no resellers of resellers.",
    color: "var(--color-success)",
  },
  {
    icon: Globe2,
    title: "Global reach, local pricing",
    description:
      "Prices shown in ₱ PHP for Philippine buyers, USDT worldwide.",
    color: "var(--color-info)",
  },
  {
    icon: Package,
    title: "Flexible access plans",
    description:
      "Choose 1-year or lifetime access for every subscription. Upgrade or extend anytime.",
    color: "var(--accent)",
  },
  {
    icon: CreditCard,
    title: "Pay your way",
    description:
      "QRPH (GCash, Maya, all PH banks) for local buyers. Binance/Crypto worldwide.",
    color: "#22C55E",
  },
  {
    icon: Rocket,
    title: "100+ products",
    description:
      "AI tools, streaming, design suites, and social growth — one checkout.",
    color: "#A855F7",
  },
];

export function WhyUs() {
  const sectionRef = useIntersectionReveal<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="reveal container-shell py-14 sm:py-18 lg:py-24"
    >
      {/* Heading */}
      <div className="mb-10 sm:mb-14">
        <SectionHeading
          eyebrow="Why Wong Digital"
          title="Built for serious buyers"
          description="Every detail engineered for speed, trust, and quality."
        />
      </div>

      {/* Feature cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 reveal-stagger">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              variant="interactive"
              key={index}
              className="group relative overflow-hidden p-6"
            >
              <div>
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${feature.color} 12%, transparent)`,
                  }}
                >
                  <Icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 className="font-display text-base font-semibold text-[--text-primary] mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[--text-secondary]">
                  {feature.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
