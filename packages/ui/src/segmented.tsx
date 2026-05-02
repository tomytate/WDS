"use client"

import { useCallback, useId, useRef, type KeyboardEvent, type ReactNode } from "react"

import { cn } from "./cn"

/**
 * Segmented — single-select control that looks like a pill group.
 *
 * Use Tabs when the control picks a panel to display, Segmented when the control picks a value
 * (e.g. "Grid / List", "Day / Week / Month"). Implemented as `role="radiogroup"`.
 *
 * Accessibility:
 *   • `role="radiogroup"` wrapper, `role="radio"` options with `aria-checked`.
 *   • Arrow keys move and activate selection (Arrow{Left,Right,Up,Down}, Home, End).
 *   • Each option has `min-h-[44px]` to meet WCAG 2.2 §2.5.8 AA (24×24) with margin.
 */
export type SegmentedOption<T extends string = string> = {
  value: T
  label: ReactNode
  disabled?: boolean
}

export type SegmentedProps<T extends string = string> = {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  "aria-label"?: string
  className?: string
}

export function Segmented<T extends string = string>({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
  className,
}: SegmentedProps<T>) {
  const id = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const currentIdx = options.findIndex((o) => o.value === value)
      if (currentIdx < 0) return
      let nextIdx = -1
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIdx = (currentIdx + 1) % options.length
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") nextIdx = (currentIdx - 1 + options.length) % options.length
      else if (e.key === "Home") nextIdx = 0
      else if (e.key === "End") nextIdx = options.length - 1
      else return
      // Skip disabled options
      let guard = 0
      while (options[nextIdx]?.disabled && guard++ < options.length) {
        nextIdx = (nextIdx + 1) % options.length
      }
      const nextOption = options[nextIdx]
      if (!nextOption) return
      e.preventDefault()
      onChange(nextOption.value)
      refs.current[nextIdx]?.focus()
    },
    [onChange, options, value],
  )

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] p-1 text-sm",
        className,
      )}
    >
      {options.map((opt, i) => {
        const selected = opt.value === value
        return (
          <button
            ref={(node) => {
              refs.current[i] = node
            }}
            key={`${id}-${opt.value}`}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex min-h-[36px] items-center rounded-[calc(var(--radius-inner)-2px)] px-3 py-1.5 font-medium transition-colors duration-150",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--text-primary]",
              selected
                ? "bg-[--text-primary] text-[--bg-base]"
                : "text-[--text-secondary] hover:text-[--text-primary]",
              opt.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
