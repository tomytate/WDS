"use client";

import { useRef } from "react";
import { Package, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";
import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";
import { SectionHeading } from "@wongdigital/ui";

const steps = [
  {
    number: "01",
    title: "Pick your products",
    description:
      "Browse 100+ subscriptions and growth packages. Mix and match in one cart.",
    icon: Package,
  },
  {
    number: "02",
    title: "Pay securely",
    description:
      "QRPH or Binance Pay. Scan, send, and upload your receipt.",
    icon: CreditCard,
  },
  {
    number: "03",
    title: "We verify & fulfill",
    description:
      "We confirm your payment and start fulfillment. Most orders are ready within 2–6 hours.",
    icon: Clock,
  },
  {
    number: "04",
    title: "Access delivered",
    description:
      "Credentials arrive via email, or watch your growth service come online.",
    icon: CheckCircle2,
  },
];

export function HowItWorks() {
  const sectionRef = useIntersectionReveal<HTMLElement>();
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });

  const smoothedProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      ref={sectionRef}
      className="reveal container-shell py-16 sm:py-20 lg:py-28 border-t border-[--border]"
    >
      <div ref={timelineRef}>
        <div className="mb-12 sm:mb-16">
          <SectionHeading
            eyebrow="How it works"
            title="From browse to delivery in four steps."
          />
        </div>

        {/* Desktop horizontal */}
        <div className="hidden sm:block">
          <div className="relative">
            <div
              className="absolute top-5 left-0 right-0 h-px bg-[--border]"
              aria-hidden="true"
            />
            <motion.div
              className="absolute top-5 left-0 right-0 h-px bg-[--text-primary] origin-left"
              style={{ scaleX: scrollYProgress }}
              aria-hidden="true"
            />

            <div className="relative grid grid-cols-4 gap-6 lg:gap-10">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="relative reveal-stagger"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Marker */}
                    <div className="relative z-10 mb-8 flex h-10 w-10 items-center justify-center rounded-[--radius-inner] border border-[--text-primary] bg-[--bg-base] font-mono text-xs font-semibold text-[--text-primary]">
                      {step.number}
                    </div>

                    <div className="mb-3 inline-flex items-center gap-2 text-[--text-primary]">
                      <Icon size={18} strokeWidth={1.75} />
                    </div>

                    <h3 className="font-display text-lg font-semibold tracking-tight text-[--text-primary] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[--text-secondary] max-w-[240px]">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile vertical */}
        <div className="block sm:hidden relative ml-4">
          <div
            className="absolute top-5 bottom-[60px] left-[19px] w-px bg-[--border]"
            aria-hidden="true"
          />
          <motion.div
            className="absolute top-5 bottom-[60px] left-[19px] w-px bg-[--text-primary] origin-top"
            style={{ scaleY: smoothedProgress }}
            aria-hidden="true"
          />

          <div className="space-y-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative flex gap-5 reveal-stagger"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative z-10 shrink-0 flex h-10 w-10 items-center justify-center rounded-[--radius-inner] border border-[--text-primary] bg-[--bg-base] font-mono text-xs font-semibold text-[--text-primary]">
                    {step.number}
                  </div>

                  <div className="pt-1 pb-2">
                    <div className="mb-2 inline-flex items-center gap-2 text-[--text-primary]">
                      <Icon size={16} strokeWidth={1.75} />
                    </div>
                    <h3 className="font-display text-base font-semibold tracking-tight text-[--text-primary]">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[--text-secondary]">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
