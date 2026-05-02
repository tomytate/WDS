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
  lg: "h-12 px-6 text-[15px]",
};

/**
 * Citrus Editorial buttons:
 * - accent  → ink button with lime hover (the primary CTA, high contrast)
 * - ghost   → bordered cream/transparent button
 * - surface → solid card surface, subtle
 * - icon    → square 40px icon button
 * - danger  → ink-on-red destructive
 */
const variantClasses: Record<ButtonVariant, string> = {
  accent:
    "border border-[--text-primary] bg-[--text-primary] text-[--bg-base] shadow-[--shadow-sm] hover:bg-[--accent] hover:text-[--accent-fg] hover:border-[--accent] focus-visible:outline-[--text-primary]",
  ghost:
    "border border-[--border-strong] bg-transparent text-[--text-primary] hover:bg-[--text-primary] hover:text-[--bg-base] hover:border-[--text-primary]",
  surface:
    "border border-[--border] bg-[--bg-card] text-[--text-primary] hover:bg-[--bg-surface] hover:border-[--text-primary]",
  icon: "inline-flex h-10 w-10 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-card] text-[--text-primary] transition-colors hover:border-[--text-primary] hover:bg-[--accent] hover:text-[--accent-fg]",
  danger:
    "border border-[--color-danger] bg-[--color-danger] text-white hover:bg-[--color-danger-text] hover:border-[--color-danger-text] focus-visible:outline-[--color-danger]",
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
    "inline-flex items-center justify-center rounded-[--radius-inner] font-semibold tracking-tight transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
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
