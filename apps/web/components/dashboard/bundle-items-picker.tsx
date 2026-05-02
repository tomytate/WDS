"use client"

import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import type { Product } from "@wongdigital/db/types"
import { Button, Select } from "@wongdigital/ui"

type Item = {
  productId: string
  accessPlan: string
}

export function BundleItemsPicker({
  products,
  initialItems = [],
}: {
  products: Pick<Product, "id" | "name" | "price" | "category">[]
  initialItems?: Item[]
}) {
  const [items, setItems] = useState<Item[]>(initialItems.length > 0 ? initialItems : [{ productId: "", accessPlan: "one_year" }])

  const add = () => setItems([...items, { productId: "", accessPlan: "one_year" }])
  
  const remove = (index: number) => {
    const next = [...items]
    next.splice(index, 1)
    setItems(next)
  }

  const update = (index: number, field: keyof Item, value: string) => {
    const next = [...items]
    const existing = next[index] ?? { productId: "", accessPlan: "one_year" }
    next[index] = { ...existing, [field]: value }
    setItems(next)
  }

  // Filter out empty items before outputting JSON
  const validItems = items.filter(i => i.productId !== "")

  return (
    <div className="space-y-3 rounded-[--radius-card] border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[--text-secondary]">
          Included Products
        </p>
        <Button size="sm" variant="ghost" type="button" onClick={add} className="h-7 text-xs">
          <Plus size={14} className="mr-1" /> Add
        </Button>
      </div>

      <input type="hidden" name="items" value={JSON.stringify(validItems)} />

      <div className="grid gap-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Select 
              value={item.productId} 
              onChange={(e) => update(i, "productId", e.target.value)}
              className="flex-1"
              required
            >
              <option value="" disabled>Select a product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (USDT {p.price})</option>
              ))}
            </Select>

            <Select
              value={item.accessPlan}
              onChange={(e) => update(i, "accessPlan", e.target.value)}
              className="w-32"
            >
              <option value="one_year">1 Year</option>
              <option value="lifetime">Lifetime</option>
            </Select>

            <button
              type="button"
              onClick={() => remove(i)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[--border] bg-[--bg-surface] text-[--text-secondary] hover:text-[--color-danger] hover:border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-sm text-[--text-secondary] text-center py-4 border border-dashed border-[--border] rounded-xl">
            No products in this bundle.
          </div>
        )}
      </div>
    </div>
  )
}
