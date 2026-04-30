/**
 * Payment Methods Configuration
 *
 * Defines all supported payment methods with their availability rules.
 * Enabled methods are shown at checkout; disabled methods shown as "Coming Soon".
 */

import type { LucideIcon } from "lucide-react"
import { QrCode, Bitcoin, CreditCard, Wallet, Building2 } from "lucide-react"

export type PaymentMethodId = "qrph" | "binance" | "stripe" | "paypal" | "payoneer"

export type PaymentMethodConfig = {
  id: PaymentMethodId
  label: string
  description: string
  Icon: LucideIcon
  enabled: boolean
  availableIn: string[]     // country codes, or ["*"] for global
  requiresReceipt: boolean
  requiresReference: boolean
  badge?: string
  settlementNote?: string
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "qrph",
    label: "QRPH",
    description: "Pay with GCash, Maya, BPI, or any PH QR-enabled bank app.",
    Icon: QrCode,
    enabled: true,
    availableIn: ["PH"],
    requiresReceipt: true,
    requiresReference: true,
    badge: "🇵🇭 PH",
    settlementNote: "Scan the QR code with any Philippine banking app. Upload your receipt after payment.",
  },
  {
    id: "binance",
    label: "Binance/Crypto",
    description: "Pay with USDT, BNB, BTC, or any supported crypto. Available worldwide.",
    Icon: Bitcoin,
    enabled: true,
    availableIn: ["*"],
    requiresReceipt: true,
    requiresReference: true,
    badge: "🌍 Global",
    settlementNote: "Send payment to our Binance Pay ID. Screenshot your transaction and upload below.",
  },
  {
    id: "stripe",
    label: "Card / Apple Pay / Google Pay",
    description: "Visa, Mastercard, Apple Pay, Google Pay. Instant confirmation.",
    Icon: CreditCard,
    enabled: false,
    availableIn: ["*"],
    requiresReceipt: false,
    requiresReference: false,
    badge: "Coming Soon",
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "Pay with your PayPal balance or linked card.",
    Icon: Wallet,
    enabled: false,
    availableIn: ["*"],
    requiresReceipt: false,
    requiresReference: false,
    badge: "Coming Soon",
  },
  {
    id: "payoneer",
    label: "Payoneer",
    description: "Best for freelancers and B2B payments.",
    Icon: Building2,
    enabled: false,
    availableIn: ["*"],
    requiresReceipt: false,
    requiresReference: false,
    badge: "Coming Soon",
  },
]

/** Get payment methods available in a specific country */
export function getAvailablePaymentMethods(countryCode: string): PaymentMethodConfig[] {
  return PAYMENT_METHODS.filter(
    (m) => m.availableIn.includes("*") || m.availableIn.includes(countryCode),
  )
}

/** Get only enabled payment methods for a specific country */
export function getEnabledPaymentMethods(countryCode: string): PaymentMethodConfig[] {
  return getAvailablePaymentMethods(countryCode).filter((m) => m.enabled)
}

/** Get disabled ("Coming Soon") payment methods */
export function getComingSoonPaymentMethods(countryCode: string): PaymentMethodConfig[] {
  return getAvailablePaymentMethods(countryCode).filter((m) => !m.enabled)
}

/** Get config for a specific payment method */
export function getPaymentMethodConfig(id: PaymentMethodId): PaymentMethodConfig | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id)
}

/** Get human-readable label for a payment method ID */
export function getPaymentMethodLabel(id: string): string {
  return PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id
}
