"use client"

import { useSyncExternalStore, useCallback } from "react"

const STORAGE_KEY = "wds:recently-viewed"
const MAX_ITEMS = 8

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  window.addEventListener("recently-viewed-changed", callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener("recently-viewed-changed", callback)
    window.removeEventListener("storage", callback)
  }
}

function getSnapshot() {
  if (typeof window === "undefined") return "[]"
  return localStorage.getItem(STORAGE_KEY) || "[]"
}

function getServerSnapshot() {
  return "[]"
}

/**
 * Track and retrieve recently viewed product slugs.
 * Uses the same `useSyncExternalStore` pattern as `useWishlist`.
 *
 * - Stores up to 8 slugs, most-recent first.
 * - `track(slug)` moves a slug to position 0 (deduplicates if already present).
 * - `slugs` is a reactive array of recently viewed product slugs.
 */
export function useRecentlyViewed() {
  const storeStr = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  let slugs: string[]
  try {
    slugs = JSON.parse(storeStr)
    if (!Array.isArray(slugs)) slugs = []
  } catch {
    slugs = []
  }

  const track = useCallback((slug: string) => {
    try {
      const currentStr = localStorage.getItem(STORAGE_KEY) || "[]"
      let current: string[] = JSON.parse(currentStr)
      if (!Array.isArray(current)) current = []

      // Remove if already present, then prepend
      const next = [slug, ...current.filter((s) => s !== slug)].slice(0, MAX_ITEMS)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event("recently-viewed-changed"))
    } catch (e) {
      console.error("Failed to update recently viewed", e)
    }
  }, [])

  return { slugs, track }
}
