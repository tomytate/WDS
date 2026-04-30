import { NextResponse } from "next/server"

/**
 * GET /api/exchange-rates
 *
 * Fetches live USDT → world currency rates from CoinGecko (free, no API key needed).
 * Cached at the edge for 1 hour. Returns a flat map: { PHP: 57.2, SGD: 1.35, ... }
 */
export const revalidate = 3600 // 1 hour ISR cache

export async function GET() {
  try {
    // 1. Fetch standard fiat USD rates for global baseline coverage
    const fiatRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      next: { revalidate: 3600 },
    })
    const fiatData = fiatRes.ok ? await fiatRes.json() : { rates: FALLBACK_RATES }
    const baseRates = fiatData.rates as Record<string, number>

    // 2. Fetch true USDT (Tether) crypto rates from CoinGecko for crypto-premium accuracy
    // This correctly captures the ~60 PHP rate instead of the ~57 standard fiat USD rate
    const cgRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd,php,sgd,myr,idr,thb,vnd,jpy,krw,cny,twd,hkd,inr,aud,nzd,aed,sar,eur,gbp,cad,mxn,brl,zar,ngn,try,rub,uah,ars,vnd",
      { next: { revalidate: 3600 } }
    )

    const finalRates = { ...baseRates }
    
    if (cgRes.ok) {
      const cgData = await cgRes.json()
      const tetherRates = cgData.tether as Record<string, number>
      
      // Calculate how much USD 1 USDT is worth (usually ~1.000 to 1.002)
      const usdtToUsdModifier = tetherRates.usd ?? 1

      // First, slightly adjust the global fiat baseline by the USDT premium
      for (const [currency, rate] of Object.entries(finalRates)) {
        finalRates[currency] = rate * usdtToUsdModifier
      }

      // Then, forcefully override with direct true USDT crypto-to-fiat pairings for absolute market accuracy
      for (const [currency, cryptoRate] of Object.entries(tetherRates)) {
        finalRates[currency.toUpperCase()] = cryptoRate
      }
    }

    return NextResponse.json(
      { rates: finalRates, base: "USDT", updated: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        },
      }
    )
  } catch (err) {
    return NextResponse.json({
      rates: FALLBACK_RATES,
      base: "USDT",
      updated: "fallback",
    })
  }
}

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,      PHP: 57.5,   SGD: 1.35,   MYR: 4.72,
  IDR: 16300,  THB: 34.8,   VND: 25400,  KRW: 1370,
  JPY: 153,    CNY: 7.24,   HKD: 7.82,   TWD: 32.1,
  INR: 83.5,   BDT: 110,    PKR: 278,    LKR: 308,
  AUD: 1.53,   NZD: 1.66,   GBP: 0.79,   EUR: 0.93,
  CAD: 1.36,   CHF: 0.91,   SEK: 10.5,   NOK: 10.7,
  DKK: 6.92,   CZK: 23.4,   PLN: 4.02,   HUF: 362,
  TRY: 32.5,   RUB: 93,     ZAR: 18.6,   AED: 3.67,
  SAR: 3.75,   QAR: 3.64,   KWD: 0.308,  BHD: 0.377,
  BRL: 5.05,   MXN: 17.2,   ARS: 875,    CLP: 965,
  COP: 3900,   PEN: 3.73,   NGN: 1550,   EGP: 48.5,
  MAD: 10.1,   GHS: 15.5,
}
