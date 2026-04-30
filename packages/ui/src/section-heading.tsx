import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

type SectionHeadingProps = HTMLAttributes<HTMLDivElement> & {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  counter?: number;
  as?: "h1" | "h2" | "h3";
};

export function SectionHeading({
  className,
  eyebrow,
  title,
  description,
  counter,
  as: Component = "h2",
  ...props
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl space-y-4", className)} {...props}>
      {eyebrow ? (
        <div className="flex items-center gap-3">
          <span className="accent-bar" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[--accent] sm:text-sm">
            {eyebrow}
            {typeof counter === "number" ? (
              <span className="ml-2.5 rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[--accent]">
                {counter}
              </span>
            ) : null}
          </p>
        </div>
      ) : null}
      <Component className="font-display text-3xl leading-[1.08] tracking-tight text-[--text-primary] break-words sm:text-4xl lg:text-5xl text-balance">
        {title}
      </Component>
      {description ? (
        <p className="text-base leading-relaxed text-[--text-secondary] sm:text-lg sm:leading-8 text-pretty max-w-2xl">
          {description}
        </p>
      ) : null}
    </div>
  );
}
