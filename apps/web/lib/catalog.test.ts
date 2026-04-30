import { describe, expect, it } from "vitest"
import type { Product } from "@wongdigital/db"

import {
  normalizeFilter,
  matchesProductFilter,
  isVisibleCatalogProduct,
  getCatalogProducts,
  categoryLabel,
} from "./catalog"

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "test-id",
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

describe("Catalog Utils", () => {
  describe("normalizeFilter", () => {
    it("returns the exact filter when valid", () => {
      expect(normalizeFilter("ai")).toBe("ai")
      expect(normalizeFilter("growth")).toBe("growth")
      expect(normalizeFilter("developer")).toBe("developer")
      expect(normalizeFilter("creative")).toBe("creative")
      expect(normalizeFilter("streaming")).toBe("streaming")
      expect(normalizeFilter("vpn")).toBe("vpn")
      expect(normalizeFilter("all")).toBe("all")
    })

    it("returns 'all' when undefined", () => {
      expect(normalizeFilter(undefined)).toBe("all")
    })

    it("returns 'all' for invalid filter strings", () => {
      expect(normalizeFilter("invalid-filter")).toBe("all")
      expect(normalizeFilter("")).toBe("all")
      expect(normalizeFilter("AI")).toBe("all") // case-sensitive
      expect(normalizeFilter("Growth")).toBe("all")
    })
  })

  describe("matchesProductFilter", () => {
    it("matches 'all' filter for any product", () => {
      expect(matchesProductFilter(createProduct({ category: "ai-photo" }), "all")).toBe(true)
      expect(matchesProductFilter(createProduct({ category: "music" }), "all")).toBe(true)
      expect(matchesProductFilter(createProduct({ category: "facebook-boosting" }), "all")).toBe(true)
    })

    it("matches 'ai' filter for categories starting with 'ai-'", () => {
      expect(matchesProductFilter(createProduct({ category: "ai-photo" }), "ai")).toBe(true)
      expect(matchesProductFilter(createProduct({ category: "ai-assistant" }), "ai")).toBe(true)
      expect(matchesProductFilter(createProduct({ category: "music" }), "ai")).toBe(false)
      expect(matchesProductFilter(createProduct({ category: "design" }), "ai")).toBe(false)
    })

    it("matches 'creative' filter for 'design' and 'video' categories", () => {
      expect(matchesProductFilter(createProduct({ category: "design" }), "creative")).toBe(true)
      expect(matchesProductFilter(createProduct({ category: "video" }), "creative")).toBe(true)
      expect(matchesProductFilter(createProduct({ category: "music" }), "creative")).toBe(false)
    })

    it("matches 'developer' filter for 'developer' and 'github' categories", () => {
      expect(matchesProductFilter(createProduct({ category: "developer" }), "developer")).toBe(true)
      expect(matchesProductFilter(createProduct({ category: "github" }), "developer")).toBe(true)
      expect(matchesProductFilter(createProduct({ category: "music" }), "developer")).toBe(false)
    })

    it("matches 'streaming' filter for only the 'music' and 'video' categories", () => {
      expect(matchesProductFilter(createProduct({ category: "music" }), "streaming")).toBe(true)
      expect(matchesProductFilter(createProduct({ category: "video" }), "streaming")).toBe(true)
      expect(matchesProductFilter(createProduct({ category: "ai-assistant" }), "streaming")).toBe(false)
    })

    it("matches 'growth' filter for 'growth-package' categories", () => {
      expect(matchesProductFilter(createProduct({ category: "growth-package" }), "growth")).toBe(true)
      expect(matchesProductFilter(createProduct({ category: "music" }), "growth")).toBe(false)
    })
  })

  describe("isVisibleCatalogProduct", () => {
    it("returns true for normal products", () => {
      expect(isVisibleCatalogProduct(createProduct({ slug: "chatgpt-pro" }))).toBe(true)
      expect(isVisibleCatalogProduct(createProduct({ slug: "canva" }))).toBe(true)
    })

    it("returns false for hidden product slugs", () => {
      expect(isVisibleCatalogProduct(createProduct({ slug: "facebook-likes" }))).toBe(false)
      expect(isVisibleCatalogProduct(createProduct({ slug: "facebook-shares" }))).toBe(false)
    })
  })


  describe("getCatalogProducts", () => {
    const products = [
      createProduct({ slug: "chatgpt-pro", name: "ChatGPT Pro", category: "ai-assistant" }),
      createProduct({ slug: "canva", name: "Canva", category: "design" }),
      createProduct({ slug: "spotify", name: "Spotify", category: "music" }),
      createProduct({ slug: "facebook-likes", name: "FB Likes", category: "facebook-boosting" }),
      createProduct({ slug: "instagram-followers-no-refill", name: "IG Followers", category: "instagram-boosting" }),
    ]

    it("filters out hidden products", () => {
      const result = getCatalogProducts(products, "all")
      const slugs = result.map((p) => p.slug)
      expect(slugs).not.toContain("facebook-likes")
    })

    it("excludes boosting products from the 'all' filter", () => {
      const result = getCatalogProducts(products, "all")
      const hasBoostingInResult = result.some((p) => p.category.endsWith("-boosting"))
      expect(hasBoostingInResult).toBe(false)
    })

    it("returns only matching products for specific filters", () => {
      const result = getCatalogProducts(products, "streaming")
      expect(result).toHaveLength(1)
      expect(result[0]!.slug).toBe("spotify")
    })

    it("returns growth products for the 'growth' filter", () => {
      const result = getCatalogProducts(createProduct({ slug: "growth-1", name: "Growth 1", category: "growth-package" }) ? [createProduct({ slug: "growth-1", name: "Growth 1", category: "growth-package" })] : products, "growth")
      expect(result.every((p) => p.category === "growth-package")).toBe(true)
    })
  })

  describe("categoryLabel", () => {
    it("returns the mapped label for known categories", () => {
      expect(categoryLabel("ai-photo")).toBe("AI · Photo")
      expect(categoryLabel("ai-assistant")).toBe("AI · Assistant")
      expect(categoryLabel("music")).toBe("Music")
      expect(categoryLabel("design")).toBe("Design")
      expect(categoryLabel("writing")).toBe("Writing")
      expect(categoryLabel("productivity")).toBe("Productivity")
      expect(categoryLabel("video")).toBe("Video")
    })

    it("returns the mapped label for boosting categories", () => {
      expect(categoryLabel("facebook-boosting")).toBe("Facebook · Boosting")
      expect(categoryLabel("instagram-boosting")).toBe("Instagram · Boosting")
      expect(categoryLabel("youtube-boosting")).toBe("YouTube · Boosting")
      expect(categoryLabel("tiktok-boosting")).toBe("TikTok · Boosting")
      expect(categoryLabel("twitter-x-boosting")).toBe("Twitter / X · Boosting")
      expect(categoryLabel("telegram-boosting")).toBe("Telegram · Boosting")
    })

    it("returns the raw category string for unknown categories", () => {
      expect(categoryLabel("unknown-category")).toBe("unknown-category")
    })
  })
})
