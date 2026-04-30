import { createHmac } from "crypto"

/**
 * Generates a short-lived, verifiable token for an order code.
 * Used to secure the order success page from PII leaks by ensuring the visitor
 * was the one who just placed the order.
 */
export function signOrderToken(orderCode: string): string {
  const secret = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-dev-secret-wds"
  return createHmac("sha256", secret)
    .update(orderCode)
    .digest("hex")
    .slice(0, 16)
}

/**
 * Validates the order token.
 */
export function verifyOrderToken(orderCode: string, token: string | null | undefined): boolean {
  if (!token) return false
  return signOrderToken(orderCode) === token
}
