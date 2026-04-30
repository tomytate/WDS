"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import type { OrderStatus } from "@wongdigital/db/types"

type OrderSelectionContextType = {
  selectedIds: string[]
  toggleId: (id: string) => void
  toggleAll: (ids: string[]) => void
  clear: () => void
}

const OrderSelectionContext = createContext<OrderSelectionContextType | null>(null)

export function OrderSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleAll = (ids: string[]) => {
    if (selectedIds.length === ids.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(ids)
    }
  }

  const clear = () => setSelectedIds([])

  return (
    <OrderSelectionContext.Provider value={{ selectedIds, toggleId, toggleAll, clear }}>
      {children}
    </OrderSelectionContext.Provider>
  )
}

export function useOrderSelection() {
  const context = useContext(OrderSelectionContext)
  if (!context) throw new Error("Missing OrderSelectionProvider")
  return context
}
