"use server"

import { validatePromoCode } from "@wongdigital/db/storefront"

export async function validatePromoCodeAction(code: string, subtotal: number) {
  try {
    const result = await validatePromoCode(code, subtotal)
    
    if (!result.valid || !result.promo) {
      return { success: false, error: result.error || "Invalid promo code" }
    }
    
    return {
      success: true,
      data: {
        code: result.promo.code,
        discountType: result.promo.discountType,
        discountValue: result.promo.discountValue,
        maxDiscountAmount: result.promo.maxDiscountAmount,
        minOrderAmount: result.promo.minOrderAmount,
      }
    }
  } catch (error) {
    return { success: false, error: "Failed to validate promo code" }
  }
}
