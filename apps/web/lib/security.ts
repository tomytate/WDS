import { headers } from "next/headers"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

type RateLimitRecord = {
  count: number
  expiresAt: number
}

const fallbackStore = new Map<string, RateLimitRecord>()

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

const ratelimiters = new Map<string, Ratelimit>()

/**
 * Edge-compatible rate limiter using Upstash Redis for Vercel Serverless.
 * Falls back to in-memory map if Redis is not configured (e.g. local dev).
 */
export async function checkRateLimit(actionName: string, maxRequests = 5, windowMs = 60000): Promise<boolean> {
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1"
  const key = `${actionName}:${ip}`

  if (redis) {
    const windowSecs = Math.max(1, Math.floor(windowMs / 1000))
    const configKey = `${maxRequests}-${windowSecs}s`
    
    let limiter = ratelimiters.get(configKey)
    if (!limiter) {
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(maxRequests, `${windowSecs} s`),
        analytics: true,
      })
      ratelimiters.set(configKey, limiter)
    }

    try {
      const { success } = await limiter.limit(key)
      return success
    } catch (err) {
      console.error("[RateLimit Error] Upstash failed, falling back to memory:", err)
      // Fall through to memory fallback
    }
  }

  const now = Date.now()

  // Lazy cleanup of old entries
  if (fallbackStore.size > 1000) {
    for (const [k, v] of Array.from(fallbackStore.entries())) {
      if (v.expiresAt < now) fallbackStore.delete(k)
    }
  }

  const record = fallbackStore.get(key)

  if (!record || record.expiresAt < now) {
    fallbackStore.set(key, { count: 1, expiresAt: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count += 1
  return true
}
