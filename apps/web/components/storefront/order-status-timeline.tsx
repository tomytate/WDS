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
        <div className="flex items-center gap-3 rounded-2xl border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-3">
          <XCircle size={20} className="shrink-0 text-[--color-danger]" />
          <div>
            <p className="text-sm font-semibold text-[--color-danger]">
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
              <Check size={14} strokeWidth={3} />
            ) : (
              String(index + 1)
            );

          return (
            <div
              className="flex min-w-fit snap-start items-center gap-2"
              key={step}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold ${
                  active
                    ? "border-[--accent] bg-[--accent-tint-medium] text-[--accent]"
                    : complete
                      ? "border-[--accent] bg-[--accent] text-[--accent-fg]"
                      : "border-dashed border-[--border] text-[--text-muted]"
                }`}
              >
                {marker}
              </div>
              <span
                className={`text-sm ${
                  active
                    ? "text-[--accent]"
                    : complete
                      ? "text-[--text-primary]"
                      : "text-[--text-muted]"
                }`}
              >
                {statusLabel(step)}
              </span>
              {index < orderTimeline.length - 1 ? (
                <div className="h-px w-5 bg-[--border] sm:w-12" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
