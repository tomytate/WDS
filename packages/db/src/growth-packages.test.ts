import { describe, expect, it } from "vitest"
import {
  premiumGrowthPackages,
  botGrowthPackages,
  allInOnePremiumPackages,
  youtubeMonetizationPackages,
  allGrowthPackages,
} from "./growth-packages"

describe("Growth Packages", () => {
  describe("premiumGrowthPackages", () => {
    it("is a non-empty array", () => {
      expect(premiumGrowthPackages.length).toBeGreaterThan(0)
    })

    it("every entry has required fields", () => {
      for (const platform of premiumGrowthPackages) {
        expect(platform.platform).toBeDefined()
        expect(platform.iconUrl).toBeDefined()
        expect(platform.quality).toBe("high-quality")
        expect(platform.packages.length).toBeGreaterThan(0)

        for (const pkg of platform.packages) {
          expect(pkg.id).toBeDefined()
          expect(pkg.slug).toBeDefined()
          expect(pkg.name).toBeDefined()
          expect(pkg.price).toBeGreaterThan(0)
          expect(pkg.tierName).toBeDefined()
        }
      }
    })

    it("all package IDs are unique", () => {
      const ids = premiumGrowthPackages.flatMap((p) => p.packages.map((pkg) => pkg.id))
      expect(new Set(ids).size).toBe(ids.length)
    })

    it("all package slugs are unique", () => {
      const slugs = premiumGrowthPackages.flatMap((p) => p.packages.map((pkg) => pkg.slug))
      expect(new Set(slugs).size).toBe(slugs.length)
    })

    it("prices are ascending within each platform", () => {
      for (const platform of premiumGrowthPackages) {
        for (let i = 1; i < platform.packages.length; i++) {
          expect(platform.packages[i]!.price).toBeGreaterThan(platform.packages[i - 1]!.price)
        }
      }
    })
  })

  describe("botGrowthPackages", () => {
    it("is a non-empty array", () => {
      expect(botGrowthPackages.length).toBeGreaterThan(0)
    })

    it("every entry has quality 'bot'", () => {
      for (const platform of botGrowthPackages) {
        expect(platform.quality).toBe("bot")
      }
    })

    it("all package IDs are unique", () => {
      const ids = botGrowthPackages.flatMap((p) => p.packages.map((pkg) => pkg.id))
      expect(new Set(ids).size).toBe(ids.length)
    })

    it("all package slugs are unique", () => {
      const slugs = botGrowthPackages.flatMap((p) => p.packages.map((pkg) => pkg.slug))
      expect(new Set(slugs).size).toBe(slugs.length)
    })

    it("bot packages are cheaper than premium for same platform", () => {
      for (const botPlatform of botGrowthPackages) {
        const premiumPlatform = premiumGrowthPackages.find(
          (p) => p.platform === botPlatform.platform,
        )
        if (premiumPlatform) {
          const botStarter = botPlatform.packages[0]!.price
          const premiumStarter = premiumPlatform.packages[0]!.price
          expect(botStarter).toBeLessThan(premiumStarter)
        }
      }
    })
  })

  describe("Telegram packages specifically", () => {
    const telegramPremium = premiumGrowthPackages.find((p) => p.platform === "Telegram")
    const telegramBot = botGrowthPackages.find((p) => p.platform === "Telegram")

    it("Telegram premium packages exist", () => {
      expect(telegramPremium).toBeDefined()
      expect(telegramPremium!.packages.length).toBe(6)
    })

    it("Telegram bot packages exist", () => {
      expect(telegramBot).toBeDefined()
      expect(telegramBot!.packages.length).toBe(6)
    })

    it("Telegram premium has correct pricing per user spec", () => {
      const prices = telegramPremium!.packages.map((p) => p.price)
      expect(prices).toEqual([29.99, 69.99, 134.99, 259.99, 499.99, 949.99])
    })

    it("Telegram bot has correct pricing per user spec", () => {
      const prices = telegramBot!.packages.map((p) => p.price)
      expect(prices).toEqual([2.99, 4.99, 9.99, 19.99, 39.99, 79.99])
    })

    it("Telegram premium packages include subscribers and likes (reactions)", () => {
      for (const pkg of telegramPremium!.packages) {
        expect(pkg.subscribers).toBeGreaterThan(0)
        expect(pkg.likes).toBeGreaterThanOrEqual(0)
      }
    })

    it("Telegram bot packages have 0 likes", () => {
      for (const pkg of telegramBot!.packages) {
        expect(pkg.likes).toBe(0)
      }
    })

    it("Telegram premium subscriber counts match spec", () => {
      const subs = telegramPremium!.packages.map((p) => p.subscribers)
      expect(subs).toEqual([1000, 2500, 5000, 10000, 20000, 40000])
    })

    it("Telegram bot subscriber counts match spec", () => {
      const subs = telegramBot!.packages.map((p) => p.subscribers)
      expect(subs).toEqual([1000, 2500, 5000, 10000, 20000, 40000])
    })
  })

  describe("allGrowthPackages combined", () => {
    it("contains all premium and bot packages", () => {
      const totalExpected =
        (typeof youtubeMonetizationPackages !== 'undefined' ? youtubeMonetizationPackages.packages.length : 0) +
        premiumGrowthPackages.reduce((sum, p) => sum + p.packages.length, 0) +
        (typeof allInOnePremiumPackages !== 'undefined' ? allInOnePremiumPackages.reduce((sum, p) => sum + p.packages.length, 0) : 0) +
        botGrowthPackages.reduce((sum, p) => sum + p.packages.length, 0)
      expect(allGrowthPackages.length).toBe(totalExpected)
    })

    it("all slugs are globally unique across premium and bot", () => {
      const slugs = allGrowthPackages.map((pkg) => pkg.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
    })

    it("all IDs are globally unique across premium and bot", () => {
      const ids = allGrowthPackages.map((pkg) => pkg.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it("no package has a zero or negative price", () => {
      for (const pkg of allGrowthPackages) {
        expect(pkg.price).toBeGreaterThan(0)
      }
    })
  })
})
