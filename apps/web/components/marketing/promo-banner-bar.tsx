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
    ? "ink-block border-b border-[--border]"
    : "bg-[--bg-surface] text-[--text-primary] border-b border-[--border]"

  const content = (
    <div className="flex items-center gap-2.5 text-[13px] font-medium tracking-tight">
      <Megaphone size={13} className="shrink-0 text-[--accent]" aria-hidden="true" />
      <span>{banner.text}</span>
      {banner.link ? (
        <ArrowRight size={13} className="shrink-0 opacity-70" aria-hidden="true" />
      ) : null}
    </div>
  )

  return (
    <div className={`relative z-50 px-4 py-2.5 ${bgClass}`}>
      <div className="container-shell flex items-center justify-between gap-4">
        {banner.link ? (
          <Link
            href={banner.link}
            className="flex-1 hover:opacity-80 transition-opacity"
          >
            {content}
          </Link>
        ) : (
          <div className="flex-1">{content}</div>
        )}
        <button
          onClick={dismiss}
          className="shrink-0 rounded-[--radius-inner] p-1 transition-colors hover:bg-[color-mix(in_srgb,currentColor_10%,transparent)]"
          aria-label="Dismiss banner"
          type="button"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
