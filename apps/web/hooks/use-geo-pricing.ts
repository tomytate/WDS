"use client"

import { useCallback, useState, useEffect } from "react"
import {
  getCurrencyForCountry,
  formatLocalPrice,
  formatDbPriceAsUsdt,
  dbPriceToUsdt,
  isPhilippines,
  type CurrencyConfig,
} from "@/lib/geo-pricing"
import { getAbsolutePrice } from "@/lib/absolute-pricing"

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match?.[1]
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

type ExchangeRates = Record<string, number>

let cachedRates: ExchangeRates | null = null
let cacheExpiry = 0

async function fetchRates(): Promise<ExchangeRates> {
  const now = Date.now()
  if (cachedRates && now < cacheExpiry) return cachedRates

  try {
    const res = await fetch("/api/exchange-rates", { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error("Rate fetch failed")
    const data = await res.json()
    cachedRates = data.rates as ExchangeRates
    cacheExpiry = now + 60 * 60 * 1000 // 1 hour
    return cachedRates
  } catch {
    // Fallback: return empty — formatLocalPrice will use its own fallback
    return {}
  }
}

/**
 * React hook for live geo-based currency pricing.
 *
 * For PH users:
 *   - `formatPrimaryPrice(dbPrice)` → PHP string (e.g. "₱840") — THE MAJOR PRICE
 *   - `formatSecondaryPrice(dbPrice)` → USDT string (e.g. "USDT 15.00") — minor reference
 *   - `showSecondary` → true
 *
 * For international users:
 *   - `formatPrimaryPrice(dbPrice)` → USDT string (e.g. "USDT 15.00")
 *   - `formatSecondaryPrice(dbPrice)` → null
 *   - `showSecondary` → false
 *
 * Legacy aliases `formatPrice` and `formatUsdtPrice` are preserved for backwards compat.
 */
export function useGeoPricing() {
  const [currency, setCurrency] = useState<CurrencyConfig>(
    getCurrencyForCountry("US")
  )
  const [rates, setRates] = useState<ExchangeRates>({})
  const [isLoading, setIsLoading] = useState(true)
  const [countryCode, setCountryCode] = useState("US")

  useEffect(() => {
    const override = getCookie("user_currency_override")
    const geo = getCookie("geo_country")
    const code = override ?? geo ?? "US"
    setCountryCode(code)
    setCurrency(getCurrencyForCountry(code))

    fetchRates().then((r) => {
      setRates(r)
      setIsLoading(false)
    })
  }, [])

  const setManualCurrency = useCallback((code: string) => {
    setCookie("user_currency_override", code, 30)
    setCountryCode(code)
    setCurrency(getCurrencyForCountry(code))
  }, [])

  const clearOverride = useCallback(() => {
    document.cookie = "user_currency_override=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
    const geo = getCookie("geo_country") ?? "US"
    setCountryCode(geo)
    setCurrency(getCurrencyForCountry(geo))
  }, [])

  const isPhp = isPhilippines(countryCode)

  /**
   * Format a DB price (USDT) into the user's local currency using live rates.
   */
  const formatPrice = useCallback(
    (dbAmount: string | number) => {
      const ratePerUsdt = rates[currency.code] ?? 1
      return formatLocalPrice(
        dbAmount,
        currency.code,
        ratePerUsdt,
        currency.locale,
        currency.decimalPlaces
      )
    },
    [currency, rates]
  )

  /**
   * Always format as USDT.
   */
  const formatUsdtPrice = useCallback(
    (dbAmount: string | number) => formatDbPriceAsUsdt(dbAmount),
    []
  )

  /**
   * Helper to get the correct numeric value for math (e.g. cart totals).
   * Returns PHP amount if in PH, USDT amount otherwise.
   */
  const getPrimaryNumericPrice = useCallback(
    (dbAmount: string | number, slug?: string, accessPlan?: string): number => {
      const abs = slug ? getAbsolutePrice(slug, accessPlan) : null;
      if (isPhp) {
        if (abs && abs.php !== null) return abs.php;
        // Fallback for missing absolute price: use exchange rate 
        return Number(dbAmount) * (rates[currency.code] ?? 1);
      }
      if (abs && abs.usdt !== null) return abs.usdt;
      return Number(dbAmount);
    },
    [isPhp, rates, currency]
  )

  /**
   * Primary price display: PHP for PH users, USDT for international.
   * This is the MAJOR price shown prominently in the UI.
   * Uses absolute hardcoded prices if a valid slug is provided.
   */
  const formatPrimaryPrice = useCallback(
    (dbAmount: string | number, slug?: string, accessPlan?: string) => {
      const abs = slug ? getAbsolutePrice(slug, accessPlan) : null;

      if (isPhp) {
        if (abs && abs.php !== null) {
          return `₱${new Intl.NumberFormat("en-PH").format(abs.php)}`;
        }
        // For non-absolute products and raw totals, use the numeric helper which handles exchange rates
        const num = getPrimaryNumericPrice(dbAmount, slug, accessPlan);
        return `₱${new Intl.NumberFormat("en-PH").format(num)}`;
      }

      if (abs && abs.usdt !== null) {
        return `USDT ${abs.usdt.toFixed(2)}`;
      }
      return formatDbPriceAsUsdt(dbAmount)
    },
    [isPhp, getPrimaryNumericPrice]
  )

  /**
   * Calculates the exact display totals using absolute pricing if available.
   * Returns subtotal, tip, discount, and total in the active primary currency.
   */
  const calculateDisplayTotals = useCallback(
    (
      items: Array<{ unitPrice: string | number; product: { slug: string }; accessPlan?: string }>,
      tipUsdt: string | number = 0,
      discountUsdt: string | number = 0
    ) => {
      const subtotal = items.reduce(
        (sum, item) => sum + getPrimaryNumericPrice(item.unitPrice, item.product.slug, item.accessPlan),
        0
      );
      const tip = getPrimaryNumericPrice(tipUsdt);
      const discount = getPrimaryNumericPrice(discountUsdt);
      const total = Math.max(0, subtotal + tip - discount);
      
      const formatNum = (num: number) => {
        if (isPhp) return `₱${new Intl.NumberFormat("en-PH").format(num)}`;
        return `USDT ${num.toFixed(2)}`;
      };

      return {
        subtotal,
        tip,
        discount,
        total,
        formattedSubtotal: formatNum(subtotal),
        formattedTip: formatNum(tip),
        formattedDiscount: formatNum(discount),
        formattedTotal: formatNum(total),
      };
    },
    [getPrimaryNumericPrice, isPhp]
  )

  /**
   * Secondary price display: USDT reference for PH users, null for international.
   * Shown as a smaller "≈ USDT X.XX" line below the primary price.
   */
  const formatSecondaryPrice = useCallback(
    (dbAmount: string | number, slug?: string, accessPlan?: string): string | null => {
      if (isPhp) {
        const abs = slug ? getAbsolutePrice(slug, accessPlan) : null;
        if (abs && abs.php !== null) {
          return null; // Don't show USDT ≈ reference for absolute-priced items
        }
        return formatDbPriceAsUsdt(dbAmount)
      }
      return null
    },
    [isPhp]
  )

  /**
   * Get USDT numeric amount from a DB price
   */
  const getUsdtAmount = useCallback(
    (dbAmount: string | number) => dbPriceToUsdt(dbAmount),
    []
  )

  return {
    currency,
    rates,
    isLoading,
    // New primary/secondary API — use these for all new UI
    formatPrimaryPrice,
    formatSecondaryPrice,
    getPrimaryNumericPrice,
    calculateDisplayTotals,
    showSecondary: isPhp,
    // Legacy — kept for backwards compat
    formatPrice,
    formatUsdtPrice,
    getUsdtAmount,
    setManualCurrency,
    clearOverride,
    isPhp,
    countryCode,
  }
}
