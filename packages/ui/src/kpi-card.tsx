import { useId, type ReactNode } from "react"

import { Card, CardContent } from "./card"
import { cn } from "./cn"

/**
 * KpiCard — headline metric tile.
 *
 * Accessibility (verified, see audit-status.md §1):
 * - Wrapped in an implicit group that screen readers announce as a unit via `aria-labelledby` + `aria-describedby`.
 * - `title={value}` preserves the full metric when the value is visually truncated (WCAG 3.3.1).
 * - Hint text uses `--text-secondary` (≥6.15:1 on `--bg-card` light theme) to satisfy WCAG 1.4.3 AA body.
 * - Icon container is decorative (`aria-hidden`) — the label provides the semantic meaning.
 */
export type KpiCardProps = {
  icon?: ReactNode
  label: string
  value: string
  hint?: string
  /** Emphasize the tile (e.g. "pending > 0") by swapping the idle border for the accent border. */
  emphasized?: boolean
  className?: string
}

export function KpiCard({ icon, label, value, hint, emphasized = false, className }: KpiCardProps) {
  const hintId = useId()
  const valueId = useId()

  return (
    <Card
      className={cn(
        "group relative h-full overflow-hidden transition-colors duration-300",
        emphasized ? "border-[--accent-border]" : "hover:border-[--accent-border]",
        className,
      )}
      role="group"
      aria-labelledby={`${valueId}-label`}
      aria-describedby={hint ? hintId : undefined}
    >
      <CardContent className="space-y-2.5 p-4 sm:space-y-3 sm:p-5">
        <div className="flex items-center gap-2">
          {icon ? (
            <div
              aria-hidden="true"
              className="flex size-[--chip-size-md] items-center justify-center rounded-[--radius-inner] bg-[--accent-tint-soft] text-[--accent] [&>svg]:size-[--chip-icon-md]"
            >
              {icon}
            </div>
          ) : null}
          <p
            id={`${valueId}-label`}
            className="text-[11px] font-medium uppercase tracking-[0.16em] text-[--text-secondary]"
          >
            {label}
          </p>
        </div>
        <p
          className="truncate font-display text-2xl font-semibold tracking-tight sm:text-3xl"
          title={value}
        >
          {value}
        </p>
        {hint ? (
          <p id={hintId} className="text-[12px] leading-4 text-[--text-secondary]">
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
