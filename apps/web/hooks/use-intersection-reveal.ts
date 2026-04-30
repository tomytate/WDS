"use client"

import { useEffect, useRef } from "react"

/**
 * Scroll-reveal hook using IntersectionObserver.
 * Adds "revealed" class when element enters viewport.
 *
 * Usage:
 * ```tsx
 * const ref = useIntersectionReveal<HTMLElement>()
 * <section ref={ref} className="reveal">...</section>
 * ```
 */
export function useIntersectionReveal<T extends HTMLElement>(
  threshold = 0.1,
  rootMargin = "0px 0px -60px 0px",
) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Skip if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("revealed")
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("revealed")
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return ref
}
