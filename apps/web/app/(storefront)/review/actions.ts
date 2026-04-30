"use server"

import { revalidatePath } from "next/cache"
import { submitReview } from "@wongdigital/db/storefront"

import { reviewSchema } from "@/lib/schemas"

export type ReviewState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function submitReviewAction(
  prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  try {
    const rawData = {
      orderId: formData.get("orderId"),
      customerName: formData.get("customerName"),
      customerEmail: formData.get("customerEmail"),
      rating: formData.get("rating"),
      content: formData.get("content"),
    }

    const parsed = reviewSchema.safeParse(rawData)

    if (!parsed.success) {
      return {
        error: "Please check the form for invalid entries.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      }
    }

    await submitReview(parsed.data)

    // Revalidate paths that might display reviews
    revalidatePath("/")
    revalidatePath("/dashboard/reviews")

    return { success: true }
  } catch (error) {
    console.error("Failed to submit review:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
