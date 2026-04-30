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
          className="fixed bottom-4 left-4 z-50 sm:bottom-6 sm:left-6 flex max-w-sm items-start gap-4 rounded-2xl border border-[--border] bg-[color-mix(in_srgb,var(--bg-card)_80%,transparent)] p-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)]">
            <CheckCircle2 size={20} className="text-[--color-success]" />
          </div>

          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-[--text-primary]">
              {currentOrder.customerName} just got
            </p>
            <p className="text-sm text-[--accent]">
              {currentOrder.productName}
            </p>
            <p className="text-xs text-[--text-muted]">
              {currentOrder.timeAgo} minute{currentOrder.timeAgo === 1 ? "" : "s"} ago
            </p>
          </div>

          <button
            onClick={() => {
              setIsVisible(false)
              setIsDismissed(true)
            }}
            className="p-1 text-[--text-muted] hover:text-[--text-primary] transition-colors"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
