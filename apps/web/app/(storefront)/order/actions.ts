"use server"

import { revalidatePath } from "next/cache"

import { createOrderRecord, processWalletPurchase, findProductsByIds } from "@wongdigital/db/storefront"
import { isGrowthPackage } from "@wongdigital/db/pricing"

import type { ActionResult } from "@/lib/actions"
import { sendDiscordOrderAlert } from "@/lib/discord"
import { sendOrderStatusEmail } from "@/lib/email"
import { formatPrice } from "@/lib/format"
import { orderSchema } from "@/lib/schemas"
import { sendTelegramOrderAlert } from "@/lib/telegram"
import {
  encodePrivateReceiptPath,
} from "@/lib/vercel/blob"
import { authorizeOrderSubmission, rollbackReceiptAsset, validateAndUploadReceipt } from "./middleware"
import { getAuthenticatedCustomer } from "@/lib/customer-auth"
import { signOrderToken } from "@/lib/token"

function generateOrderCode(isGrowth: boolean) {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const y = String(d.getFullYear())
  const dateStr = `${m}${day}${y}`

  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  const prefix = isGrowth ? "WDS-GP" : "WDS-OP"

  return `${prefix}${dateStr}-${suffix}`
}

function isOrderCodeConflictError(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  const message = error.message.toLowerCase()

  return (
    message.includes("order_code") ||
    message.includes("orders_order_code") ||
    message.includes("duplicate key") ||
    message.includes("unique constraint")
  )
}

