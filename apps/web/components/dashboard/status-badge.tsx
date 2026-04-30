import type { OrderStatus } from "@wongdigital/db"
import { StatusBadge as BaseStatusBadge, type StatusTone } from "@wongdigital/ui"

/**
 * Order-status adapter on top of the shared `<StatusBadge>` primitive in `@wongdigital/ui`.
 * Mapping is intentionally explicit so it survives any renaming of `OrderStatus` values.
 */
const toneByStatus: Record<OrderStatus, StatusTone> = {
  pending: "accent",
  processing: "info",
  delivered: "success",
  completed: "success",
  cancelled: "danger",
}

const pulseStatuses = new Set<OrderStatus>(["pending", "processing"])

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <BaseStatusBadge tone={toneByStatus[status]} pulse={pulseStatuses.has(status)}>
      {status}
    </BaseStatusBadge>
  )
}
