"use server"

import {
  lookupOrdersByCode,
  lookupOrdersByEmail,
} from "@wongdigital/db/storefront"
import type { AccessPlan } from "@wongdigital/db"

import type { ActionResult } from "@/lib/actions"
import { trackByCodeSchema, trackByEmailSchema } from "@/lib/schemas"

type LookupInput =
  | {
      mode: "code"
      value: string
    }
  | {
      mode: "email"
      value: string
    }

type LookupPayload = {
  orders: Array<{
    id: string
    orderCode: string
    status: "pending" | "processing" | "delivered" | "completed" | "cancelled"
    createdAt: string
    notes: string | null
    paymentMethod: string
    tipAmount: string
    discountAmount: string
    product: {
      name: string
      price: string
      iconUrl: string | null
    }
    items: Array<{
      id: string
      name: string
      iconUrl: string | null
      selectionMode: "subscription" | "service" | "package" | "addon"
      fulfillmentProvider: "manual"
      accessPlan: AccessPlan
      quantity: number
      serviceOption: string | null
      unitPrice: string
      providerServiceId: string | null
      providerOrderId: string | null
      providerStatus: string | null
      providerCharge: string | null
      providerCurrency: string | null
      providerStartCount: string | null
      providerRemains: string | null
      providerError: string | null
      providerLastCheckedAt: string | null
      product: {
        slug: string
      }
    }>
    products: Array<{
      id: string
      name: string
      price: string
      iconUrl: string | null
    }>
    subtotalPrice: string
    totalPrice: string
  }>
}

export async function lookupOrders(
  raw: LookupInput,
): Promise<ActionResult<LookupPayload>> {
  try {
    const records =
      raw.mode === "code"
        ? await lookupOrdersByCode(trackByCodeSchema.parse({ orderCode: raw.value }).orderCode)
        : await lookupOrdersByEmail(trackByEmailSchema.parse({ email: raw.value }).email)

    if (records.length === 0) {
      return {
        success: false,
        error:
          raw.mode === "code"
            ? "No order was found for that code."
            : "No orders were found for that email address.",
      }
    }

    const finalRecords = records

    return {
      success: true,
      data: {
        orders: finalRecords.map((record) => ({
          id: record.id,
          orderCode: record.orderCode,
          status: record.status,
          createdAt: record.createdAt.toISOString(),
          notes: record.notes,
          paymentMethod: record.paymentMethod,
          tipAmount: record.tipAmount,
          discountAmount: record.discountAmount,
          product: {
            name: record.product.name,
            price: record.product.price,
            iconUrl: record.product.iconUrl,
          },
          items: record.items.map((item) => ({
            id: item.id,
            name: item.product.name,
            iconUrl: item.product.iconUrl,
            selectionMode: item.selectionMode,
            fulfillmentProvider: item.fulfillmentProvider,
            accessPlan: item.accessPlan,
            quantity: item.quantity,
            serviceOption: item.serviceOption,
            unitPrice: item.unitPrice,
            providerServiceId: item.providerServiceId,
            providerOrderId: item.providerOrderId,
            providerStatus: item.providerStatus,
            providerCharge: item.providerCharge,
            providerCurrency: item.providerCurrency,
            providerStartCount: item.providerStartCount,
            providerRemains: item.providerRemains,
            providerError: item.providerError,
            providerLastCheckedAt: item.providerLastCheckedAt
              ? item.providerLastCheckedAt.toISOString()
              : null,
            product: {
              slug: item.product.slug,
            },
          })),
          products: record.products.map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            iconUrl: product.iconUrl,
          })),
          subtotalPrice: record.subtotalPrice,
          totalPrice: record.totalPrice,
        })),
      },
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "We couldn't check your order right now.",
    }
  }
}
