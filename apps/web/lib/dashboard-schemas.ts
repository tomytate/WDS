import { z } from "zod"

function isValidIconSource(value: string) {
  if (value.startsWith("/")) {
    return true
  }

  try {
    const parsed = new URL(value)

    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

const dashboardPathSchema = z
  .string()
  .trim()
  .refine((value) => value.startsWith("/dashboard"), "Invalid return path")

export const dashboardOrderStatusSchema = z.object({
  orderId: z.string().trim().min(1, "Order is required"),
  status: z.enum(["pending", "processing", "delivered", "completed", "cancelled"]),
  returnTo: dashboardPathSchema,
})

export const dashboardProductSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(2, "Product name is required"),
  slug: z.string().trim().optional().or(z.literal("")),
  price: z
    .string()
    .trim()
    .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), "Enter a valid price"),
  category: z.string().trim().min(2, "Category is required"),
  description: z.string().trim().max(400, "Description is too long").optional().or(z.literal("")),
  iconUrl: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || isValidIconSource(value),
      "Enter a valid icon URL or local path",
    )
    .optional()
    .transform((value) => value ?? ""),
  isActive: z.enum(["true", "false"]),
  returnTo: dashboardPathSchema,
})

export const dashboardProductToggleSchema = z.object({
  productId: z.string().trim().min(1, "Product is required"),
  isActive: z.enum(["true", "false"]),
  returnTo: dashboardPathSchema,
})

export const dashboardStoreSettingsSchema = z.object({
  storeName: z.string().trim().min(2, "Store name is required"),
  supportEmail: z.email("Enter a valid support email"),
  qrphNumber: z.string().trim().optional().or(z.literal("")),
  qrphInstructions: z
    .string()
    .trim()
    .max(500, "Instructions are too long")
    .optional()
    .or(z.literal("")),
  binancePayId: z.string().trim().optional().or(z.literal("")),
  binanceInstructions: z
    .string()
    .trim()
    .max(500, "Instructions are too long")
    .optional()
    .or(z.literal("")),
  returnTo: dashboardPathSchema,
})

export const dashboardPromoSchema = z.object({
  id: z.string().trim().optional(),
  code: z.string().trim().min(3, "Promo code must be at least 3 characters").max(20, "Promo code is too long"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.string().trim().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Invalid discount value"),
  minOrderAmount: z.string().trim().optional().or(z.literal("")),
  maxDiscountAmount: z.string().trim().optional().or(z.literal("")),
  maxUses: z.string().trim().optional().or(z.literal("")),
  isActive: z.enum(["true", "false"]),
  startsAt: z.string().trim(),
  expiresAt: z.string().trim().optional().or(z.literal("")),
  returnTo: dashboardPathSchema,
})

export const dashboardPromoToggleSchema = z.object({
  promoId: z.string().trim().min(1, "Promo ID is required"),
  isActive: z.enum(["true", "false"]),
  returnTo: dashboardPathSchema,
})

export const dashboardBundleSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(2, "Bundle name is required"),
  slug: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().max(400, "Description is too long").optional().or(z.literal("")),
  bundlePrice: z.string().trim().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Enter a valid price"),
  originalPrice: z.string().trim().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Enter a valid price"),
  iconUrl: z.string().trim().optional().or(z.literal("")),
  isActive: z.enum(["true", "false"]),
  items: z.string().trim().min(5, "You must select at least one product"),
  returnTo: dashboardPathSchema,
})

export const dashboardBundleToggleSchema = z.object({
  bundleId: z.string().trim().min(1, "Bundle ID is required"),
  isActive: z.enum(["true", "false"]),
  returnTo: dashboardPathSchema,
})

