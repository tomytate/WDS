import type { ReactNode } from "react";

import { cn } from "./cn";

type EmptyStateProps = {
  className?: string;
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({
  className,
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[--accent]">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-xl tracking-tight text-[--text-primary]">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-7 text-[--text-secondary]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
