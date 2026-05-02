import type { ReactNode } from "react"

import { cn } from "./cn"

export type StatusTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent"

const toneClasses: Record<StatusTone, { wrap: string; dot: string }> = {
  neutral: {
    wrap: "border-[--border] bg-[--bg-surface] text-[--text-secondary]",
    dot: "bg-[--text-muted]",
  },
  success: {
    wrap:
      "border-[color-mix(in_srgb,var(--color-success)_50%,var(--border))] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[--color-success-text]",
    dot: "bg-[--color-success]",
  },
  warning: {
    wrap:
      "border-[color-mix(in_srgb,var(--color-warning)_50%,var(--border))] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[--color-warning-text]",
    dot: "bg-[--color-warning]",
  },
  danger: {
    wrap:
      "border-[color-mix(in_srgb,var(--color-danger)_50%,var(--border))] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[--color-danger-text]",
    dot: "bg-[--color-danger]",
  },
  info: {
    wrap:
      "border-[color-mix(in_srgb,var(--color-info)_50%,var(--border))] bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[--color-info-text]",
    dot: "bg-[--color-info]",
  },
  accent: {
    wrap: "border-[--text-primary] bg-[--accent] text-[--accent-fg]",
    dot: "bg-[--accent-fg]",
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
        "inline-flex items-center gap-1.5 rounded-[--radius-inner] border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]",
        t.wrap,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          t.dot,
          pulse && "animate-pulse",
        )}
      />
      {children}
    </span>
  )
}
