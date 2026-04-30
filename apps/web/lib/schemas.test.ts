import { describe, expect, it } from "vitest"
import { baseOrderSchema, orderSchema, trackByCodeSchema, trackByEmailSchema, reviewSchema } from "./schemas"

// ─── baseOrderSchema ──────────────────────────────────────────────
describe("baseOrderSchema", () => {
  const validOrder = {
    items: [{ productId: "abc-123", accessPlan: "one_year" }],
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "",
    tipAmount: "0",
    serviceDetails: "",
    paymentMethod: "qrph",
    paymentReference: "REF12345",
    promoCode: "",
    bundleId: "",
  }

  it("accepts a valid minimal order", () => {
    const result = baseOrderSchema.safeParse(validOrder)
    expect(result.success).toBe(true)
  })

  it("rejects empty items array", () => {
    const result = baseOrderSchema.safeParse({ ...validOrder, items: [] })
    expect(result.success).toBe(false)
  })

  it("rejects missing customerName", () => {
    const result = baseOrderSchema.safeParse({ ...validOrder, customerName: "" })
    expect(result.success).toBe(false)
  })

  it("rejects invalid email", () => {
    const result = baseOrderSchema.safeParse({ ...validOrder, customerEmail: "not-an-email" })
    expect(result.success).toBe(false)
  })

  it("accepts valid PH phone number", () => {
    const result = baseOrderSchema.safeParse({ ...validOrder, customerPhone: "09123456789" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid phone format", () => {
    const result = baseOrderSchema.safeParse({ ...validOrder, customerPhone: "12345" })
    expect(result.success).toBe(false)
  })

  it("accepts all 4 payment methods", () => {
    for (const method of ["qrph", "binance", "alipay", "wallet"]) {
      const result = baseOrderSchema.safeParse({ ...validOrder, paymentMethod: method })
      expect(result.success).toBe(true)
    }
  })

  it("rejects unknown payment method", () => {
    const result = baseOrderSchema.safeParse({ ...validOrder, paymentMethod: "paypal" })
    expect(result.success).toBe(false)
  })

  it("rejects negative tip amounts", () => {
    const result = baseOrderSchema.safeParse({ ...validOrder, tipAmount: "-5" })
    expect(result.success).toBe(false)
  })

  it("rejects tip amounts over 5000", () => {
    const result = baseOrderSchema.safeParse({ ...validOrder, tipAmount: "5001" })
    expect(result.success).toBe(false)
  })

  it("accepts empty string tip (transforms to 0)", () => {
    const result = baseOrderSchema.safeParse({ ...validOrder, tipAmount: "" })
    expect(result.success).toBe(true)
  })

  it("accepts all valid access plans on items", () => {
    const plans = ["one_month", "three_months", "six_months", "one_year", "two_years", "lifetime"]
    for (const plan of plans) {
      const result = baseOrderSchema.safeParse({
        ...validOrder,
        items: [{ productId: "abc-123", accessPlan: plan }],
      })
      expect(result.success).toBe(true)
    }
  })

  it("rejects service details over 1000 chars", () => {
    const result = baseOrderSchema.safeParse({
      ...validOrder,
      serviceDetails: "x".repeat(1001),
    })
    expect(result.success).toBe(false)
  })

  it("rejects target URL over 500 chars", () => {
    const result = baseOrderSchema.safeParse({
      ...validOrder,
      items: [{ productId: "abc-123", targetUrl: "x".repeat(501) }],
    })
    expect(result.success).toBe(false)
  })
})

// ─── orderSchema (with payment reference refinement) ──────────────
describe("orderSchema", () => {
  const validOrder = {
    items: [{ productId: "abc-123", accessPlan: "one_year" }],
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "",
    tipAmount: "0",
    serviceDetails: "",
    paymentMethod: "qrph",
    paymentReference: "REF12345",
    promoCode: "",
    bundleId: "",
  }

  it("requires paymentReference for non-wallet methods", () => {
    const result = orderSchema.safeParse({ ...validOrder, paymentReference: "" })
    expect(result.success).toBe(false)
  })

  it("requires paymentReference to be at least 4 chars for non-wallet", () => {
    const result = orderSchema.safeParse({ ...validOrder, paymentReference: "AB" })
    expect(result.success).toBe(false)
  })

  it("allows empty paymentReference for wallet payments", () => {
    const result = orderSchema.safeParse({
      ...validOrder,
      paymentMethod: "wallet",
      paymentReference: "",
    })
    expect(result.success).toBe(true)
  })

  it("accepts valid 4+ char reference for binance", () => {
    const result = orderSchema.safeParse({
      ...validOrder,
      paymentMethod: "binance",
      paymentReference: "ABCD1234",
    })
    expect(result.success).toBe(true)
  })
})

// ─── trackByCodeSchema ────────────────────────────────────────────
describe("trackByCodeSchema", () => {
  it("accepts valid order codes of 8+ characters", () => {
    const result = trackByCodeSchema.safeParse({ orderCode: "WDS-OP04172026-ABCD" })
    expect(result.success).toBe(true)
  })

  it("transforms the code to uppercase", () => {
    const result = trackByCodeSchema.safeParse({ orderCode: "wds-op04172026-abcd" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.orderCode).toBe("WDS-OP04172026-ABCD")
    }
  })

  it("rejects codes shorter than 8 characters", () => {
    const result = trackByCodeSchema.safeParse({ orderCode: "AB12" })
    expect(result.success).toBe(false)
  })
})

// ─── trackByEmailSchema ──────────────────────────────────────────
describe("trackByEmailSchema", () => {
  it("accepts a valid email", () => {
    const result = trackByEmailSchema.safeParse({ email: "test@example.com" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = trackByEmailSchema.safeParse({ email: "not-an-email" })
    expect(result.success).toBe(false)
  })
})

// ─── reviewSchema ─────────────────────────────────────────────────
describe("reviewSchema", () => {
  const validReview = {
    orderId: "order_123",
    customerName: "Jane",
    customerEmail: "jane@example.com",
    rating: 5,
    content: "Great service!",
  }

  it("accepts a valid review", () => {
    const result = reviewSchema.safeParse(validReview)
    expect(result.success).toBe(true)
  })

  it("rejects rating below 1", () => {
    const result = reviewSchema.safeParse({ ...validReview, rating: 0 })
    expect(result.success).toBe(false)
  })

  it("rejects rating above 5", () => {
    const result = reviewSchema.safeParse({ ...validReview, rating: 6 })
    expect(result.success).toBe(false)
  })

  it("rejects review content over 1000 chars", () => {
    const result = reviewSchema.safeParse({ ...validReview, content: "x".repeat(1001) })
    expect(result.success).toBe(false)
  })

  it("accepts review without optional content", () => {
    const { content: _content, ...noContent } = validReview
    const result = reviewSchema.safeParse(noContent)
    expect(result.success).toBe(true)
  })

  it("requires orderId", () => {
    const result = reviewSchema.safeParse({ ...validReview, orderId: "" })
    expect(result.success).toBe(false)
  })
})
