"use server"

import { createClient } from "@/utils/supabase/server"
import { createDepositRequest } from "@wongdigital/db/storefront"



export async function requestDeposit(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "You must be signed in to request a deposit." }
  }

  // Get customer by user_id
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (customerError || !customer) {
    return { error: "Customer profile not found." }
  }

  const amountUsdtRaw = formData.get("amountUsdt")
  const paymentMethod = formData.get("paymentMethod") as
    | "qrph"
    | "binance_pay"
    | null
  const referenceId = formData.get("referenceId") as string | null

  const amountUsdt = Number(amountUsdtRaw)

  if (!amountUsdt || amountUsdt < 1 || amountUsdt > 10000) {
    return { error: "Enter a valid USDT amount between 1 and 10,000." }
  }

  if (!paymentMethod || !["qrph", "binance_pay"].includes(paymentMethod)) {
    return { error: "Select a valid payment method." }
  }

  // Store USDT amount directly — DB prices are natively in USDT
  try {
    await createDepositRequest({
      customerId: customer.id,
      amount: amountUsdt,
      paymentMethod,
      referenceId: referenceId?.trim() || undefined,
      notes: `Deposit USDT ${amountUsdt.toFixed(2)} via ${paymentMethod === "qrph" ? "QRPH" : "Binance Pay"}`,
    })

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit deposit request."
    return { error: message }
  }
}
