"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  getOrderById,
  saveProduct,
  saveStoreSettings,
  setProductActive,
  updateOrderStatus,
  createPromoCode,
  updatePromoCode,
  setPromoCodeActive,
  createBundle,
  updateBundle,
  setBundleActive,
  updateReviewStatus,
  deleteReview,
  deleteOrderRecord,
} from "@wongdigital/db/storefront"
import type { OrderStatus, PromoDiscountType } from "@wongdigital/db"

import { requireDashboardAdmin } from "@/lib/dashboard-auth"
import { sendOrderStatusEmail } from "@/lib/email"
import { formatPrice } from "@/lib/format"
import {
  dashboardOrderStatusSchema,
  dashboardProductSchema,
  dashboardProductToggleSchema,
  dashboardStoreSettingsSchema,
  dashboardPromoSchema,
  dashboardPromoToggleSchema,
  dashboardBundleSchema,
  dashboardBundleToggleSchema,
} from "@/lib/dashboard-schemas"

function buildRedirectPath(pathname: string, key: "error" | "success", message: string): string {
  const parts = pathname.split("?")
  const path = parts[0] ?? pathname
  const existingQuery = parts[1] ?? ""
  const params = new URLSearchParams(existingQuery)

  params.delete("error")
  params.delete("success")
  params.set(key, message)

  const nextQuery = params.toString()

  return nextQuery ? `${path}?${nextQuery}` : path
}

function redirectWithMessage(
  returnTo: string,
  key: "error" | "success",
  message: string,
  revalidateTargets: string[] = [],
): never {
  revalidateTargets.forEach((target) => revalidatePath(target))
  redirect(buildRedirectPath(returnTo, key, message))
}

export async function updateOrderStatusAction(formData: FormData) {
  const parsed = dashboardOrderStatusSchema.safeParse({
    orderId: String(formData.get("orderId") ?? ""),
    status: String(formData.get("status") ?? ""),
    returnTo: String(formData.get("returnTo") ?? "/dashboard/orders"),
  })

  if (!parsed.success) {
    redirectWithMessage(
      "/dashboard/orders",
      "error",
      parsed.error.issues[0]?.message ?? "Unable to update the order.",
    )
  }

  const data = parsed.data

  await requireDashboardAdmin(data.returnTo)
  const order = await getOrderById(data.orderId)
  
  if (!order) {
    redirectWithMessage(data.returnTo, "error", "Order not found.")
  }

  await updateOrderStatus(data.orderId, data.status as OrderStatus)

  // Send status email notification (fire and forget)
  sendOrderStatusEmail({
    orderId: order.id,
    orderCode: order.orderCode,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    productName: order.items[0]?.product.name ?? order.product.name,
    status: data.status as "pending" | "processing" | "delivered" | "completed" | "cancelled",
    notes: order.notes,
    items: order.items.map((item: any) => ({
      name: item.product?.name ?? "Product",
      quantity: item.quantity ?? 1,
      price: formatPrice(item.unitPrice ?? "0"),
    })),
    totalPrice: formatPrice(order.totalPrice),
    paymentMethod: order.paymentMethod,
  }).catch((err) => {
    // Only log the error so we don't block the user's dashboard transition
    console.error("[Email Sync Error]", err)
  })

  redirectWithMessage(data.returnTo, "success", "Order status updated.", [
    "/dashboard",
    "/dashboard/orders",
    "/dashboard/customers",
    "/track",
  ])
}

export async function deleteOrderAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "")

  if (!orderId) {
    redirectWithMessage("/dashboard/orders", "error", "Unable to delete the order.")
  }

  await requireDashboardAdmin("/dashboard/orders")
  const order = await getOrderById(orderId)
  
  if (!order) {
    redirectWithMessage("/dashboard/orders", "error", "Order not found.")
  }

  await deleteOrderRecord(orderId)

  redirectWithMessage("/dashboard/orders", "success", "Order permanently deleted.", [
    "/dashboard",
    "/dashboard/orders",
    "/dashboard/customers",
  ])
}

