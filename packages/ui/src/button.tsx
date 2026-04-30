import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

type ButtonVariant = "accent" | "ghost" | "surface" | "icon" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const variantClasses: Record<ButtonVariant, string> = {
  accent:
    "border border-[--accent] bg-[--accent] text-[--accent-fg] shadow-[0_8px_24px_color-mix(in_srgb,var(--accent)_20%,transparent),0_2px_8px_color-mix(in_srgb,var(--accent)_12%,transparent)] hover:bg-[--accent-hover] hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--accent)_24%,transparent),0_4px_12px_color-mix(in_srgb,var(--accent)_16%,transparent)] focus-visible:outline-[--accent]",
  ghost:
    "border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_42%,transparent)] text-[--text-primary] hover:border-[--accent] hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] hover:text-[--accent]",
  surface:
    "border border-[--border] bg-[--bg-card] text-[--text-primary] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:bg-[--bg-surface]",
  icon: "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[--border] bg-[--bg-card] text-[--text-primary] transition-colors hover:border-[--accent] hover:text-[--accent]",
  danger:
    "border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-[--color-danger] hover:bg-[--color-danger] hover:text-[--accent-fg] focus-visible:outline-[--color-danger]",
};

export function buttonStyles({
  className,
  size = "md",
  variant = "accent",
}: {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-medium tracking-[0.01em] transition-[transform,background-color,border-color,color,box-shadow] duration-200 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
    variant !== "icon" && sizeClasses[size],
    variantClasses[variant],
    className,
  );
}

export function Button({
  className,
  size = "md",
  variant = "accent",
  type = "button",
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ className, size, variant })}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading ? (
        <svg
          aria-hidden="true"
          className="mr-2 h-4 w-4 animate-spin"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8"
            strokeLinecap="round"
          />
        </svg>
      ) : leftIcon ? (
        <span className="mr-2 inline-flex shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon ? (
        <span className="ml-2 inline-flex shrink-0">{rightIcon}</span>
      ) : null}
    </button>
  );
}
