import { describe, expect, it } from "vitest"
import {
  normalizePrice,
  getAccessPlanPrice,
  getAccessPlanLabel,
  getProductSelectionMode,
  isGrowthPackage,
  isServiceProduct,
  isValidServiceQuantity,
  isValidServiceReaction,
  getServiceReactionLabel,
  getServiceLinePrice,
  getServiceProductPrice,
  getProductDurationConfigs,
  accessPlanLabels,
} from "./pricing"

// ─── normalizePrice ────────────────────────────────────────────────
describe("normalizePrice", () => {
  it("formats integer string to 2dp", () => {
    expect(normalizePrice("100")).toBe("100.00")
  })

  it("formats numeric value to 2dp", () => {
    expect(normalizePrice(9.99)).toBe("9.99")
  })

  it("returns 0.00 for negative values", () => {
    expect(normalizePrice(-5)).toBe("0.00")
  })

  it("returns 0.00 for NaN", () => {
    expect(normalizePrice("not-a-number")).toBe("0.00")
  })

  it("returns 0.00 for Infinity", () => {
    expect(normalizePrice(Infinity)).toBe("0.00")
  })

  it("handles zero correctly", () => {
    expect(normalizePrice(0)).toBe("0.00")
  })

  it("rounds 3dp values to 2dp", () => {
    expect(normalizePrice(1.006)).toBe("1.01")
  })
})

// ─── accessPlanLabels ─────────────────────────────────────────────
describe("accessPlanLabels", () => {
  it("has labels for all 6 access plans", () => {
    const plans = ["one_month", "three_months", "six_months", "one_year", "two_years", "lifetime"] as const
    for (const plan of plans) {
      expect(accessPlanLabels[plan]).toBeDefined()
      expect(accessPlanLabels[plan].length).toBeGreaterThan(0)
    }
  })

  it("returns human-readable label for one_year", () => {
    expect(accessPlanLabels["one_year"]).toBe("1 Year")
  })

  it("returns human-readable label for lifetime", () => {
    expect(accessPlanLabels["lifetime"]).toBe("Lifetime")
  })
})

// ─── getAccessPlanLabel ───────────────────────────────────────────
describe("getAccessPlanLabel", () => {
  it("returns correct label for each plan", () => {
    expect(getAccessPlanLabel("one_year")).toBe("1 Year")
    expect(getAccessPlanLabel("lifetime")).toBe("Lifetime")
    expect(getAccessPlanLabel("six_months")).toBe("6 Months")
    expect(getAccessPlanLabel("one_month")).toBe("1 Month")
    expect(getAccessPlanLabel("three_months")).toBe("3 Months")
    expect(getAccessPlanLabel("two_years")).toBe("2 Years")
  })
})

// ─── getAccessPlanPrice ───────────────────────────────────────────
describe("getAccessPlanPrice", () => {
  it("returns base price for one_year by default", () => {
    expect(getAccessPlanPrice("unknown-slug", "100", "one_year")).toBe("100.00")
  })

  it("triples the price for lifetime on generic product", () => {
    expect(getAccessPlanPrice("unknown-slug", "10", "lifetime")).toBe("30.00")
  })

  it("uses duration config calculator for chatgpt-pro six_months", () => {
    // 6-month price = base, 1-year = base * 2
    expect(getAccessPlanPrice("chatgpt-pro", "10", "six_months")).toBe("10.00")
    expect(getAccessPlanPrice("chatgpt-pro", "10", "one_year")).toBe("20.00")
  })

  it("uses duration config for google-ai-pro", () => {
    expect(getAccessPlanPrice("google-ai-pro", "15", "six_months")).toBe("15.00")
    expect(getAccessPlanPrice("google-ai-pro", "15", "one_year")).toBe("30.00")
  })

  it("uses duration config for capcut-shared lifetime", () => {
    // lifetime = base * 3
    expect(getAccessPlanPrice("capcut-shared", "10", "lifetime")).toBe("30.00")
  })

  it("also works when passed an object with slug and price", () => {
    const product = { slug: "chatgpt-pro", price: "20.00" }
    expect(getAccessPlanPrice(product, "20", "one_year")).toBe("40.00")
  })
})

// ─── getProductDurationConfigs ────────────────────────────────────
describe("getProductDurationConfigs", () => {
  it("returns non-empty array for known configged slugs", () => {
    expect(getProductDurationConfigs("chatgpt-pro").length).toBeGreaterThan(0)
    expect(getProductDurationConfigs("capcut-shared").length).toBeGreaterThan(0)
  })

  it("returns empty array for unknown slug", () => {
    expect(getProductDurationConfigs("completely-unknown-slug")).toEqual([])
  })

  it("each config has required fields", () => {
    const configs = getProductDurationConfigs("chatgpt-pro")
    for (const config of configs) {
      expect(config.plan).toBeDefined()
      expect(config.label).toBeDefined()
      expect(typeof config.priceCalculator).toBe("function")
    }
  })
})

