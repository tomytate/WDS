import { useId, type ReactNode } from "react"

import { Card, CardContent } from "./card"
import { cn } from "./cn"

export type KpiCardProps = {
  icon?: ReactNode
  label: string
  value: string
  hint?: string
  emphasized?: boolean
  className?: string
}

export function KpiCard({
  icon,
  label,
  value,
  hint,
  emphasized = false,
  className,
}: KpiCardProps) {
  const hintId = useId()
  const valueId = useId()

  return (
    <Card
      className={cn(
        "group relative h-full overflow-hidden transition-colors duration-200",
        emphasized
          ? "border-[--text-primary] shadow-[2px_2px_0_var(--accent)]"
          : "hover:border-[--text-primary]",
        className,
      )}
      role="group"
      aria-labelledby={`${valueId}-label`}
      aria-describedby={hint ? hintId : undefined}
    >
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <p
            id={`${valueId}-label`}
            className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[--text-muted]"
          >
            {label}
          </p>
          {icon ? (
            <div
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-base] text-[--text-primary] [&>svg]:size-[14px]"
            >
              {icon}
            </div>
          ) : null}
        </div>
        <p
          className="truncate font-display text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl"
          title={value}
        >
          {value}
        </p>
        {hint ? (
          <p
            id={hintId}
            className="text-[12px] leading-4 text-[--text-secondary]"
          >
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
