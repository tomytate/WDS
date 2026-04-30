"use client"

import { useCallback, useEffect, useState } from "react"

export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  const toggle = useCallback(() => setOpen((prev) => !prev), [])
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        toggle()
      }
      if (e.key === "Escape" && open) {
        e.preventDefault()
        close()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [toggle, close, open])

  return { open, setOpen, toggle, close }
}

export type CommandItem = {
  id: string
  label: string
  href: string
  group: "product" | "page"
  iconUrl?: string
  price?: string
}

export function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  return t.includes(q)
}
