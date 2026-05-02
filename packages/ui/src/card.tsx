import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "./cn";

type CardVariant = "default" | "glass" | "elevated" | "interactive";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

/**
 * Citrus Editorial cards:
 * Flat surfaces, visible hairline borders. No glassmorphism on body cards.
 * `interactive` cards reveal a hard offset accent shadow on hover.
 */
const variantClasses: Record<CardVariant, string> = {
  default: "border border-[--border] bg-[--bg-card]",
  glass: "glass-panel",
  elevated: "border border-[--border] bg-[--bg-card] shadow-[--shadow-md]",
  interactive:
    "border border-[--border] bg-[--bg-card] transition-[border-color,box-shadow,transform] duration-200 ease-out hover:border-[--text-primary] hover:shadow-[4px_4px_0_var(--accent)]",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[--radius-card] transition-[box-shadow,border-color] duration-200",
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2 p-6 pb-0", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-xl font-semibold tracking-tight text-[--text-primary]",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm leading-7 text-[--text-secondary]", className)}
      {...props}
    />
  );
}
