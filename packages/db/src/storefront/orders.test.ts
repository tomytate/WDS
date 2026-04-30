import { describe, expect, it } from "vitest"
import {
  buildOrderItems,
  buildManualProviderState,
} from "./orders"

import type { Product } from "../types"

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod-1",
    name: "Test Product",
    slug: "test-product",
    price: "100.00",
    category: "ai-assistant",
    description: null,
    iconUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Product
}

describe("buildManualProviderState", () => {
  it("returns all provider fields set to null with manual fulfillment", () => {
    const state = buildManualProviderState()
    expect(state.fulfillmentProvider).toBe("manual")
    expect(state.providerServiceId).toBeNull()
    expect(state.providerOrderId).toBeNull()
    expect(state.providerStatus).toBeNull()
    expect(state.providerCharge).toBeNull()
    expect(state.providerCurrency).toBeNull()
    expect(state.providerStartCount).toBeNull()
    expect(state.providerRemains).toBeNull()
    expect(state.providerError).toBeNull()
    expect(state.providerLastCheckedAt).toBeNull()
  })
})

describe("buildOrderItems", () => {
  it("creates subscription line items correctly", () => {
    const product = createProduct({ id: "p1", slug: "chatgpt-pro", price: "10.00" })
    const items = buildOrderItems(
      [{ productId: "p1", accessPlan: "one_year" }],
      [product],
    )
    expect(items).toHaveLength(1)
    expect(items[0]!.selectionMode).toBe("subscription")
    expect(items[0]!.accessPlan).toBe("one_year")
    expect(items[0]!.quantity).toBe(1)
    expect(items[0]!.product.id).toBe("p1")
  })

  it("throws when a product ID is not found", () => {
    expect(() =>
      buildOrderItems(
        [{ productId: "nonexistent" }],
        [],
      ),
    ).toThrow("One or more selected products could not be found")
  })

  it("defaults accessPlan to one_year when not specified", () => {
    const product = createProduct({ id: "p1", slug: "some-sub", price: "20.00" })
    const items = buildOrderItems(
      [{ productId: "p1" }],
      [product],
    )
    expect(items[0]!.accessPlan).toBe("one_year")
  })

  it("builds multiple items for multiple products", () => {
    const p1 = createProduct({ id: "p1", slug: "chatgpt-pro", price: "10.00" })
    const p2 = createProduct({ id: "p2", slug: "google-ai-pro", price: "15.00" })
    const items = buildOrderItems(
      [
        { productId: "p1", accessPlan: "one_year" },
        { productId: "p2", accessPlan: "six_months" },
      ],
      [p1, p2],
    )
    expect(items).toHaveLength(2)
    expect(items[0]!.product.slug).toBe("chatgpt-pro")
    expect(items[1]!.product.slug).toBe("google-ai-pro")
  })

  it("assigns unique line IDs", () => {
    const p1 = createProduct({ id: "p1", slug: "a", price: "10.00" })
    const p2 = createProduct({ id: "p2", slug: "b", price: "10.00" })
    const items = buildOrderItems(
      [{ productId: "p1" }, { productId: "p2" }],
      [p1, p2],
    )
    expect(items[0]!.id).not.toBe(items[1]!.id)
  })

  it("computes unitPrice using getAccessPlanPrice", () => {
    // chatgpt-pro one_year = base * 2
    const product = createProduct({ id: "p1", slug: "chatgpt-pro", price: "10.00" })
    const items = buildOrderItems(
      [{ productId: "p1", accessPlan: "one_year" }],
      [product],
    )
    expect(items[0]!.unitPrice).toBe("20.00")
  })

  it("handles package selection mode for growth packages", () => {
    const product = createProduct({
      id: "p1",
      slug: "tg-bot-1",
      price: "2.99",
      category: "growth-package",
    })
    const items = buildOrderItems(
      [{ productId: "p1" }],
      [product],
    )
    expect(items[0]!.selectionMode).toBe("package")
    expect(items[0]!.unitPrice).toBe("2.99")
  })
})
