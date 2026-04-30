/**
 * Geo-Based Pricing — USDT as universal base currency
 *
 * Products are natively stored in USDT in the DB.
 * USDT → Local currency: live rates fetched from /api/exchange-rates
 */

export type CurrencyConfig = {
  code: string
  symbol: string
  flag: string
  locale: string
  decimalPlaces: number
}

/** DB prices are already in USDT */
export function dbPriceToUsdt(dbAmount: string | number): number {
  return Number(dbAmount)
}

/** USDT currency config for displaying crypto prices */
export const USDT_CURRENCY: CurrencyConfig = {
  code: "USDT",
  symbol: "USDT ",
  flag: "⚡",
  locale: "en-US",
  decimalPlaces: 2,
}

/** Format a USDT amount */
export function formatUsdt(usdtAmount: number): string {
  return `USDT ${usdtAmount.toFixed(2)}`
}

/** Format a DB price as USDT */
export function formatDbPriceAsUsdt(dbAmount: string | number): string {
  return formatUsdt(dbPriceToUsdt(dbAmount))
}

/** Format a local currency price given a live rate (USDT per 1 unit of local currency) */
export function formatLocalPrice(
  dbAmount: string | number,
  currencyCode: string,
  ratePerUsdt: number, // how many local currency units = 1 USDT
  locale: string,
  decimalPlaces: number
): string {
  const usdt = dbPriceToUsdt(dbAmount)
  const localAmount = usdt * ratePerUsdt

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(localAmount)
  } catch {
    return `${localAmount.toFixed(decimalPlaces)} ${currencyCode}`
  }
}