export async function createOrder(
  formData: FormData,
): Promise<ActionResult<{ orderCode: string; token: string }>> {
  const authorization = await authorizeOrderSubmission(formData)

  if (!authorization.success) {
    return authorization
  }

  const parsed = orderSchema.safeParse({
    items: (() => {
      const rawItems = String(formData.get("items") ?? "[]")

      try {
        const parsedItems = JSON.parse(rawItems)

        return Array.isArray(parsedItems) ? parsedItems : []
      } catch {
        return []
      }
    })(),
    customerName: String(formData.get("customerName") ?? ""),
    customerEmail: String(formData.get("customerEmail") ?? ""),
    customerPhone: String(formData.get("customerPhone") ?? ""),
    tipAmount: String(formData.get("tipAmount") ?? "0"),
    serviceDetails: String(formData.get("serviceDetails") ?? ""),
    paymentMethod: String(formData.get("paymentMethod") ?? ""),
    paymentReference: String(formData.get("paymentReference") ?? ""),
    promoCode: formData.get("promoCode") ? String(formData.get("promoCode")) : undefined,
    bundleId: formData.get("bundleId") ? String(formData.get("bundleId")) : undefined,
  })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Unable to validate your order.",
    }
  }

  const isWalletPayment = parsed.data.paymentMethod === "wallet"

  // ─── WALLET PAYMENT PATH ────────────────────────────────────
  if (isWalletPayment) {
    // Wallet payments require an authenticated customer
    const authResult = await getAuthenticatedCustomer()
    if (!authResult) {
      return {
        success: false,
        error: "You must be signed in to pay with your wallet.",
      }
    }

    try {
      const matchedProducts = await findProductsByIds(
        parsed.data.items.map((i) => i.productId)
      )
      const isGrowth = matchedProducts.some((p) => isGrowthPackage(p))

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const orderCode = generateOrderCode(isGrowth)

        try {
          const createdOrder = await createOrderRecord({
            orderCode,
            ...parsed.data,
            customerPhone: parsed.data.customerPhone || undefined,
            promoCode: parsed.data.promoCode || undefined,
            bundleId: parsed.data.bundleId || undefined,
            notes: parsed.data.serviceDetails || undefined,
            paymentReference: `WALLET-${authResult.customer.id.slice(0, 8)}`,
            receiptPath: "wallet://instant-payment",
          })

          // Atomically debit wallet via Postgres RPC
          await processWalletPurchase({
            customerId: authResult.customer.id,
            amount: Number(createdOrder.totalPrice),
            orderCode,
          })

          await Promise.allSettled([
            sendTelegramOrderAlert({ order: createdOrder }),
            sendDiscordOrderAlert({ order: createdOrder, receiptFile: null }),
            sendOrderStatusEmail({
              orderId: createdOrder.id,
              orderCode: createdOrder.orderCode,
              customerEmail: createdOrder.customerEmail,
              customerName: createdOrder.customerName,
              productName: createdOrder.product?.name ?? "Digital Product",
              status: "pending",
              items: createdOrder.items.map((item: any) => ({
                name: item.product?.name ?? "Product",
                quantity: item.quantity ?? 1,
                price: formatPrice(item.unitPrice ?? "0"),
              })),
              totalPrice: formatPrice(createdOrder.totalPrice),
              paymentMethod: createdOrder.paymentMethod,
            }),
          ]).then((results) => {
            for (const result of results) {
              if (result.status === "rejected") {
                console.error("Order notification failed", {
                  error: result.reason,
                  orderCode,
                })
              }
            }
          })

          revalidatePath("/track")
          revalidatePath("/account")

          return {
            success: true,
            data: { orderCode, token: signOrderToken(orderCode) },
          }
        } catch (error) {
          if (isOrderCodeConflictError(error) && attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 50))
            continue
          }

          throw error
        }
      }

      return {
        success: false,
        error: "We could not generate a unique order code. Please try again.",
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while processing your wallet payment.",
      }
    }
  }

  // ─── STANDARD PAYMENT PATH (QR / Binance) ─────────────────
  try {
    const receiptFile = formData.get("receiptFile")
    const receiptValidation = await validateAndUploadReceipt(receiptFile instanceof File ? receiptFile : null)

    if (!receiptValidation.success || !receiptValidation.data) {
      return {
        success: false,
        error: !receiptValidation.success ? receiptValidation.error : "Failed to upload receipt.",
      }
    }

    const uploadedReceipt = receiptValidation.data

    try {
      const matchedProducts = await findProductsByIds(
        parsed.data.items.map((i) => i.productId)
      )
      const isGrowth = matchedProducts.some((p) => isGrowthPackage(p))

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const orderCode = generateOrderCode(isGrowth)

        try {
          const createdOrder = await createOrderRecord({
            orderCode,
            ...parsed.data,
            customerPhone: parsed.data.customerPhone || undefined,
            promoCode: parsed.data.promoCode || undefined,
            bundleId: parsed.data.bundleId || undefined,
            notes: parsed.data.serviceDetails || undefined,
            receiptPath: encodePrivateReceiptPath(uploadedReceipt.pathname),
          })

          const orderReceiptFile = receiptFile instanceof File ? receiptFile : null

          await Promise.allSettled([
            sendTelegramOrderAlert({ order: createdOrder }),
            sendDiscordOrderAlert({ order: createdOrder, receiptFile: orderReceiptFile }),
            sendOrderStatusEmail({
              orderId: createdOrder.id,
              orderCode: createdOrder.orderCode,
              customerEmail: createdOrder.customerEmail,
              customerName: createdOrder.customerName,
              productName: createdOrder.product?.name ?? "Digital Product",
              status: "pending",
              items: createdOrder.items.map((item: any) => ({
                name: item.product?.name ?? "Product",
                quantity: item.quantity ?? 1,
                price: formatPrice(item.unitPrice ?? "0"),
              })),
              totalPrice: formatPrice(createdOrder.totalPrice),
              paymentMethod: createdOrder.paymentMethod,
            }),
          ]).then((results) => {
            for (const result of results) {
              if (result.status === "rejected") {
                console.error("Order notification failed", {
                  error: result.reason,
                  orderCode,
                })
              }
            }
          })

          revalidatePath("/track")

          return {
            success: true,
            data: {
              orderCode,
              token: signOrderToken(orderCode),
            },
          }
        } catch (error) {
          if (isOrderCodeConflictError(error) && attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 50))
            continue
          }

          throw error
        }
      }
    } catch (error) {
      await rollbackReceiptAsset(uploadedReceipt.pathname)
      throw error
    }

    return {
      success: false,
      error: "We could not generate a unique order code. Please try again.",
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the order.",
    }
  }
}
