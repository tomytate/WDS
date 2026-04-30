"use client";

import { useRef } from "react";
import { Package, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";
import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";

const steps = [
  {
    number: 1,
    title: "Pick your products",
    description:
      "Browse 100+ subscriptions and growth packages. Mix and match in one cart.",
    icon: Package,
  },
  {
    number: 2,
    title: "Pay securely",
    description:
      "QRPH or Binance Pay. Scan, send, and upload your receipt.",
    icon: CreditCard,
  },
  {
    number: 3,
    title: "We verify & fulfill",
    description:
      "We confirm your payment and start fulfillment. Most orders are ready within 2–6 hours.",
    icon: Clock,
  },
  {
    number: 4,
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

  // Smooth out the scroll animation slightly
  const smoothedProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      ref={sectionRef}
      className="reveal container-shell py-14 sm:py-18 lg:py-24"
    >
      <div ref={timelineRef}>
        {/* Heading */}
        <div className="mb-12 sm:mb-16 text-center">
          <div className="accent-bar mx-auto mb-4" />
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[--text-primary]">
            How it works
          </h2>
          <p className="mt-2 text-sm text-[--text-secondary] max-w-md mx-auto">
            From browse to delivery in four steps.
          </p>
        </div>

        {/* Desktop: Horizontal timeline */}
        <div className="hidden sm:block">
          <div className="relative">
            {/* Connecting line using motion for precise scroll scrubbing */}
            <div
              className="absolute top-6 left-6 right-6 h-[2px] bg-[--border]"
              aria-hidden="true"
            />
            <motion.div
              className="absolute top-6 left-6 right-6 h-[2px] bg-gradient-to-r from-[--accent] to-[--color-info] origin-left"
              style={{ scaleX: scrollYProgress }}
              aria-hidden="true"
            />

            {/* Steps */}
            <div className="relative grid grid-cols-4 gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="flex flex-col items-center text-center reveal-stagger"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    {/* Step circle */}
                    <div className="step-number-ring mb-6 relative z-10 bg-[--bg-base]">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent-tint-soft] text-[--accent]">
                      <Icon size={20} />
                    </div>

                    {/* Content */}
                    <h3 className="font-display text-base font-bold text-[--text-primary]">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[--text-secondary] max-w-[200px]">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="block sm:hidden relative ml-4">
          {/* Connecting line using motion for precise scroll scrubbing */}
          <div
            className="absolute top-6 bottom-[100px] left-[15px] w-[2px] bg-[--border]"
            aria-hidden="true"
          />
          <motion.div
            className="absolute top-6 bottom-[100px] left-[15px] w-[2px] bg-gradient-to-b from-[--accent] to-[--color-info] origin-top"
            style={{ scaleY: smoothedProgress }}
            aria-hidden="true"
          />

          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative flex gap-5 reveal-stagger"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  {/* Step circle */}
                  <div className="step-number-ring z-10 shrink-0 bg-[--bg-base]">
                    {step.number}
                  </div>

                  <div className="pt-1 pb-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[--accent-tint-soft] text-[--accent]">
                      <Icon size={16} />
                    </div>
                    <h3 className="font-display text-base font-bold text-[--text-primary]">
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
