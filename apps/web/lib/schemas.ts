import { z } from "zod"

const tipAmountSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? "0" : value))
  .refine((value) => /^\d+$/.test(value), "Enter a valid tip amount")
  .refine((value) => Number(value) >= 0, "Tip cannot be negative")
  .refine((value) => Number(value) <= 5000, "Tip is too high")

const orderItemSchema = z.object({
  productId: z.string().trim().min(1, "Select a valid product"),
  accessPlan: z.enum(["one_month", "three_months", "six_months", "one_year", "two_years", "lifetime"]).optional().default("one_year"),
  quantity: z.number().int().positive().optional(),
  serviceOption: z.string().trim().optional().or(z.literal("")),
  targetUrl: z
    .string()
    .trim()
    .max(500, "Target URL is too long")
    .optional()
    .or(z.literal("")),
})

export const baseOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "Select at least one product"),
  customerName: z.string().min(2, "Full name required"),
  customerEmail: z.email("Valid email required"),
  customerPhone: z
    .string()
    .min(7, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  tipAmount: tipAmountSchema,
  serviceDetails: z
    .string()
    .trim()
    .max(1000, "Service details are too long")
    .optional()
    .or(z.literal("")),
  paymentMethod: z.enum(["qrph", "binance", "alipay", "wallet"]),
  paymentReference: z.string().optional().or(z.literal("")),
  promoCode: z.string().trim().optional().or(z.literal("")),
  bundleId: z.string().trim().optional().or(z.literal("")),
});

export const orderSchema = baseOrderSchema.refine(
  (data) => {
    // For manual payments (qrph/binance/alipay), payment reference is required (4+ chars)
    if (data.paymentMethod !== "wallet") {
      return !!data.paymentReference && data.paymentReference.length >= 4
    }
    return true
  },
  { message: "Reference number required", path: ["paymentReference"] },
)

export const trackByCodeSchema = z.object({
  orderCode: z
    .string()
    .min(8, "Enter a valid order code")
    .transform((value) => value.trim().toUpperCase()),
})

export const trackByEmailSchema = z.object({
  email: z.email("Enter the email used for your order"),
})

export type OrderFormValues = z.infer<typeof orderSchema>
export type OrderSelectionValue = z.infer<typeof orderItemSchema>
export type TrackByCodeValues = z.infer<typeof trackByCodeSchema>
export type TrackByEmailValues = z.infer<typeof trackByEmailSchema>

export const reviewSchema = z.object({
  orderId: z.string().min(1, "Order ID required"),
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.email("Valid email is required"),
  rating: z.coerce.number().min(1).max(5),
  content: z.string().max(1000, "Review is too long").optional(),
})

export type ReviewValues = z.infer<typeof reviewSchema>
