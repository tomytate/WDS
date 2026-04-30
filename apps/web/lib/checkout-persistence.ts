import { useEffect, useRef } from "react"
import type { UseFormReturn } from "react-hook-form"

import type { OrderFormValues } from "@/lib/schemas"

export const STORAGE_KEY = "wds:checkout"
const DEBOUNCE_MS = 500

type PersistedCheckout = {
  items: OrderFormValues["items"]
  customerName: string
  customerEmail: string
  customerPhone: string
  tipAmount: string
  serviceDetails: string
  paymentMethod: string
  paymentReference: string
  step: number
  savedAt: number
}

const MAX_AGE_MS = 2 * 60 * 60 * 1000 // 2 hours

function readPersistedCheckout(): PersistedCheckout | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as PersistedCheckout

    if (!parsed.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    if (!Array.isArray(parsed.items)) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function writePersistedCheckout(data: PersistedCheckout) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function clearPersistedCheckout() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore
  }
}

export function useCheckoutPersistence(
  form: UseFormReturn<OrderFormValues>,
  step: number,
  setStep: (step: number) => void,
) {
  const initialized = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Restore persisted state on mount
  useEffect(() => {
    if (initialized.current) {
      return
    }

    initialized.current = true

    const persisted = readPersistedCheckout()

    if (!persisted || persisted.items.length === 0) {
      return
    }

    form.reset({
      items: persisted.items,
      customerName: persisted.customerName || "",
      customerEmail: persisted.customerEmail || "",
      customerPhone: persisted.customerPhone || "",
      tipAmount: persisted.tipAmount || "0",
      serviceDetails: persisted.serviceDetails || "",
      paymentMethod: "qrph" as const,
      paymentReference: persisted.paymentReference || "",
    })

    if (persisted.step > 0) {
      setStep(persisted.step)
    }
  }, [form, setStep])

  // Persist form state on changes (debounced)
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        writePersistedCheckout({
          items: (values.items ?? []) as OrderFormValues["items"],
          customerName: values.customerName ?? "",
          customerEmail: values.customerEmail ?? "",
          customerPhone: values.customerPhone ?? "",
          tipAmount: values.tipAmount ?? "0",
          serviceDetails: values.serviceDetails ?? "",
          paymentMethod: values.paymentMethod ?? "qrph",
          paymentReference: values.paymentReference ?? "",
          step,
          savedAt: Date.now(),
        })
      }, DEBOUNCE_MS)
    })

    return () => {
      subscription.unsubscribe()

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [form, step])

  // Also persist when step changes
  useEffect(() => {
    const values = form.getValues()

    writePersistedCheckout({
      items: values.items,
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone ?? "",
      tipAmount: values.tipAmount,
      serviceDetails: values.serviceDetails ?? "",
      paymentMethod: values.paymentMethod,
      paymentReference: values.paymentReference ?? "",
      step,
      savedAt: Date.now(),
    })
  }, [form, step])
}
