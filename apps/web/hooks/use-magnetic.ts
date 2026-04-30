"use client"

import { useCallback, useRef, type RefObject } from "react"

/**
 * Magnetic button effect — button shifts toward cursor when within proximity.
 * Desktop-only — disabled on touch devices.
 *
 * Usage:
 * ```tsx
 * const { ref, handlers } = useMagnetic<HTMLButtonElement>()
 * <button ref={ref} {...handlers}>Click me</button>
 * ```
 */
export function useMagnetic<T extends HTMLElement>(
  strength = 0.3,
  maxDisplacement = 8,
): {
  ref: RefObject<T | null>
  handlers: {
    onMouseMove: (e: React.MouseEvent) => void
    onMouseLeave: () => void
  }
} {
  const ref = useRef<T | null>(null)

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current
      if (!el) return
      if (window.matchMedia("(pointer: coarse)").matches) return

      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = (e.clientX - centerX) * strength
      const deltaY = (e.clientY - centerY) * strength

      const clampedX = Math.max(-maxDisplacement, Math.min(maxDisplacement, deltaX))
      const clampedY = Math.max(-maxDisplacement, Math.min(maxDisplacement, deltaY))

      el.style.transform = `translate(${clampedX}px, ${clampedY}px)`
      el.style.transition = "transform 0.15s ease-out"
    },
    [strength, maxDisplacement],
  )

  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = "translate(0, 0)"
    el.style.transition = "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
  }, [])

  return { ref, handlers: { onMouseMove, onMouseLeave } }
}