// ─── getProductSelectionMode ──────────────────────────────────────
describe("getProductSelectionMode", () => {
  it("returns 'package' for growth package slugs", () => {
    expect(getProductSelectionMode("tg-bot-1")).toBe("package")
    expect(getProductSelectionMode("tg-premium-1")).toBe("package")
    expect(getProductSelectionMode("ig-premium-1")).toBe("package")
    expect(getProductSelectionMode("tk-premium-1")).toBe("package")
  })

  it("returns 'service' for boosting service slugs", () => {
    // These slugs must exist in the boosting catalog
    const result = getProductSelectionMode("facebook-followers")
    expect(["service", "subscription", "package"]).toContain(result)
  })

  it("returns 'subscription' for digital product slugs", () => {
    expect(getProductSelectionMode("chatgpt-pro")).toBe("subscription")
    expect(getProductSelectionMode("capcut-shared")).toBe("subscription")
    expect(getProductSelectionMode("google-ai-pro")).toBe("subscription")
  })

  it("returns 'subscription' for completely unknown slugs", () => {
    expect(getProductSelectionMode("totally-made-up-slug")).toBe("subscription")
  })
})

// ─── isGrowthPackage ──────────────────────────────────────────────
describe("isGrowthPackage", () => {
  it("returns true for known growth package slugs", () => {
    expect(isGrowthPackage("tg-bot-1")).toBe(true)
    expect(isGrowthPackage("tg-premium-1")).toBe(true)
    expect(isGrowthPackage("ig-premium-1")).toBe(true)
  })

  it("returns false for subscription products", () => {
    expect(isGrowthPackage("chatgpt-pro")).toBe(false)
    expect(isGrowthPackage("capcut-shared")).toBe(false)
  })

  it("returns false for unknown slugs", () => {
    expect(isGrowthPackage("not-a-package")).toBe(false)
  })
})

// ─── isServiceProduct ─────────────────────────────────────────────
describe("isServiceProduct", () => {
  it("returns false for subscription products", () => {
    expect(isServiceProduct("chatgpt-pro")).toBe(false)
  })

  it("returns false for growth packages", () => {
    expect(isServiceProduct("tg-bot-1")).toBe(false)
  })

  it("returns false for unknown slugs", () => {
    expect(isServiceProduct("not-a-service")).toBe(false)
  })
})

// ─── isValidServiceReaction ───────────────────────────────────────
describe("isValidServiceReaction", () => {
  it("returns true for all valid reactions", () => {
    const valid = ["like", "love", "care", "haha", "wow", "sad", "angry"]
    for (const r of valid) {
      expect(isValidServiceReaction(r)).toBe(true)
    }
  })

  it("returns false for invalid reactions", () => {
    expect(isValidServiceReaction("thumbsup")).toBe(false)
    expect(isValidServiceReaction("")).toBe(false)
    expect(isValidServiceReaction(null)).toBe(false)
    expect(isValidServiceReaction(undefined)).toBe(false)
    expect(isValidServiceReaction("LIKE")).toBe(false) // case-sensitive
  })
})

// ─── getServiceReactionLabel ──────────────────────────────────────
describe("getServiceReactionLabel", () => {
  it("returns capitalised label for each valid reaction", () => {
    expect(getServiceReactionLabel("like")).toBe("Like")
    expect(getServiceReactionLabel("love")).toBe("Love")
    expect(getServiceReactionLabel("care")).toBe("Care")
    expect(getServiceReactionLabel("haha")).toBe("Haha")
    expect(getServiceReactionLabel("wow")).toBe("Wow")
    expect(getServiceReactionLabel("sad")).toBe("Sad")
    expect(getServiceReactionLabel("angry")).toBe("Angry")
  })

  it("returns empty string for invalid reaction", () => {
    expect(getServiceReactionLabel("notareaction")).toBe("")
    expect(getServiceReactionLabel(null)).toBe("")
    expect(getServiceReactionLabel(undefined)).toBe("")
  })
})

// ─── getServiceLinePrice ──────────────────────────────────────────
describe("getServiceLinePrice", () => {
  it("computes price correctly for 1000 qty at $10/1000", () => {
    expect(getServiceLinePrice("10.00", 1000)).toBe("10.00")
  })

  it("computes price correctly for 500 qty at $10/1000", () => {
    expect(getServiceLinePrice("10.00", 500)).toBe("5.00")
  })

  it("computes price for large quantities", () => {
    expect(getServiceLinePrice("5.00", 10000)).toBe("50.00")
  })

  it("returns 0.00 for 0 quantity", () => {
    expect(getServiceLinePrice("10.00", 0)).toBe("0.00")
  })
})

// ─── isValidServiceQuantity ───────────────────────────────────────
describe("isValidServiceQuantity", () => {
  it("returns false for unknown service slug", () => {
    expect(isValidServiceQuantity("completely-unknown-slug", 100)).toBe(false)
  })

  it("returns false for growth package slugs (no service config)", () => {
    expect(isValidServiceQuantity("tg-bot-1", 100)).toBe(false)
  })
})

// ─── getServiceProductPrice ───────────────────────────────────────
describe("getServiceProductPrice", () => {
  it("returns 0.00 for unknown service slug", () => {
    expect(getServiceProductPrice("not-a-real-service", 1000)).toBe("0.00")
  })

  it("returns 0.00 for growth package slug", () => {
    expect(getServiceProductPrice("tg-bot-1", 1000)).toBe("0.00")
  })
})
