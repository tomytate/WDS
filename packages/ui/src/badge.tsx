import type { HTMLAttributes } from "react";

import { cn } from "./cn";

type BadgeTone = "accent" | "muted" | "success" | "danger" | "info";
type BadgeSize = "sm" | "md";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  size?: BadgeSize;
  dot?: boolean;
};

const toneClasses: Record<BadgeTone, string> = {
  accent:
    "border-[--accent] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[--accent] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  muted:
    "border-[--border] bg-[--bg-card] text-[--text-secondary] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
  success:
    "border-[--color-success,#22c55e] bg-[color-mix(in_srgb,var(--color-success,#22c55e)_12%,transparent)] text-[--color-success,#22c55e] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  danger:
    "border-[color-mix(in_srgb,var(--color-danger)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] text-[--color-danger] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  info: "border-[color-mix(in_srgb,var(--color-info)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[--color-info] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] tracking-[0.2em]",
  md: "px-3 py-1 text-xs tracking-[0.24em]",
};

const dotColors: Record<BadgeTone, string> = {
  accent: "bg-[--accent]",
  muted: "bg-[--text-secondary]",
  success: "bg-[--color-success,#22c55e]",
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
        "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase",
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
            "h-1.5 w-1.5 shrink-0 rounded-full pulse-dot",
            dotColors[tone],
          )}
        />
      ) : null}
      {children}
    </span>
  );
}
