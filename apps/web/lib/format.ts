import type { AccessPlan, OrderItemSelectionMode, OrderStatus } from "@wongdigital/db"
import {
  getAccessPlanLabel,
  getProductSelectionMode,
  getServiceReactionLabel,
} from "@wongdigital/db/pricing"

export function formatPrice(value: string) {
  const amount = Number(value)
  const hasFraction = Number.isFinite(amount) && Math.abs(amount - Math.round(amount)) > 0.0001

  return `USDT ${amount.toFixed(hasFraction ? 2 : 0)}`
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(value))
}

export function statusLabel(status: OrderStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function formatAccessPlan(accessPlan: AccessPlan) {
  return getAccessPlanLabel(accessPlan)
}

export function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-PH").format(value)
}

export function formatServiceOption(value: string | null | undefined) {
  return getServiceReactionLabel(value)
}

type OrderItemLike = {
  accessPlan: AccessPlan
  quantity: number
  selectionMode?: OrderItemSelectionMode
  serviceOption?: string | null
  product?: {
    slug: string
    name?: string
  }
}

export function isServiceOrderItem(item: OrderItemLike) {
  if (item.selectionMode) {
    return item.selectionMode === "service"
  }

  if (item.product?.slug) {
    return getProductSelectionMode(item.product.slug) === "service"
  }

  return item.quantity > 1 || Boolean(item.serviceOption)
}

export function formatOrderItemMeta(item: OrderItemLike) {
  if (!isServiceOrderItem(item)) {
    return formatAccessPlan(item.accessPlan)
  }

  const parts: string[] = []

  if (item.serviceOption) {
    parts.push(formatServiceOption(item.serviceOption))
  }

  parts.push(`${formatQuantity(item.quantity)} qty`)

  return parts.join(" · ")
}

export function formatOrderItemSummary(item: OrderItemLike & { product: { name: string; slug: string } }) {
  return `${item.product.name} (${formatOrderItemMeta(item)})`
}

export const orderTimeline: OrderStatus[] = [
  "pending",
  "processing",
  "delivered",
  "completed",
]
