import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "./cn";

type CardVariant = "default" | "glass" | "elevated" | "interactive";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const variantClasses: Record<CardVariant, string> = {
  default:
    "border border-[--border] bg-[color-mix(in_srgb,var(--bg-card)_92%,transparent)] shadow-[--shadow-card] backdrop-blur-sm",
  glass: "glass-panel",
  elevated:
    "border border-[--border] bg-[color-mix(in_srgb,var(--bg-card)_96%,transparent)] shadow-[--shadow-lg]",
  interactive:
    "border border-[--border] bg-[color-mix(in_srgb,var(--bg-card)_92%,transparent)] shadow-[--shadow-card] backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[color-mix(in_srgb,var(--accent)_36%,var(--border))] hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_10%,transparent),0_8px_32px_color-mix(in_srgb,var(--accent)_12%,transparent),0_2px_8px_rgba(0,0,0,0.04)]",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden rounded-[--radius-card] transition-[box-shadow,border-color] duration-300",
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
        "font-display text-xl tracking-tight text-[--text-primary]",
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
