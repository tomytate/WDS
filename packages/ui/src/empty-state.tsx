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
        "flex flex-col items-center justify-center border border-dashed border-[--border] rounded-[--radius-card] bg-[--bg-card] py-16 px-6 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] text-[--text-primary]">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-lg font-semibold tracking-tight text-[--text-primary]">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[--text-secondary]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
