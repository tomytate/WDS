import type { HTMLAttributes } from "react";

import { cn } from "./cn";

type BadgeTone = "accent" | "muted" | "success" | "danger" | "info";
type BadgeSize = "sm" | "md";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  size?: BadgeSize;
  dot?: boolean;
};

/**
 * Citrus Editorial badges — sharp, mono-typeset. No uppercase pill blur.
 */
const toneClasses: Record<BadgeTone, string> = {
  accent:
    "border-[--text-primary] bg-[--accent] text-[--accent-fg]",
  muted:
    "border-[--border] bg-[--bg-surface] text-[--text-secondary]",
  success:
    "border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[--color-success-text]",
  danger:
    "border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-[--color-danger-text]",
  info:
    "border-[--color-info] bg-[color-mix(in_srgb,var(--color-info)_14%,transparent)] text-[--color-info-text]",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] tracking-[0.08em]",
  md: "px-2.5 py-1 text-[11px] tracking-[0.08em]",
};

const dotColors: Record<BadgeTone, string> = {
  accent: "bg-[--accent-fg]",
  muted: "bg-[--text-muted]",
  success: "bg-[--color-success]",
  danger: "bg-[--color-danger]",
  info: "bg-[--color-info]",
};

export function Badge({
  className,
  tone = "muted",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[--radius-inner] border font-mono font-semibold uppercase",
        sizeClasses[size],
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            dotColors[tone],
          )}
        />
      ) : null}
      {children}
    </span>
  );
}
