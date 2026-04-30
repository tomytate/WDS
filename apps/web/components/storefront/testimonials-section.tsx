"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionHeading } from "@wongdigital/ui";

type Review = {
  id: string;
  customerName: string;
  rating: number;
  content: string | null;
  createdAt: Date;
};

export function TestimonialsSection({ reviews }: { reviews: Review[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // IMPORTANT: all hooks must run unconditionally on every render — the
  // early returns live below so the rules-of-hooks invariant holds.
  useEffect(() => {
    if (!reviews || reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews]);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const previousReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const currentReview = reviews[currentIndex];
  if (!currentReview) return null;

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="container-shell max-w-4xl text-center">
        <SectionHeading
          className="mx-auto text-center items-center"
          eyebrow="Testimonials"
          title="Loved by our customers"
          description="Join thousands of satisfied creators using Wong Digital."
        />

        <div className="mx-auto mt-16 max-w-2xl relative">
          <Quote className="absolute -top-8 -left-4 sm:-left-8 h-12 w-12 sm:h-16 sm:w-16 text-[--border] opacity-50 -z-10 rotate-180" />

          <div className="min-h-[220px] sm:min-h-[180px] flex flex-col items-center justify-center p-6 sm:p-10 rounded-2xl border border-[--border] bg-[color-mix(in_srgb,var(--bg-card)_60%,transparent)] backdrop-blur-xl shadow-2xl shadow-[--accent-tint-soft] relative overflow-hidden transition-all duration-500">
            <div className="flex items-center justify-center space-x-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={
                    star <= currentReview.rating
                      ? "fill-[--color-warning] text-[--color-warning]"
                      : "fill-transparent text-[--border]"
                  }
                />
              ))}
            </div>

            <p className="text-xl sm:text-2xl font-medium text-[--text-primary] leading-relaxed mb-8 italic">
              "{currentReview.content || "Excellent service!"}"
            </p>

            <div className="flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--accent-tint-medium] text-[--accent] font-bold">
                {currentReview.customerName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="font-semibold text-[--text-primary]">
                  {currentReview.customerName}
                </p>
                <p className="text-xs text-[--text-secondary]">
                  Verified Customer
                </p>
              </div>
            </div>
          </div>

          {reviews.length > 1 && (
            <div className="absolute top-1/2 -translate-y-1/2 w-[calc(100%+3rem)] sm:w-[calc(100%+6rem)] -left-6 sm:-left-12 flex justify-between pointer-events-none">
              <button
                onClick={previousReview}
                className="pointer-events-auto h-12 w-12 rounded-full border border-[--border] bg-[--bg-surface] flex items-center justify-center text-[--text-secondary] shadow-lg transition-all hover:border-[--accent] hover:text-[--accent] active:scale-95 z-10"
                aria-label="Previous review"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextReview}
                className="pointer-events-auto h-12 w-12 rounded-full border border-[--border] bg-[--bg-surface] flex items-center justify-center text-[--text-secondary] shadow-lg transition-all hover:border-[--accent] hover:text-[--accent] active:scale-95 z-10"
                aria-label="Next review"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-2">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-8 bg-[--accent]"
                    : "w-2 bg-[--border] hover:bg-[--text-muted]"
                }`}
                aria-label={`Go to review ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
