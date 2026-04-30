"use client"

import { useCallback, useRef, type RefObject } from "react"

/**
 * 3D tilt effect for cards.
 * Desktop-only — disabled on touch devices.
 *
 * Usage:
 * ```tsx
 * const { ref, handlers } = useTilt<HTMLDivElement>()
 * <div ref={ref} {...handlers} style={{ transition: "transform 0.3s ease" }}>...</div>
 * ```
 */
export function useTilt<T extends HTMLElement>(maxDeg = 5): {
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

      // Skip on touch devices
      if (window.matchMedia("(pointer: coarse)").matches) return

      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      el.style.transform = `perspective(800px) rotateX(${-y * maxDeg}deg) rotateY(${x * maxDeg}deg) scale3d(1.02, 1.02, 1.02)`
    },
    [maxDeg],
  )

  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = "perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)"
  }, [])

  return { ref, handlers: { onMouseMove, onMouseLeave } }
}
