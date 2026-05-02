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
    <div className={cn("max-w-3xl", className)} {...props}>
      {eyebrow ? (
        <div className="section-rule mb-5">
          <span>{eyebrow}</span>
          {typeof counter === "number" ? (
            <span className="ml-1 inline-flex items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-card] px-1.5 py-0.5 font-mono text-[10px] text-[--text-primary]">
              {counter}
            </span>
          ) : null}
        </div>
      ) : null}
      <Component className="font-display text-[clamp(1.875rem,4.5vw,3rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-[--text-primary] text-balance">
        {title}
      </Component>
      {description ? (
        <p className="mt-4 text-[15px] leading-relaxed text-[--text-secondary] text-pretty max-w-2xl sm:text-base sm:leading-7">
          {description}
        </p>
      ) : null}
    </div>
  );
}
