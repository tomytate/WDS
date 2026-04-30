import { getDb, hasDatabaseUrl } from "../client";
import type { PromoCode } from "../types";

export async function validatePromoCode(
  code: string,
  subtotal: number,
): Promise<{
  valid: boolean;
  promo?: PromoCode;
  error?: string;
  discountAmount?: number;
}> {
  if (!hasDatabaseUrl()) {
    return {
      valid: false,
      error: "Promo codes require a database connection.",
    };
  }

  const supabase = getDb();
  const cleanCode = code.trim().toUpperCase();

  // ilike allows case insensitive search which matches SQL UPPER()
  const { data: promo, error } = await supabase
    .from("promo_codes")
    .select("*")
    .ilike("code", cleanCode)
    .limit(1)
    .maybeSingle();

  if (error || !promo) {
    return { valid: false, error: "Invalid promo code." };
  }

  if (!promo.is_active) {
    return { valid: false, error: "This promo code is no longer active." };
  }

  const now = new Date();
  const startsAt = new Date(promo.starts_at);

  if (startsAt > now) {
    return { valid: false, error: "This promo code is not yet active." };
  }

  if (promo.expires_at && new Date(promo.expires_at) < now) {
    return { valid: false, error: "This promo code has expired." };
  }

  if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
    return {
      valid: false,
      error: "This promo code has reached its usage limit.",
    };
  }

  const minOrderAmount = Number(promo.min_order_amount);
  if (minOrderAmount > 0 && subtotal < minOrderAmount) {
    return {
      valid: false,
      error: `Minimum order amount of ₱${minOrderAmount} required.`,
    };
  }

  // Calculate discount
  let discountAmount = 0;
  const discountValue = Number(promo.discount_value);

  if (promo.discount_type === "percentage") {
    // Percentage discount
    discountAmount = (subtotal * discountValue) / 100;
  } else {
    // Fixed amount discount
    discountAmount = discountValue;
  }

  // Cap at max discount if applicable (only matters for percentages)
  if (promo.max_discount_amount && Number(promo.max_discount_amount) > 0) {
    const maxDiscount = Number(promo.max_discount_amount);
    discountAmount = Math.min(discountAmount, maxDiscount);
  }

  // Don't discount more than the subtotal
  discountAmount = Math.min(discountAmount, subtotal);

  return {
    valid: true,
    promo: {
      id: promo.id,
      code: promo.code,
      discountType: promo.discount_type as "percentage" | "fixed",
      discountValue: promo.discount_value.toString(),
      minOrderAmount: promo.min_order_amount.toString(),
      maxDiscountAmount: promo.max_discount_amount
        ? promo.max_discount_amount.toString()
        : null,
      maxUses: promo.max_uses,
      currentUses: promo.current_uses,
      isActive: promo.is_active,
      startsAt: new Date(promo.starts_at),
      expiresAt: promo.expires_at ? new Date(promo.expires_at) : null,
      createdAt: new Date(promo.created_at),
    },
    discountAmount,
  };
}

export async function listActivePromoCodes(): Promise<PromoCode[]> {
  if (!hasDatabaseUrl()) return [];

  const supabase = getDb();

  const { data: promos, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !promos) return [];

  return promos.map((promo: any) => ({
    id: promo.id,
    code: promo.code,
    discountType: promo.discount_type as "percentage" | "fixed",
    discountValue: promo.discount_value.toString(),
    minOrderAmount: promo.min_order_amount.toString(),
    maxDiscountAmount: promo.max_discount_amount
      ? promo.max_discount_amount.toString()
      : null,
    maxUses: promo.max_uses,
    currentUses: promo.current_uses,
    isActive: promo.is_active,
    startsAt: new Date(promo.starts_at),
    expiresAt: promo.expires_at ? new Date(promo.expires_at) : null,
    createdAt: new Date(promo.created_at),
  }));
}

