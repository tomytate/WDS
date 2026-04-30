import type { Product } from "@wongdigital/db"

export const productFilters = [
  { value: "all", label: "All" },
  { value: "ai", label: "AI Tools" },
  { value: "developer", label: "Developer" },
  { value: "creative", label: "Creative" },
  { value: "streaming", label: "Streaming" },
  { value: "vpn", label: "VPN" },
  { value: "growth", label: "Growth Packages" },
] as const

export type ProductFilter = (typeof productFilters)[number]["value"]

const hiddenStorefrontProductSlugs = new Set([
  "facebook-likes",
  "facebook-shares",
  "super-grok-6m",
])

export function normalizeFilter(value?: string): ProductFilter {
  return productFilters.some((filter) => filter.value === value)
    ? (value as ProductFilter)
    : "all"
}

export function matchesProductFilter(product: Product, filter: ProductFilter) {
  if (filter === "all") {
    return true
  }

  if (filter === "ai") {
    return product.category.startsWith("ai-")
  }

  if (filter === "developer") {
    return ["developer", "github"].includes(product.category)
  }

  if (filter === "creative") {
    return ["design", "video"].includes(product.category)
  }

  if (filter === "streaming") {
    return ["music", "video"].includes(product.category)
  }

  if (filter === "vpn") {
    return product.category === "vpn"
  }

  if (filter === "growth") {
    return product.category === "growth-package"
  }

  return true
}

export function isVisibleCatalogProduct(product: Product) {
  return !hiddenStorefrontProductSlugs.has(product.slug)
}

export function getCatalogProducts(products: Product[], filter: ProductFilter) {
  const visibleProducts = products.filter(isVisibleCatalogProduct)

  if (filter === "all") {
    // Show all digital (non-boosting, non-growth-package) products
    return visibleProducts.filter(
      (product) =>
        !product.category.endsWith("-boosting") &&
        product.category !== "growth-package",
    )
  }

  if (filter === "growth") {
    return visibleProducts.filter((product) =>
      matchesProductFilter(product, filter),
    )
  }

  return visibleProducts.filter((product) =>
    matchesProductFilter(product, filter),
  )
}

export function categoryLabel(category: Product["category"]) {
  const labels: Record<string, string> = {
    "ai-photo": "AI · Photo",
    "ai-assistant": "AI · Assistant",
    writing: "Writing",
    productivity: "Productivity",
    music: "Music",
    video: "Video",
    design: "Design",
    streaming: "Streaming",
    developer: "Developer",
    vpn: "VPN",
    "growth-package": "Growth Package",
    "facebook-boosting": "Facebook · Boosting",
    "instagram-boosting": "Instagram · Boosting",
    "telegram-boosting": "Telegram · Boosting",
    "tiktok-boosting": "TikTok · Boosting",
    "twitter-x-boosting": "Twitter / X · Boosting",
    "youtube-boosting": "YouTube · Boosting",
  }

  return labels[category] ?? category
}
