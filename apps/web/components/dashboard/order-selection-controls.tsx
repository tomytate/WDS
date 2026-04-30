"use client"

import { useTransition } from "react"
import { useOrderSelection } from "./order-selection-provider"
import { Check } from "lucide-react"
import { Button, Select, buttonStyles } from "@wongdigital/ui"
import { updateBulkOrderStatusAction } from "@/app/(dashboard)/dashboard/actions"

export function OrderCheckbox({ id }: { id: string }) {
  const { selectedIds, toggleId } = useOrderSelection()
  const checked = selectedIds.includes(id)

  return (
    <button
      type="button"
      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
        checked ? "bg-[--accent] border-[--accent] text-[--accent-fg]" : "border-[--border] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] hover:border-[--text-muted]"
      }`}
      onClick={() => toggleId(id)}
    >
      {checked && <Check size={14} strokeWidth={3} />}
    </button>
  )
}

export function OrderSelectAll({ allIds }: { allIds: string[] }) {
  const { selectedIds, toggleAll } = useOrderSelection()
  const checked = selectedIds.length > 0 && selectedIds.length === allIds.length
  const indeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length

  return (
    <button
      type="button"
      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
        checked || indeterminate ? "bg-[--accent] border-[--accent] text-[--accent-fg]" : "border-[--border] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)] hover:border-[--text-muted]"
      }`}
      onClick={() => toggleAll(allIds)}
    >
      {checked && <Check size={14} strokeWidth={3} />}
      {indeterminate && <div className="h-0.5 w-2.5 bg-current rounded-full" />}
    </button>
  )
}

export function BulkActionBar() {
  const { selectedIds, clear } = useOrderSelection()
  const [isPending, startTransition] = useTransition()

  if (selectedIds.length === 0) return null

  const handleBulkUpdate = (formData: FormData) => {
    formData.append("ids", selectedIds.join(","))
    startTransition(async () => {
      await updateBulkOrderStatusAction(formData)
      clear()
    })
  }

  const handleExportCsv = () => {
    // Navigate or trigger download for the selected IDs
    const form = document.createElement("form")
    form.method = "POST"
    form.action = "" // We can handle this through a server action or API route
    // Wait, it's easier to use a Server Action that returns data or sets a cookie, but Server Actions returning files is tricky.
    // simpler: construct a URL /api/admin/orders-csv?ids=...
    const idsParam = encodeURIComponent(selectedIds.join(","))
    window.open(`/api/admin/orders-csv?ids=${idsParam}`, "_blank")
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[fade-in-up_0.3s_ease-out]">
      <div className="flex items-center gap-4 rounded-full border border-[--border] bg-[--bg-card] p-2 pr-4 pl-6 shadow-2xl backdrop-blur-xl">
        <span className="text-sm font-medium text-[--text-primary]">
          {selectedIds.length} order{selectedIds.length > 1 ? "s" : ""} selected
        </span>

        <div className="h-4 w-px bg-[--border]" />

        <form action={handleBulkUpdate} className="flex items-center gap-2">
          <Select name="status" className="h-9 w-32 bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)] text-sm" defaultValue="">
            <option value="" disabled>Set status...</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Button type="submit" size="sm" disabled={isPending}>
            Apply
          </Button>
        </form>

        <div className="h-4 w-px bg-[--border]" />

        <button
          type="button"
          onClick={handleExportCsv}
          className={buttonStyles({ variant: "ghost", size: "sm" })}
        >
          Export CSV
        </button>

        <button
          type="button"
          onClick={clear}
          className="ml-2 text-[--text-muted] hover:text-[--text-primary] p-2"
          aria-label="Clear selection"
        >
          ×
        </button>
      </div>
    </div>
  )
}
