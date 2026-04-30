import { describe, expect, it } from "vitest"
import {
  formatPrice,
  formatDate,
  formatQuantity,
  statusLabel,
  orderTimeline,
  isServiceOrderItem,
  formatOrderItemMeta,
  formatOrderItemSummary,
} from "./format"

describe("Format Utilities", () => {
  describe("formatPrice", () => {
    it("formats a whole number as USDT without decimals", () => {
      expect(formatPrice("500")).toBe("USDT 500")
    })

    it("formats a fractional amount with two decimal places", () => {
      expect(formatPrice("199.99")).toBe("USDT 199.99")
    })

    it("formats zero as USDT 0", () => {
      expect(formatPrice("0")).toBe("USDT 0")
    })

    it("formats large numbers without thousand separators", () => {
      expect(formatPrice("1500")).toBe("USDT 1500")
      expect(formatPrice("12999.50")).toBe("USDT 12999.50")
    })

    it("drops trailing zeros for whole-number prices", () => {
      expect(formatPrice("349.00")).toBe("USDT 349")
    })

    it("handles NaN input without throwing", () => {
      expect(() => formatPrice("abc")).not.toThrow()
    })
  })

  describe("formatDate", () => {
    it("formats a Date object to long format", () => {
      const result = formatDate(new Date("2025-01-15T12:00:00Z"))
      expect(result).toBe("January 15, 2025")
    })

    it("formats a date string to long format", () => {
      const result = formatDate("2024-12-25T00:00:00Z")
      expect(result).toBe("December 25, 2024")
    })

    it("formats a date near year boundary (respects locale timezone)", () => {
      // UTC+8 (PH): 2025-12-31T23:59:59Z becomes January 1, 2026
      const result = formatDate("2025-12-31T23:59:59Z")
      expect(result).toBe("January 1, 2026")
    })
  })

  describe("formatQuantity", () => {
    it("formats a number with thousand separators", () => {
      expect(formatQuantity(1000)).toBe("1,000")
      expect(formatQuantity(50000)).toBe("50,000")
    })

    it("formats small numbers without separators", () => {
      expect(formatQuantity(50)).toBe("50")
      expect(formatQuantity(999)).toBe("999")
    })

    it("formats zero", () => {
      expect(formatQuantity(0)).toBe("0")
    })
  })

  describe("statusLabel", () => {
    it("capitalizes the first letter of each status", () => {
      expect(statusLabel("pending")).toBe("Pending")
      expect(statusLabel("processing")).toBe("Processing")
      expect(statusLabel("delivered")).toBe("Delivered")
      expect(statusLabel("completed")).toBe("Completed")
      expect(statusLabel("cancelled")).toBe("Cancelled")
    })
  })

  describe("orderTimeline", () => {
    it("contains exactly four statuses in the correct lifecycle order", () => {
      expect(orderTimeline).toEqual(["pending", "processing", "delivered", "completed"])
    })

    it("does not include cancelled (it's a terminal state, not part of the timeline)", () => {
      expect(orderTimeline).not.toContain("cancelled")
    })
  })

  describe("isServiceOrderItem", () => {
    it("returns true when selectionMode is 'service'", () => {
      expect(
        isServiceOrderItem({
          selectionMode: "service",
          accessPlan: "one_year",
          quantity: 100,
        }),
      ).toBe(true)
    })

    it("returns false when selectionMode is 'subscription'", () => {
      expect(
        isServiceOrderItem({
          selectionMode: "subscription",
          accessPlan: "one_year",
          quantity: 1,
        }),
      ).toBe(false)
    })

    it("returns true for items with quantity > 1 and no selectionMode", () => {
      expect(
        isServiceOrderItem({
          accessPlan: "one_year",
          quantity: 500,
        }),
      ).toBe(true)
    })

    it("returns true for items with a serviceOption set", () => {
      expect(
        isServiceOrderItem({
          accessPlan: "one_year",
          quantity: 1,
          serviceOption: "like",
        }),
      ).toBe(true)
    })

    it("returns false for subscription-like items with quantity 1 and no serviceOption", () => {
      expect(
        isServiceOrderItem({
          accessPlan: "one_year",
          quantity: 1,
        }),
      ).toBe(false)
    })
  })

  describe("formatOrderItemMeta", () => {
    it("returns the access plan label for subscription items", () => {
      const result = formatOrderItemMeta({
        selectionMode: "subscription",
        accessPlan: "one_year",
        quantity: 1,
      })
      expect(result).toBe("1 Year")
    })

    it("returns the lifetime label for lifetime plan", () => {
      const result = formatOrderItemMeta({
        selectionMode: "subscription",
        accessPlan: "lifetime",
        quantity: 1,
      })
      expect(result).toBe("Lifetime")
    })

    it("includes formatted quantity for service items", () => {
      const result = formatOrderItemMeta({
        selectionMode: "service",
        accessPlan: "one_year",
        quantity: 500,
      })
      expect(result).toContain("500")
      expect(result).toContain("qty")
    })

    it("includes service option label when provided", () => {
      const result = formatOrderItemMeta({
        selectionMode: "service",
        accessPlan: "one_year",
        quantity: 1000,
        serviceOption: "like",
      })
      expect(result).toContain("1,000 qty")
    })
  })

  describe("formatOrderItemSummary", () => {
    it("combines product name with order item meta", () => {
      const result = formatOrderItemSummary({
        product: { name: "ChatGPT Pro", slug: "chatgpt-pro" },
        selectionMode: "subscription",
        accessPlan: "one_year",
        quantity: 1,
      })
      expect(result).toBe("ChatGPT Pro (1 Year)")
    })

    it("includes quantity for service products", () => {
      const result = formatOrderItemSummary({
        product: { name: "IG Followers", slug: "instagram-followers-no-refill" },
        selectionMode: "service",
        accessPlan: "one_year",
        quantity: 1000,
      })
      expect(result).toContain("IG Followers")
      expect(result).toContain("1,000 qty")
    })
  })
})
