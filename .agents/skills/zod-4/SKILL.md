---
description: Zod 4 schema validation patterns, new APIs, and usage in Next.js server actions
---

# Zod 4.3.6 — Reference Guide

## Key Changes from Zod 3

### New Shorthand Methods
```ts
// Zod 4 shorthand (replaces z.string().email())
z.email("Valid email required")

// Zod 4 shorthand for URL
z.url("Valid URL required")

// Zod 4 shorthand for UUID
z.uuid("Valid UUID required")
```

### Schema Composition
```ts
// Pick specific fields for step validation
const stepSchema = fullSchema.pick({ customerName: true, customerEmail: true })

// Omit fields
const partialSchema = fullSchema.omit({ paymentReference: true })
```

## Project Patterns

### Order Schema (storefront)
```ts
export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Select at least one product"),
  customerName: z.string().min(2, "Full name required"),
  customerEmail: z.email("Valid email required"),
  customerPhone: z.string()
    .regex(/^09\d{9}$/, "Use format: 09XXXXXXXXX")
    .optional()
    .or(z.literal("")),
  tipAmount: tipAmountSchema,
  paymentMethod: z.literal("gcash"),
  paymentReference: z.string().min(4, "Reference number required"),
})
```

### Step-by-step Validation
```ts
// Validate only the current step's fields
const productStepSchema = orderSchema.pick({ items: true })
const detailsStepSchema = orderSchema.pick({
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  tipAmount: true,
})
const paymentStepSchema = orderSchema.pick({
  paymentMethod: true,
  paymentReference: true,
})
```

### Server Action Validation
```ts
"use server"

export async function myAction(formData: FormData) {
  const parsed = schema.safeParse({
    field: String(formData.get("field") ?? ""),
  })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Validation failed.",
    }
  }

  // Use parsed.data (fully typed)
  const data = parsed.data
}
```

### Transform + Refine Chain
```ts
const tipAmountSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? "0" : value))
  .refine((value) => /^\d+$/.test(value), "Enter a valid tip amount")
  .refine((value) => Number(value) >= 0, "Tip cannot be negative")
  .refine((value) => Number(value) <= 5000, "Tip is too high")
```

### Type Inference
```ts
export type OrderFormValues = z.infer<typeof orderSchema>
export type OrderSelectionValue = z.infer<typeof orderItemSchema>
```

## Best Practices
1. **Use `z.email()` / `z.url()`** — cleaner than `z.string().email()`
2. **Use `.pick()` for step validation** — validate only what the user has filled
3. **Use `.safeParse()`** in server actions — never throw on user input
4. **Always access `issues[0]?.message`** — show the first validation error
5. **Use `.or(z.literal(""))` for optional strings** — handles empty form fields
6. **Use `.transform()` before `.refine()`** — normalize data before validating
