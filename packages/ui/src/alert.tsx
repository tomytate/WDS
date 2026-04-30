import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "./cn"

/**
 * Alert — inline banner for informational / success / warning / danger messages.
 *
 * Accessibility:
 *   • `role="alert"` on danger/warning (assertive), `role="status"` on info/success (polite).
 *   • Leading icon is decorative — the title + description carry the meaning.
 *   • Text uses the `--color-*-text` tokens which meet WCAG 2.2 AA body contrast (4.5:1).
 */
export type AlertTone = "info" | "success" | "warning" | "danger" | "neutral"

const toneClasses: Record<AlertTone, string> = {
  neutral:
    "border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_70%,transparent)] text-[--text-primary]",
  info:
    "border-[color-mix(in_srgb,var(--color-info)_40%,var(--border))] bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)] text-[--color-info-text]",
  success:
    "border-[color-mix(in_srgb,var(--color-success)_40%,var(--border))] bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)] text-[--color-success-text]",
  warning:
    "border-[color-mix(in_srgb,var(--color-warning)_40%,var(--border))] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] text-[--color-warning-text]",
  danger:
    "border-[color-mix(in_srgb,var(--color-danger)_40%,var(--border))] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] text-[--color-danger-text]",
}

const assertiveTones = new Set<AlertTone>(["danger", "warning"])

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone
  title?: ReactNode
  icon?: ReactNode
  /** Optional action row (buttons, links). */
  actions?: ReactNode
}

export function Alert({
  tone = "info",
  title,
  icon,
  actions,
  className,
  children,
  ...props
}: AlertProps) {
  const role = assertiveTones.has(tone) ? "alert" : "status"
  const live = assertiveTones.has(tone) ? "assertive" : "polite"

  return (
    <div
      role={role}
      aria-live={live}
      className={cn(
        "flex gap-3 rounded-[--radius-card] border px-4 py-3 text-sm leading-relaxed",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {icon ? (
        <span aria-hidden="true" className="mt-0.5 inline-flex shrink-0 [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      ) : null}
      <div className="flex-1 space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div>{children}</div> : null}
        {actions ? <div className="mt-2 flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
