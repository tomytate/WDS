import type { ReactNode } from "react"

import { cn } from "./cn"

/**
 * StatusBadge — pill used to indicate a status.
 *
 * Renders a coloured dot + uppercase label. The `tone` prop picks a semantic palette
 * (`neutral`, `success`, `warning`, `danger`, `info`, `accent`) and the dot can pulse
 * when `pulse` is true (useful for "pending" / "processing" states).
 *
 * Accessibility:
 * - Uses the `--color-*-text` tokens which are WCAG AA body-contrast verified.
 * - The dot is purely decorative (`aria-hidden`) — the label text carries the status.
 * - Outer span gets `role="status"` when `live` is enabled so SRs announce changes.
 */
export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info" | "accent"

const toneClasses: Record<StatusTone, { wrap: string; dot: string }> = {
  neutral: {
    wrap: "border-[--border] bg-[--bg-surface] text-[--text-secondary]",
    dot: "bg-[--text-muted]",
  },
  success: {
    wrap:
      "border-[color-mix(in_srgb,var(--color-success)_50%,var(--border))] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[--color-success-text]",
    dot: "bg-[--color-success]",
  },
  warning: {
    wrap:
      "border-[color-mix(in_srgb,var(--color-warning)_50%,var(--border))] bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[--color-warning-text]",
    dot: "bg-[--color-warning]",
  },
  danger: {
    wrap:
      "border-[color-mix(in_srgb,var(--color-danger)_50%,var(--border))] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] text-[--color-danger-text]",
    dot: "bg-[--color-danger]",
  },
  info: {
    wrap:
      "border-[color-mix(in_srgb,var(--color-info)_50%,var(--border))] bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[--color-info-text]",
    dot: "bg-[--color-info]",
  },
  accent: {
    wrap: "border-[--accent] bg-[--accent-tint-soft] text-[--accent-strong]",
    dot: "bg-[--accent]",
  },
}

export type StatusBadgeProps = {
  tone?: StatusTone
  pulse?: boolean
  live?: boolean
  className?: string
  children: ReactNode
}

export function StatusBadge({
  tone = "neutral",
  pulse = false,
  live = false,
  className,
  children,
}: StatusBadgeProps) {
  const t = toneClasses[tone]
  return (
    <span
      role={live ? "status" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[--radius-chip] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.22em]",
        t.wrap,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", t.dot, pulse && "animate-pulse")} />
      {children}
    </span>
  )
}
