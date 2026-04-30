import { checkRateLimit } from "@/lib/security"
import { deleteAsset, uploadReceiptAsset } from "@/lib/vercel/blob"
import type { ActionResult } from "@/lib/actions"

export async function authorizeOrderSubmission(formData: FormData): Promise<ActionResult<void>> {
  const isRateLimited = await checkRateLimit("createOrder", 5, 60000)

  if (!isRateLimited) {
    return {
      success: false,
      error: "You are submitting orders too quickly. Please wait a moment.",
    }
  }

  return { success: true, data: undefined }
}

export async function validateAndUploadReceipt(receiptFile: File | null): Promise<ActionResult<{ pathname: string }>> {
  if (!receiptFile || receiptFile.size === 0) {
    return {
      success: false,
      error: "Upload your online receipt before submitting the order.",
    }
  }

  const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ])

  if (!allowedTypes.has(receiptFile.type)) {
    return {
      success: false,
      error: "Receipt must be a JPG, PNG, WEBP, or PDF file.",
    }
  }

  if (receiptFile.size > 4 * 1024 * 1024) {
    return {
      success: false,
      error: "Receipt file must be 4MB or smaller.",
    }
  }

  return {
    success: true,
    data: await uploadReceiptAsset(receiptFile),
  }
}

export async function rollbackReceiptAsset(pathname: string) {
  return deleteAsset(pathname).catch(() => undefined)
}
