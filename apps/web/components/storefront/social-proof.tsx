"use client";

import {
  Star,
  Clock,
  ShieldCheck,
  Landmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";
import { SectionHeading } from "@wongdigital/ui";

const metrics = [
  {
    id: "orders",
    label: "Orders fulfilled",
    value: 210065,
    suffix: "",
    icon: ShieldCheck,
  },
  {
    id: "delivery",
    label: "Avg turnaround",
    value: 24,
    suffix: "h",
    icon: Clock,
  },
  {
    id: "rating",
    label: "Satisfaction",
    value: 4.9,
    suffix: "★",
    decimals: 1,
    icon: Star,
  },
  {
    id: "secure",
    label: "Payment security",
    value: 100,
    suffix: "%",
    icon: Landmark,
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    location: "California, USA",
    text: "Got my Canva Pro activated in under 2 hours. Tried 3 other stores before this — Wong Digital is the only one that actually delivers.",
    rating: 5,
  },
  {
    name: "Liam O.",
    location: "London, UK",
    text: "ChatGPT Pro working flawlessly for 8 months now. The lifetime plan is an absolute steal. Will be back for Spotify next.",
    rating: 5,
  },
  {
    name: "Yuki S.",
    location: "Tokyo, Japan",
    text: "Their support replied within minutes when I had a setup question. Spotify Premium has been running perfectly for 6 months straight.",
    rating: 5,
  },
  {
    name: "Ahmed K.",
    location: "Dubai, UAE",
    text: "Ordered 50K followers for our agency's client page. Real organic growth, not bots. Already placed our third bulk order.",
    rating: 5,
  },
  {
    name: "Oliver D.",
    location: "Sydney, Australia",
    text: "Paid via Binance in seconds, account credentials delivered in 45 minutes. This is how digital commerce should work.",
    rating: 5,
  },
];

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

  const [dynamicTarget, setDynamicTarget] = useState(target);

  useEffect(() => {
    if (!isDynamic) return;
    const baseDate = new Date("2024-03-01T00:00:00Z").getTime();
    const now = Date.now();
    const daysSince = Math.max(0, (now - baseDate) / (1000 * 60 * 60 * 24));
    const organicGrowth = Math.floor(daysSince * 40);

    setDynamicTarget(target + organicGrowth);

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

export function SocialProof() {
  const sectionRef = useIntersectionReveal<HTMLElement>();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
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

  const t = testimonials[activeTestimonial];

  return (
    <section
      ref={sectionRef}
      className="reveal container-shell py-16 sm:py-20 lg:py-28 border-t border-[--border]"
    >
      <div className="mb-12">
        <SectionHeading
          eyebrow="Trusted Worldwide"
          title="Real orders. Real reviews. Fast delivery."
        />
      </div>

      {/* Metrics — flat ink-bordered table */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[--border] border border-[--border] rounded-[--radius-card] overflow-hidden reveal-stagger mb-12">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-[--bg-card] p-6 sm:p-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                  {metric.label}
                </span>
                <Icon size={14} className="text-[--text-muted]" aria-hidden="true" />
              </div>
              <p className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[--text-primary]">
                <AnimatedCounter
                  target={metric.value}
                  suffix={metric.suffix}
                  decimals={metric.decimals}
                  isDynamic={metric.id === "orders"}
                />
              </p>
            </div>
          );
        })}
      </div>

      {/* Testimonial — editorial pull-quote layout */}
      <div
        className="border border-[--border] rounded-[--radius-card] bg-[--bg-card]"
        onMouseEnter={pauseAutoplay}
        onMouseLeave={resumeAutoplay}
      >
        <div className="grid lg:grid-cols-12 gap-0">
          <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[--border] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[--text-muted] mb-3">
                Customer · {String(activeTestimonial + 1).padStart(2, "0")}/{String(testimonials.length).padStart(2, "0")}
              </p>
              {t && (
                <>
                  <p className="font-display text-base font-semibold text-[--text-primary]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[--text-muted] mt-0.5">
                    {t.location}
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous testimonial"
                className="flex h-9 w-9 items-center justify-center rounded-[--radius-inner] border border-[--border] text-[--text-muted] transition-colors hover:border-[--text-primary] hover:text-[--text-primary]"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next testimonial"
                className="flex h-9 w-9 items-center justify-center rounded-[--radius-inner] border border-[--border] text-[--text-muted] transition-colors hover:border-[--text-primary] hover:text-[--text-primary]"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-9 p-6 sm:p-10 flex flex-col justify-between">
            {t && (
              <>
                <blockquote
                  key={activeTestimonial}
                  className="animate-fade-in-up-sm font-display text-xl sm:text-2xl lg:text-3xl leading-[1.3] tracking-tight text-[--text-primary] max-w-3xl"
                >
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <div className="mt-8 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="fill-[--text-primary] text-[--text-primary]"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        aria-label={`Go to testimonial ${index + 1}`}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          index === activeTestimonial
                            ? "w-8 bg-[--text-primary]"
                            : "w-3 bg-[--border] hover:bg-[--text-muted]"
                        }`}
                        onClick={() => {
                          setActiveTestimonial(index);
                          resumeAutoplay();
                        }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
