import { Check, XCircle } from "lucide-react";
import type { OrderStatus } from "@wongdigital/db";

import { orderTimeline, statusLabel } from "@/lib/format";

type OrderStatusTimelineProps = {
  status: OrderStatus;
};

export function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  const isCancelled = status === "cancelled";
  const currentIndex = orderTimeline.indexOf(status);

  if (isCancelled) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-[--radius-inner] border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-3">
          <XCircle size={16} className="shrink-0 mt-0.5 text-[--color-danger-text]" />
          <div>
            <p className="text-sm font-semibold text-[--color-danger-text]">
              Order Cancelled
            </p>
            <p className="text-xs text-[--text-secondary]">
              This order has been cancelled and will not be processed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 snap-x snap-mandatory [mask-image:linear-gradient(to_right,transparent,black_8px,black_calc(100%-8px),transparent)]">
        {orderTimeline.map((step, index) => {
          const complete = currentIndex >= index;
          const active = currentIndex === index;
          const marker =
            complete && !active ? (
              <Check size={12} strokeWidth={2.5} />
            ) : (
              <span className="font-mono text-[11px]">
                {String(index + 1).padStart(2, "0")}
              </span>
            );

          return (
            <div
              className="flex min-w-fit snap-start items-center gap-2"
              key={step}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-[--radius-inner] border text-xs font-semibold transition-colors ${
                  active
                    ? "border-[--text-primary] bg-[--accent] text-[--accent-fg]"
                    : complete
                      ? "border-[--text-primary] bg-[--text-primary] text-[--bg-base]"
                      : "border-dashed border-[--border] text-[--text-muted]"
                }`}
              >
                {marker}
              </div>
              <span
                className={`text-sm tracking-tight ${
                  active
                    ? "text-[--text-primary] font-semibold"
                    : complete
                      ? "text-[--text-primary]"
                      : "text-[--text-muted]"
                }`}
              >
                {statusLabel(step)}
              </span>
              {index < orderTimeline.length - 1 ? (
                <div className="h-px w-5 bg-[--border] sm:w-10" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
