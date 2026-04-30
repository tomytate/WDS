"use client";

import {
  Star,
  Clock,
  ShieldCheck,
  Landmark,
  ChevronLeft,
  ChevronRight,
  Quote,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";
import { Card } from "@wongdigital/ui";

/* ─── Metrics ─── */
const metrics = [
  {
    id: "orders",
    label: "Orders Fulfilled",
    value: 210065,
    suffix: "",
    icon: ShieldCheck,
  },
  {
    id: "delivery",
    label: "Avg Turnaround",
    value: 24,
    suffix: "h",
    icon: Clock,
  },
  {
    id: "rating",
    label: "Satisfaction Rate",
    value: 4.9,
    suffix: "★",
    decimals: 1,
    icon: Star,
  },
  {
    id: "secure",
    label: "Payment Security",
    value: 100,
    suffix: "%",
    icon: Landmark,
  },
];

/* ─── Testimonials ─── */
const testimonials = [
  {
    name: "Sarah M. — California, USA",
    text: "Got my Canva Pro activated in under 2 hours. Tried 3 other stores before this — Wong Digital is the only one that actually delivers.",
    rating: 5,
  },
  {
    name: "Liam O. — London, UK",
    text: "ChatGPT Pro working flawlessly for 8 months now. The lifetime plan is an absolute steal. Will be back for Spotify next.",
    rating: 5,
  },
  {
    name: "Yuki S. — Tokyo, Japan",
    text: "Their support replied within minutes when I had a setup question. Spotify Premium has been running perfectly for 6 months straight.",
    rating: 5,
  },
  {
    name: "Ahmed K. — Dubai, UAE",
    text: "Ordered 50K followers for our agency's client page. Real organic growth, not bots. Already placed our third bulk order.",
    rating: 5,
  },
  {
    name: "Oliver D. — Sydney, Australia",
    text: "Paid via Binance in seconds, account credentials delivered in 45 minutes. This is how digital commerce should work.",
    rating: 5,
  },
];

/* ─── Animated Counter ─── */
function AnimatedCounter({
  target,
  suffix,
  decimals = 0,
  isDynamic = false,
}: {
  target: number;
  suffix: string;
  decimals?: number;
  isDynamic?: boolean;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  // Dynamic starting calculation (base value + time-based organic growth)
  const [dynamicTarget, setDynamicTarget] = useState(target);

  useEffect(() => {
    if (!isDynamic) return;
    const baseDate = new Date("2024-03-01T00:00:00Z").getTime();
    const now = Date.now();
    // Roughly 40 orders per day since base line
    const daysSince = Math.max(0, (now - baseDate) / (1000 * 60 * 60 * 24));
    const organicGrowth = Math.floor(daysSince * 40);

    setDynamicTarget(target + organicGrowth);

    // Simulate random organic bumps while user is looking
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setDynamicTarget((prev) => prev + 1);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isDynamic, target]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (!hasAnimated.current) {
            hasAnimated.current = true;
            const start = performance.now();
            const duration = 1200;

            function tick(now: number) {
              const elapsed = Math.min((now - start) / duration, 1);
              const progress =
                elapsed === 1 ? 1 : 1 - Math.pow(2, -10 * elapsed);
              setCount(progress * dynamicTarget);
              if (elapsed < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
          } else {
            // Already animated, just sync directly if it bumped
            setCount(dynamicTarget);
          }
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [dynamicTarget]);

  const displayValue =
    decimals > 0
      ? count.toFixed(decimals)
      : new Intl.NumberFormat("en-US").format(Math.round(count));

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}
      {suffix}
    </span>
  );
}

/* ─── Main Section ─── */
export function SocialProof() {
  const sectionRef = useIntersectionReveal<HTMLElement>();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoplay]);

  const pauseAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resumeAutoplay = () => {
    pauseAutoplay();
    startAutoplay();
  };

  const goNext = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    resumeAutoplay();
  };

  const goPrev = () => {
    setActiveTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
    resumeAutoplay();
  };

  return (
    <section
      ref={sectionRef}
      className="reveal container-shell py-14 sm:py-18 lg:py-24"
    >
      {/* Section heading */}
      <div className="mb-10">
        <div className="accent-bar mb-4" />
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[--text-primary]">
          Trusted Worldwide
        </h2>
        <p className="mt-2 text-sm text-[--text-secondary] max-w-lg">
          Real orders, real reviews, fast global delivery.
        </p>
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 reveal-stagger">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              variant="elevated"
              key={metric.label}
              className="group relative h-full overflow-hidden p-5 text-center transition-all duration-300 hover:shadow-md"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent-tint-soft] text-[--accent] ring-1 ring-[--accent-tint-medium] transition-transform duration-300 group-hover:scale-110">
                <Icon size={18} aria-hidden="true" />
              </div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-[--text-primary]">
                <AnimatedCounter
                  target={metric.value}
                  suffix={metric.suffix}
                  decimals={metric.decimals}
                  isDynamic={metric.id === "orders"}
                />
              </p>
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[--text-muted]">
                {metric.label}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Testimonial carousel — single card with fade transition */}
      <div
        className="mt-10"
        onMouseEnter={pauseAutoplay}
        onMouseLeave={resumeAutoplay}
      >
        <div className="relative mx-auto max-w-2xl">
          {/* Card */}
          <Card
            variant="glass"
            className="p-6 sm:p-8 min-h-[160px] flex flex-col justify-center"
          >
            {/* Quote icon */}
            <Quote
              size={28}
              className="mb-3 text-[--accent] opacity-50"
              aria-hidden="true"
            />

            {(() => {
              const t = testimonials[activeTestimonial];
              if (!t) return null;
              return (
                <>
                  {/* Stars */}
                  <div className="mb-3 flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="fill-[--accent] text-[--accent]"
                      />
                    ))}
                  </div>

                  {/* Text with fade animation */}
                  <blockquote
                    key={activeTestimonial}
                    className="animate-fade-in-up-sm font-medium text-base leading-relaxed text-[--text-primary] sm:text-lg"
                  >
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <p
                    key={`name-${activeTestimonial}`}
                    className="animate-fade-in-up-sm mt-3 text-sm text-[--text-muted]"
                    style={{ animationDelay: "80ms" }}
                  >
                    — {t.name}
                  </p>
                </>
              );
            })()}
          </Card>

          {/* Navigation arrows */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous testimonial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] text-[--text-muted] transition-all hover:border-[--accent] hover:text-[--accent] hover:shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Dots */}
            {testimonials.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to testimonial ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeTestimonial
                    ? "w-6 bg-[--accent]"
                    : "w-2 bg-[--border] hover:bg-[--text-muted]"
                }`}
                onClick={() => {
                  setActiveTestimonial(index);
                  resumeAutoplay();
                }}
              />
            ))}

            <button
              type="button"
              onClick={goNext}
              aria-label="Next testimonial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] text-[--text-muted] transition-all hover:border-[--accent] hover:text-[--accent] hover:shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