export async function listAllPromoCodes(): Promise<PromoCode[]> {
  if (!hasDatabaseUrl()) return [];

  const supabase = getDb();

  const { data: promos, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !promos) return [];

  return promos.map((promo: any) => ({
    id: promo.id,
    code: promo.code,
    discountType: promo.discount_type as "percentage" | "fixed",
    discountValue: promo.discount_value.toString(),
    minOrderAmount: promo.min_order_amount.toString(),
    maxDiscountAmount: promo.max_discount_amount
      ? promo.max_discount_amount.toString()
      : null,
    maxUses: promo.max_uses,
    currentUses: promo.current_uses,
    isActive: promo.is_active,
    startsAt: new Date(promo.starts_at),
    expiresAt: promo.expires_at ? new Date(promo.expires_at) : null,
    createdAt: new Date(promo.created_at),
  }));
}

export async function getPromoCodeById(id: string): Promise<PromoCode | null> {
  if (!hasDatabaseUrl()) return null;

  const supabase = getDb();
  const { data: promo, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !promo) return null;

  return {
    id: promo.id,
    code: promo.code,
    discountType: promo.discount_type as "percentage" | "fixed",
    discountValue: promo.discount_value.toString(),
    minOrderAmount: promo.min_order_amount.toString(),
    maxDiscountAmount: promo.max_discount_amount
      ? promo.max_discount_amount.toString()
      : null,
    maxUses: promo.max_uses,
    currentUses: promo.current_uses,
    isActive: promo.is_active,
    startsAt: new Date(promo.starts_at),
    expiresAt: promo.expires_at ? new Date(promo.expires_at) : null,
    createdAt: new Date(promo.created_at),
  };
}

export async function createPromoCode(input: {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  minOrderAmount?: string | null;
  maxDiscountAmount?: string | null;
  maxUses?: number | null;
  isActive?: boolean;
  startsAt?: Date;
  expiresAt?: Date | null;
}) {
  const supabase = getDb();

  const { data: created, error } = await supabase
    .from("promo_codes")
    .insert({
      code: input.code.trim().toUpperCase(),
      discount_type: input.discountType,
      discount_value: Number(input.discountValue),
      min_order_amount: Number(input.minOrderAmount ?? "0.00"),
      max_discount_amount: input.maxDiscountAmount
        ? Number(input.maxDiscountAmount)
        : null,
      max_uses: input.maxUses,
      is_active: input.isActive ?? true,
      starts_at: (input.startsAt ?? new Date()).toISOString(),
      expires_at: input.expiresAt ? input.expiresAt.toISOString() : null,
    })
    .select()
    .single();

  if (error || !created) throw new Error("Failed to create promo code.");

  return created;
}

export async function updatePromoCode(id: string, input: any) {
  const supabase = getDb();

  const updateData: any = {};
  if (input.code) updateData.code = input.code.trim().toUpperCase();
  if (input.discountType !== undefined)
    updateData.discount_type = input.discountType;
  if (input.discountValue !== undefined)
    updateData.discount_value = Number(input.discountValue);
  if (input.minOrderAmount !== undefined)
    updateData.min_order_amount = Number(input.minOrderAmount);
  if (input.maxDiscountAmount !== undefined)
    updateData.max_discount_amount = input.maxDiscountAmount
      ? Number(input.maxDiscountAmount)
      : null;
  if (input.maxUses !== undefined) updateData.max_uses = input.maxUses;
  if (input.isActive !== undefined) updateData.is_active = input.isActive;
  if (input.startsAt !== undefined)
    updateData.starts_at = new Date(input.startsAt).toISOString();
  if (input.expiresAt !== undefined)
    updateData.expires_at = input.expiresAt
      ? new Date(input.expiresAt).toISOString()
      : null;

  const { data: updated, error } = await supabase
    .from("promo_codes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) throw new Error("Failed to update promo code.");

  return updated;
}

export async function setPromoCodeActive(id: string, isActive: boolean) {
  if (!hasDatabaseUrl()) return null;

  const supabase = getDb();
  const { data: updated, error } = await supabase
    .from("promo_codes")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) return null;

  return updated;
}

export async function incrementPromoUses(id: string) {
  const supabase = getDb();

  const { data: promo } = await supabase
    .from("promo_codes")
    .select("current_uses")
    .eq("id", id)
    .maybeSingle();
  if (promo) {
    await supabase
      .from("promo_codes")
      .update({ current_uses: promo.current_uses + 1 })
      .eq("id", id);
  }
}