export async function saveProductAction(formData: FormData) {
  const parsed = dashboardProductSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    price: String(formData.get("price") ?? ""),
    category: String(formData.get("category") ?? ""),
    description: String(formData.get("description") ?? ""),
    iconUrl: String(formData.get("iconUrl") ?? ""),
    isActive: String(formData.get("isActive") ?? "true"),
    returnTo: String(formData.get("returnTo") ?? "/dashboard/products"),
  })

  if (!parsed.success) {
    redirectWithMessage(
      "/dashboard/products",
      "error",
      parsed.error.issues[0]?.message ?? "Unable to save the product.",
    )
  }

  const data = parsed.data

  await requireDashboardAdmin(data.returnTo)
  await saveProduct({
    id: data.id,
    name: data.name,
    slug: data.slug,
    price: data.price,
    category: data.category,
    description: data.description,
    iconUrl: data.iconUrl,
    isActive: data.isActive === "true",
  })

  redirectWithMessage(data.returnTo, "success", "Product saved.", [
    "/",
    "/order",
    "/dashboard",
    "/dashboard/products",
  ])
}

export async function toggleProductActiveAction(formData: FormData) {
  const parsed = dashboardProductToggleSchema.safeParse({
    productId: String(formData.get("productId") ?? ""),
    isActive: String(formData.get("isActive") ?? "false"),
    returnTo: String(formData.get("returnTo") ?? "/dashboard/products"),
  })

  if (!parsed.success) {
    redirectWithMessage(
      "/dashboard/products",
      "error",
      parsed.error.issues[0]?.message ?? "Unable to update product status.",
    )
  }

  const data = parsed.data

  await requireDashboardAdmin(data.returnTo)
  await setProductActive(data.productId, data.isActive === "true")

  redirectWithMessage(data.returnTo, "success", "Product status updated.", [
    "/",
    "/order",
    "/dashboard",
    "/dashboard/products",
  ])
}

export async function saveStoreSettingsAction(formData: FormData) {
  const parsed = dashboardStoreSettingsSchema.safeParse({
    storeName: String(formData.get("storeName") ?? ""),
    supportEmail: String(formData.get("supportEmail") ?? ""),
    qrphNumber: String(formData.get("qrphNumber") ?? ""),
    qrphInstructions: String(formData.get("qrphInstructions") ?? ""),
    binancePayId: String(formData.get("binancePayId") ?? ""),
    binanceInstructions: String(formData.get("binanceInstructions") ?? ""),
    returnTo: String(formData.get("returnTo") ?? "/dashboard/settings"),
  })

  if (!parsed.success) {
    redirectWithMessage(
      "/dashboard/settings",
      "error",
      parsed.error.issues[0]?.message ?? "Unable to save store settings.",
    )
  }

  const data = parsed.data

  await requireDashboardAdmin(data.returnTo)
  await saveStoreSettings({
    storeName: data.storeName,
    supportEmail: data.supportEmail,
    qrphNumber: data.qrphNumber ?? "",
    qrphInstructions: data.qrphInstructions ?? "",
    binancePayId: data.binancePayId ?? "",
    binanceInstructions: data.binanceInstructions ?? "",
  })

  redirectWithMessage(data.returnTo, "success", "Store settings updated.", [
    "/order",
    "/dashboard",
    "/dashboard/settings",
  ])
}