/** Map of country code → currency config */
export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyConfig> = {
  // Southeast Asia
  PH: { code: "PHP", symbol: "₱", flag: "🇵🇭", locale: "en-PH", decimalPlaces: 0 },
  SG: { code: "SGD", symbol: "S$", flag: "🇸🇬", locale: "en-SG", decimalPlaces: 2 },
  MY: { code: "MYR", symbol: "RM", flag: "🇲🇾", locale: "ms-MY", decimalPlaces: 2 },
  ID: { code: "IDR", symbol: "Rp", flag: "🇮🇩", locale: "id-ID", decimalPlaces: 0 },
  TH: { code: "THB", symbol: "฿", flag: "🇹🇭", locale: "th-TH", decimalPlaces: 0 },
  VN: { code: "VND", symbol: "₫", flag: "🇻🇳", locale: "vi-VN", decimalPlaces: 0 },
  MM: { code: "MMK", symbol: "K", flag: "🇲🇲", locale: "my-MM", decimalPlaces: 0 },
  KH: { code: "KHR", symbol: "៛", flag: "🇰🇭", locale: "km-KH", decimalPlaces: 0 },
  BN: { code: "BND", symbol: "B$", flag: "🇧🇳", locale: "ms-BN", decimalPlaces: 2 },
  LA: { code: "LAK", symbol: "₭", flag: "🇱🇦", locale: "lo-LA", decimalPlaces: 0 },
  TL: { code: "USD", symbol: "$", flag: "🇹🇱", locale: "en-US", decimalPlaces: 2 },
  // East Asia
  JP: { code: "JPY", symbol: "¥", flag: "🇯🇵", locale: "ja-JP", decimalPlaces: 0 },
  KR: { code: "KRW", symbol: "₩", flag: "🇰🇷", locale: "ko-KR", decimalPlaces: 0 },
  CN: { code: "CNY", symbol: "¥", flag: "🇨🇳", locale: "zh-CN", decimalPlaces: 2 },
  TW: { code: "TWD", symbol: "NT$", flag: "🇹🇼", locale: "zh-TW", decimalPlaces: 0 },
  HK: { code: "HKD", symbol: "HK$", flag: "🇭🇰", locale: "zh-HK", decimalPlaces: 2 },
  MO: { code: "MOP", symbol: "P", flag: "🇲🇴", locale: "zh-MO", decimalPlaces: 2 },
  MN: { code: "MNT", symbol: "₮", flag: "🇲🇳", locale: "mn-MN", decimalPlaces: 0 },
  // South Asia
  IN: { code: "INR", symbol: "₹", flag: "🇮🇳", locale: "en-IN", decimalPlaces: 0 },
  BD: { code: "BDT", symbol: "৳", flag: "🇧🇩", locale: "bn-BD", decimalPlaces: 0 },
  PK: { code: "PKR", symbol: "₨", flag: "🇵🇰", locale: "ur-PK", decimalPlaces: 0 },
  LK: { code: "LKR", symbol: "Rs", flag: "🇱🇰", locale: "si-LK", decimalPlaces: 0 },
  NP: { code: "NPR", symbol: "₨", flag: "🇳🇵", locale: "ne-NP", decimalPlaces: 0 },
  AF: { code: "AFN", symbol: "؋", flag: "🇦🇫", locale: "ps-AF", decimalPlaces: 0 },
  MV: { code: "MVR", symbol: "Rf", flag: "🇲🇻", locale: "dv-MV", decimalPlaces: 2 },
  BT: { code: "BTN", symbol: "Nu", flag: "🇧🇹", locale: "dz-BT", decimalPlaces: 2 },
  // Oceania
  AU: { code: "AUD", symbol: "A$", flag: "🇦🇺", locale: "en-AU", decimalPlaces: 2 },
  NZ: { code: "NZD", symbol: "NZ$", flag: "🇳🇿", locale: "en-NZ", decimalPlaces: 2 },
  FJ: { code: "FJD", symbol: "FJ$", flag: "🇫🇯", locale: "en-FJ", decimalPlaces: 2 },
  PG: { code: "PGK", symbol: "K", flag: "🇵🇬", locale: "en-PG", decimalPlaces: 2 },
  SB: { code: "SBD", symbol: "SI$", flag: "🇸🇧", locale: "en-SB", decimalPlaces: 2 },
  // Middle East
  AE: { code: "AED", symbol: "د.إ", flag: "🇦🇪", locale: "ar-AE", decimalPlaces: 2 },
  SA: { code: "SAR", symbol: "﷼", flag: "🇸🇦", locale: "ar-SA", decimalPlaces: 2 },
  QA: { code: "QAR", symbol: "﷼", flag: "🇶🇦", locale: "ar-QA", decimalPlaces: 2 },
  KW: { code: "KWD", symbol: "د.ك", flag: "🇰🇼", locale: "ar-KW", decimalPlaces: 3 },
  BH: { code: "BHD", symbol: "BD", flag: "🇧🇭", locale: "ar-BH", decimalPlaces: 3 },
  OM: { code: "OMR", symbol: "﷼", flag: "🇴🇲", locale: "ar-OM", decimalPlaces: 3 },
  JO: { code: "JOD", symbol: "JD", flag: "🇯🇴", locale: "ar-JO", decimalPlaces: 3 },
  IL: { code: "ILS", symbol: "₪", flag: "🇮🇱", locale: "he-IL", decimalPlaces: 2 },
  IR: { code: "IRR", symbol: "﷼", flag: "🇮🇷", locale: "fa-IR", decimalPlaces: 0 },
  IQ: { code: "IQD", symbol: "ع.د", flag: "🇮🇶", locale: "ar-IQ", decimalPlaces: 0 },
  LB: { code: "LBP", symbol: "L£", flag: "🇱🇧", locale: "ar-LB", decimalPlaces: 0 },
  TR: { code: "TRY", symbol: "₺", flag: "🇹🇷", locale: "tr-TR", decimalPlaces: 2 },
  YE: { code: "YER", symbol: "﷼", flag: "🇾🇪", locale: "ar-YE", decimalPlaces: 0 },
  // Europe
  GB: { code: "GBP", symbol: "£", flag: "🇬🇧", locale: "en-GB", decimalPlaces: 2 },
  EU: { code: "EUR", symbol: "€", flag: "🇪🇺", locale: "en-IE", decimalPlaces: 2 },
  DE: { code: "EUR", symbol: "€", flag: "🇩🇪", locale: "de-DE", decimalPlaces: 2 },
  FR: { code: "EUR", symbol: "€", flag: "🇫🇷", locale: "fr-FR", decimalPlaces: 2 },
  IT: { code: "EUR", symbol: "€", flag: "🇮🇹", locale: "it-IT", decimalPlaces: 2 },
  ES: { code: "EUR", symbol: "€", flag: "🇪🇸", locale: "es-ES", decimalPlaces: 2 },
  PT: { code: "EUR", symbol: "€", flag: "🇵🇹", locale: "pt-PT", decimalPlaces: 2 },
  NL: { code: "EUR", symbol: "€", flag: "🇳🇱", locale: "nl-NL", decimalPlaces: 2 },
  BE: { code: "EUR", symbol: "€", flag: "🇧🇪", locale: "nl-BE", decimalPlaces: 2 },
  AT: { code: "EUR", symbol: "€", flag: "🇦🇹", locale: "de-AT", decimalPlaces: 2 },
  FI: { code: "EUR", symbol: "€", flag: "🇫🇮", locale: "fi-FI", decimalPlaces: 2 },
  GR: { code: "EUR", symbol: "€", flag: "🇬🇷", locale: "el-GR", decimalPlaces: 2 },
  IE: { code: "EUR", symbol: "€", flag: "🇮🇪", locale: "en-IE", decimalPlaces: 2 },
  SK: { code: "EUR", symbol: "€", flag: "🇸🇰", locale: "sk-SK", decimalPlaces: 2 },
  SI: { code: "EUR", symbol: "€", flag: "🇸🇮", locale: "sl-SI", decimalPlaces: 2 },
  CH: { code: "CHF", symbol: "Fr", flag: "🇨🇭", locale: "de-CH", decimalPlaces: 2 },
  NO: { code: "NOK", symbol: "kr", flag: "🇳🇴", locale: "nb-NO", decimalPlaces: 2 },
  SE: { code: "SEK", symbol: "kr", flag: "🇸🇪", locale: "sv-SE", decimalPlaces: 2 },
  DK: { code: "DKK", symbol: "kr", flag: "🇩🇰", locale: "da-DK", decimalPlaces: 2 },
  PL: { code: "PLN", symbol: "zł", flag: "🇵🇱", locale: "pl-PL", decimalPlaces: 2 },
  CZ: { code: "CZK", symbol: "Kč", flag: "🇨🇿", locale: "cs-CZ", decimalPlaces: 2 },
  HU: { code: "HUF", symbol: "Ft", flag: "🇭🇺", locale: "hu-HU", decimalPlaces: 0 },
  RO: { code: "RON", symbol: "lei", flag: "🇷🇴", locale: "ro-RO", decimalPlaces: 2 },
  BG: { code: "BGN", symbol: "лв", flag: "🇧🇬", locale: "bg-BG", decimalPlaces: 2 },
  HR: { code: "EUR", symbol: "€", flag: "🇭🇷", locale: "hr-HR", decimalPlaces: 2 },
  RS: { code: "RSD", symbol: "din", flag: "🇷🇸", locale: "sr-RS", decimalPlaces: 0 },
  UA: { code: "UAH", symbol: "₴", flag: "🇺🇦", locale: "uk-UA", decimalPlaces: 2 },
  RU: { code: "RUB", symbol: "₽", flag: "🇷🇺", locale: "ru-RU", decimalPlaces: 0 },
  // Americas
  US: { code: "USD", symbol: "$", flag: "🇺🇸", locale: "en-US", decimalPlaces: 2 },
  CA: { code: "CAD", symbol: "CA$", flag: "🇨🇦", locale: "en-CA", decimalPlaces: 2 },
  MX: { code: "MXN", symbol: "MX$", flag: "🇲🇽", locale: "es-MX", decimalPlaces: 2 },
  BR: { code: "BRL", symbol: "R$", flag: "🇧🇷", locale: "pt-BR", decimalPlaces: 2 },
  AR: { code: "ARS", symbol: "AR$", flag: "🇦🇷", locale: "es-AR", decimalPlaces: 0 },
  CL: { code: "CLP", symbol: "CL$", flag: "🇨🇱", locale: "es-CL", decimalPlaces: 0 },
  CO: { code: "COP", symbol: "CO$", flag: "🇨🇴", locale: "es-CO", decimalPlaces: 0 },
  PE: { code: "PEN", symbol: "S/", flag: "🇵🇪", locale: "es-PE", decimalPlaces: 2 },
  VE: { code: "VES", symbol: "Bs.S", flag: "🇻🇪", locale: "es-VE", decimalPlaces: 2 },
  // Africa
  NG: { code: "NGN", symbol: "₦", flag: "🇳🇬", locale: "en-NG", decimalPlaces: 0 },
  ZA: { code: "ZAR", symbol: "R", flag: "🇿🇦", locale: "en-ZA", decimalPlaces: 2 },
  EG: { code: "EGP", symbol: "£", flag: "🇪🇬", locale: "ar-EG", decimalPlaces: 2 },
  KE: { code: "KES", symbol: "KSh", flag: "🇰🇪", locale: "sw-KE", decimalPlaces: 0 },
  GH: { code: "GHS", symbol: "₵", flag: "🇬🇭", locale: "en-GH", decimalPlaces: 2 },
  TZ: { code: "TZS", symbol: "TSh", flag: "🇹🇿", locale: "sw-TZ", decimalPlaces: 0 },
  ET: { code: "ETB", symbol: "Br", flag: "🇪🇹", locale: "am-ET", decimalPlaces: 2 },
  MA: { code: "MAD", symbol: "MAD", flag: "🇲🇦", locale: "ar-MA", decimalPlaces: 2 },
  DZ: { code: "DZD", symbol: "DA", flag: "🇩🇿", locale: "ar-DZ", decimalPlaces: 2 },
  TN: { code: "TND", symbol: "DT", flag: "🇹🇳", locale: "ar-TN", decimalPlaces: 3 },
  // Central Asia
  KZ: { code: "KZT", symbol: "₸", flag: "🇰🇿", locale: "kk-KZ", decimalPlaces: 0 },
  UZ: { code: "UZS", symbol: "so'm", flag: "🇺🇿", locale: "uz-UZ", decimalPlaces: 0 },
}

/** Default fallback for unknown countries */
const DEFAULT_CURRENCY: CurrencyConfig = {
  code: "USD",
  symbol: "$",
  flag: "🌍",
  locale: "en-US",
  decimalPlaces: 2,
}

/** Get currency config for a country code */
export function getCurrencyForCountry(countryCode: string): CurrencyConfig {
  return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] ?? DEFAULT_CURRENCY
}

/** Check if a country code is the Philippines */
export function isPhilippines(countryCode: string): boolean {
  return countryCode.toUpperCase() === "PH"
}
