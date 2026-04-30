import type { ReactNode } from "react"

import { cn } from "./cn"

/**
 * PageHeader — the eyebrow + title + description + action-row combo used at the top of every page.
 *
 * Accessibility (verified, see audit-status.md §1):
 * - Title renders as `<h1>` by default; pass `as="h2"` when nesting inside another section.
 * - Icon is marked decorative (`aria-hidden`) — the eyebrow text carries the label.
 * - Action container is a flex row so button-ordering is the keyboard focus order.
 */
export type PageHeaderProps = {
  icon?: ReactNode
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
  as?: "h1" | "h2"
  className?: string
}

export function PageHeader({
  icon,
  eyebrow,
  title,
  description,
  actions,
  as: Heading = "h1",
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 border-b border-[--border] pb-5 sm:mb-8 sm:gap-5 sm:pb-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="space-y-2.5">
        {eyebrow ? (
          <div className="flex items-center gap-2.5">
            {icon ? (
              <div
                aria-hidden="true"
                className="flex size-[--chip-size-md] items-center justify-center rounded-[--radius-inner] bg-[--accent-tint-soft] text-[--accent] [&>svg]:size-[--chip-icon-md]"
              >
                {icon}
              </div>
            ) : (
              <span aria-hidden="true" className="h-px w-4 bg-[--accent]" />
            )}
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[--accent-strong]">
              {eyebrow}
            </p>
          </div>
        ) : null}
        <div className="space-y-1.5">
          <Heading className="font-display text-2xl font-semibold leading-[1.1] tracking-tight sm:text-3xl lg:text-[34px] lg:leading-[1.05]">
            {title}
          </Heading>
          <p className="max-w-2xl text-sm leading-relaxed text-[--text-secondary]">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2 sm:gap-3">{actions}</div> : null}
    </div>
  )
}
