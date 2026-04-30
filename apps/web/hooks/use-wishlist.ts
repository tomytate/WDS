"use client"

import { useSyncExternalStore, useCallback, useMemo } from "react"

// Storage event wrapper
function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  // We add a custom event "wishlist-changed" because StorageEvent only fires across tabs
  window.addEventListener("wishlist-changed", callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener("wishlist-changed", callback)
    window.removeEventListener("storage", callback)
  }
}

function getSnapshot() {
  if (typeof window === "undefined") return "[]"
  return localStorage.getItem("wongdigital-wishlist") || "[]"
}

function getServerSnapshot() {
  return "[]"
}

export function useWishlist() {
  const storeStr = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  
  // Parse safely
  const items: string[] = useMemo(() => {
    try {
      const parsed = JSON.parse(storeStr)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [storeStr])

  const toggle = useCallback((productId: string) => {
    try {
      const currentListStr = localStorage.getItem("wongdigital-wishlist") || "[]"
      let currentList: string[] = JSON.parse(currentListStr)
      if (!Array.isArray(currentList)) currentList = []

      const exists = currentList.includes(productId)
      
      let nextList
      if (exists) {
        nextList = currentList.filter(id => id !== productId)
      } else {
        nextList = [...currentList, productId]
      }

      localStorage.setItem("wongdigital-wishlist", JSON.stringify(nextList))
      window.dispatchEvent(new Event("wishlist-changed"))
    } catch (e) {
      console.error("Failed to update wishlist", e)
    }
  }, [])

  const has = useCallback((productId: string) => {
    return items.includes(productId)
  }, [items])

  return { items, toggle, has }
}
