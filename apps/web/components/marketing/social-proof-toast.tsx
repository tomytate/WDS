"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle2, X } from "lucide-react"

type Order = {
  id: string
  customerName: string
  productName: string
  timeAgo: number
}

export function SocialProofToast({ initialOrders }: { initialOrders: Order[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // If we have no orders or the user dismissed it, don't run the cycle
    if (initialOrders.length === 0 || isDismissed) {
      return
    }

    // Initial delay before first toast
    const initialDelay = setTimeout(() => {
      setIsVisible(true)
    }, 5000)

    // Schedule the rotation interval
    const interval = setInterval(() => {
      setIsVisible(false) // Hide current

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % initialOrders.length) // Move to next
        setIsVisible(true) // Show new
      }, 1000) // Wait 1 second before showing the next one

    }, 30000) // Every 30 seconds

    return () => {
      clearTimeout(initialDelay)
      clearInterval(interval)
    }
  }, [initialOrders, isDismissed])

  if (initialOrders.length === 0 || isDismissed) {
    return null
  }

  const currentOrder = initialOrders[currentIndex]
  if (!currentOrder) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
          className="fixed bottom-4 left-4 z-50 sm:bottom-6 sm:left-6 flex max-w-sm items-start gap-3 rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-3.5 shadow-[--shadow-lg]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[--radius-inner] border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]">
            <CheckCircle2 size={16} className="text-[--color-success]" />
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--text-muted]">
              New order · {currentOrder.timeAgo}m ago
            </p>
            <p className="text-sm font-medium text-[--text-primary]">
              {currentOrder.customerName}
            </p>
            <p className="text-xs text-[--text-secondary] truncate">
              {currentOrder.productName}
            </p>
          </div>

          <button
            onClick={() => {
              setIsVisible(false)
              setIsDismissed(true)
            }}
            className="rounded-[--radius-inner] p-1 text-[--text-muted] hover:bg-[--bg-surface] hover:text-[--text-primary] transition-colors"
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
