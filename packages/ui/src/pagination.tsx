import type { ReactNode } from "react"

import { cn } from "./cn"

/**
 * Pagination — numbered page control with prev/next buttons.
 *
 * Headless: the consumer owns `page` state and decides how to fetch data.
 * Renders a `<nav aria-label>` wrapper and the current page gets `aria-current="page"`.
 *
 * Accessibility:
 *   • `<nav>` landmark (WCAG 2.4.1) labelled via `aria-label`.
 *   • Disabled prev/next get `aria-disabled` AND `disabled` so they aren't focusable.
 *   • Buttons are 44×44 minimum on touch (pointer: coarse rule in globals.css handles this).
 */
export type PaginationProps = {
  page: number
  /** 1-indexed total pages. If 0 or less, nothing renders. */
  totalPages: number
  onPageChange: (next: number) => void
  /** How many neighbours to show on each side of the current page. Default 1. */
  siblingCount?: number
  "aria-label"?: string
  className?: string
  /** Render a custom "Go to page {n}" label for screen readers. */
  getPageLabel?: (page: number) => string
}

function buildRange(page: number, total: number, siblings: number): (number | "…")[] {
  if (total <= 1) return [1]
  const first = 1
  const last = total
  const leftBound = Math.max(page - siblings, first + 1)
  const rightBound = Math.min(page + siblings, last - 1)
  const out: (number | "…")[] = [first]
  if (leftBound > first + 1) out.push("…")
  for (let p = leftBound; p <= rightBound; p++) out.push(p)
  if (rightBound < last - 1) out.push("…")
  if (last !== first) out.push(last)
  return out
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  "aria-label": ariaLabel = "Pagination",
  className,
  getPageLabel = (p) => `Go to page ${p}`,
}: PaginationProps) {
  if (totalPages <= 0) return null
  const range = buildRange(page, totalPages, siblingCount)
  const atFirst = page <= 1
  const atLast = page >= totalPages

  return (
    <nav aria-label={ariaLabel} className={cn("flex items-center gap-1", className)}>
      <PaginationButton
        aria-label="Previous page"
        disabled={atFirst}
        onClick={() => onPageChange(page - 1)}
      >
        <span aria-hidden="true">‹</span>
      </PaginationButton>
      <ul className="flex items-center gap-1">
        {range.map((entry, i) => (
          <li key={`${entry}-${i}`}>
            {entry === "…" ? (
              <span aria-hidden="true" className="inline-flex h-10 w-10 items-center justify-center text-[--text-muted]">
                …
              </span>
            ) : (
              <PaginationButton
                aria-label={getPageLabel(entry)}
                aria-current={entry === page ? "page" : undefined}
                selected={entry === page}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </PaginationButton>
            )}
          </li>
        ))}
      </ul>
      <PaginationButton
        aria-label="Next page"
        disabled={atLast}
        onClick={() => onPageChange(page + 1)}
      >
        <span aria-hidden="true">›</span>
      </PaginationButton>
    </nav>
  )
}

function PaginationButton({
  children,
  selected = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex h-10 min-w-[40px] items-center justify-center rounded-[--radius-inner] border px-2 text-sm font-medium transition-colors duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--text-primary]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        selected
          ? "border-[--text-primary] bg-[--text-primary] text-[--bg-base]"
          : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--text-primary] hover:text-[--text-primary]",
        props.className,
      )}
    >
      {children}
    </button>
  )
}
