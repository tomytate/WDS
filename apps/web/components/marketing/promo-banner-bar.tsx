"use client"

import { useState, useEffect } from "react"
import { X, Megaphone, ArrowRight } from "lucide-react"
import Link from "next/link"

import type { PromoBanner } from "@/lib/vercel/edge-config"

const DISMISS_KEY = "wds:promo-banner-dismissed"

type PromoBannerBarProps = {
  banner: PromoBanner
}

export function PromoBannerBar({ banner }: PromoBannerBarProps) {
  const [dismissed, setDismissed] = useState(true) // Start hidden to avoid flash

  useEffect(() => {
    // Check sessionStorage on mount — only show if not dismissed this session
    const wasDismissed = sessionStorage.getItem(DISMISS_KEY)
    setDismissed(wasDismissed === "true")
  }, [])

  if (!banner || dismissed) return null

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "true")
    setDismissed(true)
  }

  const isAccent = banner.variant === "accent"
  const bgClass = isAccent
    ? "bg-[--accent] text-[--accent-fg]"
    : "bg-gradient-to-r from-[color-mix(in_srgb,var(--accent)_12%,var(--bg-card))] to-[color-mix(in_srgb,var(--accent)_6%,var(--bg-card))] text-[--text-primary] border-b border-[--accent-border]"

  const content = (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Megaphone size={14} className="shrink-0" aria-hidden="true" />
      <span>{banner.text}</span>
      {banner.link ? (
        <ArrowRight size={14} className="shrink-0 opacity-70" aria-hidden="true" />
      ) : null}
    </div>
  )

  return (
    <div className={`relative z-50 px-4 py-2.5 ${bgClass}`}>
      <div className="container-shell flex items-center justify-between gap-4">
        {banner.link ? (
          <Link href={banner.link} className="flex-1 hover:opacity-80 transition-opacity">
            {content}
          </Link>
        ) : (
          <div className="flex-1">{content}</div>
        )}
        <button
          onClick={dismiss}
          className={`shrink-0 rounded-full p-1 transition-all hover:scale-110 ${
            isAccent
              ? "hover:bg-[color-mix(in_srgb,var(--accent-fg)_20%,transparent)]"
              : "hover:bg-[--accent-tint-soft]"
          }`}
          aria-label="Dismiss banner"
          type="button"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