export async function savePromoAction(formData: FormData) {
  const parsed = dashboardPromoSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    code: String(formData.get("code") ?? ""),
    discountType: String(formData.get("discountType") ?? "percentage"),
    discountValue: String(formData.get("discountValue") ?? ""),
    minOrderAmount: String(formData.get("minOrderAmount") ?? ""),
    maxDiscountAmount: String(formData.get("maxDiscountAmount") ?? ""),
    maxUses: String(formData.get("maxUses") ?? ""),
    isActive: String(formData.get("isActive") ?? "true"),
    startsAt: String(formData.get("startsAt") ?? new Date().toISOString()),
    expiresAt: String(formData.get("expiresAt") ?? ""),
    returnTo: String(formData.get("returnTo") ?? "/dashboard/promos"),
  })

  // Basic validation check
  if (!parsed.success) {
    return redirectWithMessage(
      "/dashboard/promos",
      "error",
      parsed.error.issues[0]?.message ?? "Unable to save the promo.",
    )
  }

  const data = parsed.data

  await requireDashboardAdmin(data.returnTo)
  
  const minOrderAmount = data.minOrderAmount ? data.minOrderAmount : null
  const maxDiscountAmount = data.maxDiscountAmount ? data.maxDiscountAmount : null
  const maxUses = data.maxUses ? parseInt(data.maxUses, 10) : null
  const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null

  try {
    if (data.id) {
      await updatePromoCode(data.id, {
        code: data.code,
        discountType: data.discountType as PromoDiscountType,
        discountValue: data.discountValue,
        minOrderAmount,
        maxDiscountAmount,
        maxUses,
        isActive: data.isActive === "true",
        startsAt: new Date(data.startsAt),
        expiresAt,
      })
    } else {
      await createPromoCode({
        code: data.code,
        discountType: data.discountType as PromoDiscountType,
        discountValue: data.discountValue,
        minOrderAmount,
        maxDiscountAmount,
        maxUses,
        isActive: data.isActive === "true",
        startsAt: new Date(data.startsAt),
        expiresAt,
      })
    }
  } catch (error) {
    const pgError = error as { message?: string; code?: string }
    if (pgError?.message?.includes("duplicate key value") || pgError?.code === "23505") {
      redirectWithMessage(data.returnTo, "error", "This promo code matches another active code.")
    }

    redirectWithMessage(data.returnTo, "error", "Database error occurred.")
  }

  redirectWithMessage(data.returnTo, "success", "Promo code saved.", [
    "/order",
    "/dashboard/promos",
  ])
}

export async function togglePromoActiveAction(formData: FormData) {
  const parsed = dashboardPromoToggleSchema.safeParse({
    promoId: String(formData.get("promoId") ?? ""),
    isActive: String(formData.get("isActive") ?? "false"),
    returnTo: String(formData.get("returnTo") ?? "/dashboard/promos"),
  })

  if (!parsed.success) {
    redirectWithMessage(
      "/dashboard/promos",
      "error",
      parsed.error.issues[0]?.message ?? "Unable to update promo status.",
    )
  }

  const data = parsed.data

  await requireDashboardAdmin(data.returnTo)
  await setPromoCodeActive(data.promoId, data.isActive === "true")

  redirectWithMessage(data.returnTo, "success", "Promo code status updated.", [
    "/order",
    "/dashboard/promos",
  ])
}

export async function saveBundleAction(formData: FormData) {
  const parsed = dashboardBundleSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    bundlePrice: String(formData.get("bundlePrice") ?? ""),
    originalPrice: String(formData.get("originalPrice") ?? ""),
    iconUrl: String(formData.get("iconUrl") ?? ""),
    isActive: String(formData.get("isActive") ?? "true"),
    items: String(formData.get("items") ?? ""),
    returnTo: String(formData.get("returnTo") ?? "/dashboard/bundles"),
  })

  if (!parsed.success) {
    return redirectWithMessage(
      "/dashboard/bundles",
      "error",
      parsed.error.issues[0]?.message ?? "Unable to save the bundle.",
    )
  }

  const data = parsed.data
  await requireDashboardAdmin(data.returnTo)

  let items: { productId: string; accessPlan: string }[] = []
  try {
    items = JSON.parse(data.items)
  } catch {
    return redirectWithMessage(data.returnTo, "error", "Invalid bundle items.")
  }

  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  try {
    if (data.id) {
      await updateBundle(data.id, {
        name: data.name,
        slug,
        description: data.description,
        bundlePrice: data.bundlePrice,
        originalPrice: data.originalPrice,
        iconUrl: data.iconUrl,
        isActive: data.isActive === "true",
        items,
      })
    } else {
      await createBundle({
        name: data.name,
        slug,
        description: data.description,
        bundlePrice: data.bundlePrice,
        originalPrice: data.originalPrice,
        iconUrl: data.iconUrl,
        isActive: data.isActive === "true",
        items,
      })
    }
  } catch (error) {
    const pgError = error as { message?: string; code?: string }
    if (pgError?.message?.includes("unique constraint") || pgError?.code === "23505") {
      redirectWithMessage(data.returnTo, "error", "Bundle slug must be unique.")
    }
    redirectWithMessage(data.returnTo, "error", "Database error occurred.")
  }

  redirectWithMessage(data.returnTo, "success", "Bundle saved.", [
    "/",
    "/dashboard/bundles",
  ])
}

