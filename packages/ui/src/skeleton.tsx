import type { HTMLAttributes } from "react";

import { cn } from "./cn";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-[--radius-inner] bg-[color-mix(in_srgb,var(--border)_60%,transparent)]",
        "animate-[skeleton-pulse_1.8s_ease-in-out_infinite]",
        className,
      )}
      {...props}
    />
  );
}
