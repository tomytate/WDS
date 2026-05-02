"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
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
    <section className="relative py-20 sm:py-28 border-t border-[--border]">
      <div className="container-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-center">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Testimonials"
              title="Loved by our customers."
              description="Join thousands of creators using Wong Digital."
            />
          </div>

          <div className="lg:col-span-8">
            <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card]">
              <div className="border-b border-[--border] px-6 py-3 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                  Customer · {String(currentIndex + 1).padStart(2, "0")}/{String(reviews.length).padStart(2, "0")}
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={
                        star <= currentReview.rating
                          ? "fill-[--text-primary] text-[--text-primary]"
                          : "fill-transparent text-[--border]"
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-10">
                <blockquote
                  key={currentReview.id}
                  className="animate-fade-in-up-sm font-display text-xl sm:text-2xl lg:text-3xl leading-[1.3] tracking-tight text-[--text-primary]"
                >
                  &ldquo;{currentReview.content || "Excellent service!"}&rdquo;
                </blockquote>
                <div className="mt-8 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[--radius-inner] bg-[--accent] font-mono font-bold text-[--accent-fg]">
                    {currentReview.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-display text-base font-semibold text-[--text-primary]">
                      {currentReview.customerName}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--text-muted]">
                      Verified customer
                    </p>
                  </div>
                </div>
              </div>

              {reviews.length > 1 && (
                <div className="border-t border-[--border] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {reviews.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          currentIndex === idx
                            ? "w-8 bg-[--text-primary]"
                            : "w-3 bg-[--border] hover:bg-[--text-muted]"
                        }`}
                        aria-label={`Go to review ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={previousReview}
                      className="flex h-9 w-9 items-center justify-center rounded-[--radius-inner] border border-[--border] text-[--text-muted] transition-colors hover:border-[--text-primary] hover:text-[--text-primary]"
                      aria-label="Previous review"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={nextReview}
                      className="flex h-9 w-9 items-center justify-center rounded-[--radius-inner] border border-[--border] text-[--text-muted] transition-colors hover:border-[--text-primary] hover:text-[--text-primary]"
                      aria-label="Next review"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
