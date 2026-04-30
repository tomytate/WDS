function normalizePublicUrl(value?: string | null) {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim().replace(/\/+$/, "")

  if (!trimmed) {
    return undefined
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  if (/^(localhost|127(?:\.\d{1,3}){3})(:\d+)?$/i.test(trimmed)) {
    return `http://${trimmed}`
  }

  return `https://${trimmed}`
}

export const siteConfig = {
  name: "Wong Digital",
  shortName: "Wong Digital",
  description:
    "Your trusted marketplace for premium digital subscriptions — ChatGPT Pro, Canva Pro, Spotify Premium, and 100+ social media growth services. Secure payments via QRPH, Binance Pay, and Alipay. Delivered worldwide.",
  url:
    normalizePublicUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizePublicUrl(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizePublicUrl(process.env.NEXT_PUBLIC_VERCEL_URL) ??
    normalizePublicUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizePublicUrl(process.env.VERCEL_URL) ??
    "http://localhost:3000",
  telegramSupportUrl: normalizePublicUrl(process.env.NEXT_PUBLIC_TELEGRAM_SUPPORT_URL),
  facebookSupportUrl: normalizePublicUrl(process.env.NEXT_PUBLIC_FACEBOOK_SUPPORT_URL),
  tagline: "Your Global Digital Store",
}

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/#products", label: "Products" },
  { href: "/order", label: "Order Now" },
  { href: "/track", label: "Track Order" },
  { href: "/account", label: "Account" },
]

export const legalItems = [
  { href: "/legal", label: "Legal" },
  { href: "/legal/terms-of-service", label: "Terms" },
  { href: "/legal/refund-policy", label: "Refunds" },
  { href: "/legal/privacy-policy", label: "Privacy" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
]