export async function toggleBundleActiveAction(formData: FormData) {
  const parsed = dashboardBundleToggleSchema.safeParse({
    bundleId: String(formData.get("bundleId") ?? ""),
    isActive: String(formData.get("isActive") ?? "false"),
    returnTo: String(formData.get("returnTo") ?? "/dashboard/bundles"),
  })

  if (!parsed.success) {
    redirectWithMessage(
      "/dashboard/bundles",
      "error",
      parsed.error.issues[0]?.message ?? "Unable to update bundle status.",
    )
  }

  const data = parsed.data
  await requireDashboardAdmin(data.returnTo)
  await setBundleActive(data.bundleId, data.isActive === "true")

  redirectWithMessage(data.returnTo, "success", "Bundle status updated.", [
    "/",
    "/dashboard/bundles",
  ])
}

export async function toggleReviewStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const isApproved = String(formData.get("isApproved") ?? "false") === "true"

  await requireDashboardAdmin("/dashboard/reviews")

  if (id) {
    await updateReviewStatus(id, isApproved)
  }

  redirectWithMessage("/dashboard/reviews", "success", "Review status updated.", ["/dashboard/reviews", "/"])
}

export async function deleteReviewAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  
  await requireDashboardAdmin("/dashboard/reviews")

  if (id) {
    await deleteReview(id)
  }

  redirectWithMessage("/dashboard/reviews", "success", "Review deleted.", ["/dashboard/reviews", "/"])
}

export async function updateBulkOrderStatusAction(formData: FormData) {
  const idsStr = String(formData.get("ids") ?? "")
  const statusStr = String(formData.get("status") ?? "")
  
  if (!idsStr || !statusStr) {
    redirectWithMessage("/dashboard/orders", "error", "Missing order IDs or status.")
  }

  const ids = idsStr.split(",")
  await requireDashboardAdmin("/dashboard/orders")

  // Update statuses and send email notifications in parallel
  await Promise.all(ids.map(async (id) => {
    await updateOrderStatus(id, statusStr as OrderStatus)

    // Fetch order details for email notification
    const order = await getOrderById(id)
    if (order) {
      sendOrderStatusEmail({
        orderId: order.id,
        orderCode: order.orderCode,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        productName: order.items[0]?.product.name ?? order.product.name,
        status: statusStr as "pending" | "processing" | "delivered" | "completed" | "cancelled",
        notes: order.notes,
        items: order.items.map((item: any) => ({
          name: item.product?.name ?? "Product",
          quantity: item.quantity ?? 1,
          price: formatPrice(item.unitPrice ?? "0"),
        })),
        totalPrice: formatPrice(order.totalPrice),
        paymentMethod: order.paymentMethod,
      }).catch((err) => {
        console.error(`[Bulk Email Error] Order ${id}:`, err)
      })
    }
  }))

  redirectWithMessage("/dashboard/orders", "success", `Updated ${ids.length} order${ids.length === 1 ? "" : "s"} to ${statusStr}.`, [
    "/dashboard",
    "/dashboard/orders",
  ])
}
