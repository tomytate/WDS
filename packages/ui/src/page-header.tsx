import type { ReactNode } from "react"

import { cn } from "./cn"

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
        "mb-6 flex flex-col gap-4 border-b border-[--border] pb-6 sm:mb-8 lg:mb-10 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="space-y-3 max-w-2xl">
        {eyebrow ? (
          <div className="flex items-center gap-2.5">
            {icon ? (
              <div
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-card] text-[--text-primary] [&>svg]:size-[14px]"
              >
                {icon}
              </div>
            ) : (
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-sm bg-[--accent]"
              />
            )}
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[--text-muted]">
              {eyebrow}
            </p>
          </div>
        ) : null}
        <div className="space-y-2">
          <Heading className="font-display text-3xl font-semibold leading-[1.05] tracking-[-0.025em] sm:text-4xl lg:text-[40px]">
            {title}
          </Heading>
          <p className="text-[15px] leading-relaxed text-[--text-secondary]">
            {description}
          </p>
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap gap-2 sm:gap-3">{actions}</div>
      ) : null}
    </div>
  )
}
