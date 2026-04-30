import { getDb, hasDatabaseUrl } from "../client";
import type { AccessPlan, Bundle, BundleItem } from "../types";

/**
 * Supabase returns joined rows as arrays (even for single FK joins). This helper
 * normalizes `product:products(...)` into a single product object and maps
 * snake_case → camelCase for consumption in React components.
 */
function shapeBundleItem(row: any): BundleItem {
  const productRow = Array.isArray(row.product) ? row.product[0] : row.product;
  return {
    id: row.id as string,
    bundleId: row.bundle_id as string,
    accessPlan: row.access_plan as AccessPlan,
    product: {
      id: productRow?.id ?? "",
      name: productRow?.name ?? "Unknown",
      price: String(productRow?.price ?? "0"),
      iconUrl: productRow?.icon_url ?? null,
    },
  };
}

export async function listAllBundles(): Promise<Bundle[]> {
  if (!hasDatabaseUrl()) return [];

  const supabase = getDb();
  const { data: allBundles, error: bundleError } = await supabase
    .from("bundles")
    .select("*")
    .order("created_at", { ascending: false });

  if (bundleError || !allBundles || allBundles.length === 0) return [];

  const bundleIds = allBundles.map((b: any) => b.id);

  const { data: allItems, error: itemsError } = await supabase
    .from("bundle_items")
    .select(
      `
      id,
      bundle_id,
      access_plan,
      product:products(
        id,
        name,
        price,
        icon_url
      )
    `,
    )
    .in("bundle_id", bundleIds);

  const itemsByBundleId = new Map<string, BundleItem[]>();
  if (!itemsError && allItems) {
    allItems.forEach((item: any) => {
      const list = itemsByBundleId.get(item.bundle_id) || [];
      list.push(shapeBundleItem(item));
      itemsByBundleId.set(item.bundle_id, list);
    });
  }

  return allBundles.map((bundle: any) => ({
    id: bundle.id,
    name: bundle.name,
    slug: bundle.slug,
    description: bundle.description,
    bundlePrice: bundle.bundle_price.toString(),
    originalPrice: bundle.original_price.toString(),
    iconUrl: bundle.icon_url,
    isActive: bundle.is_active,
    createdAt: new Date(bundle.created_at),
    items: itemsByBundleId.get(bundle.id) ?? [],
  }));
}

export async function getActiveBundles(): Promise<Bundle[]> {
  if (!hasDatabaseUrl()) return [];

  const supabase = getDb();
  const { data: activeBundles, error: bundleError } = await supabase
    .from("bundles")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (bundleError || !activeBundles || activeBundles.length === 0) return [];

  const bundleIds = activeBundles.map((b: any) => b.id);

  const { data: allItems, error: itemsError } = await supabase
    .from("bundle_items")
    .select(
      `
      id,
      bundle_id,
      access_plan,
      product:products(
        id,
        name,
        price,
        icon_url
      )
    `,
    )
    .in("bundle_id", bundleIds);

  const itemsByBundleId = new Map<string, BundleItem[]>();
  if (!itemsError && allItems) {
    allItems.forEach((item: any) => {
      const list = itemsByBundleId.get(item.bundle_id) || [];
      list.push(shapeBundleItem(item));
      itemsByBundleId.set(item.bundle_id, list);
    });
  }

  return activeBundles.map((bundle: any) => ({
    id: bundle.id,
    name: bundle.name,
    slug: bundle.slug,
    description: bundle.description,
    bundlePrice: bundle.bundle_price.toString(),
    originalPrice: bundle.original_price.toString(),
    iconUrl: bundle.icon_url,
    isActive: bundle.is_active,
    createdAt: new Date(bundle.created_at),
    items: itemsByBundleId.get(bundle.id) ?? [],
  }));
}

export async function getBundleBySlug(slug: string): Promise<Bundle | null> {
  if (!hasDatabaseUrl()) return null;

  const supabase = getDb();
  const { data: bundle, error: bundleError } = await supabase
    .from("bundles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (bundleError || !bundle) return null;

  const { data: items, error: itemsError } = await supabase
    .from("bundle_items")
    .select(
      `
      id,
      bundle_id,
      access_plan,
      product:products(
        id,
        name,
        price,
        icon_url
      )
    `,
    )
    .eq("bundle_id", bundle.id);

  const formattedItems: BundleItem[] =
    !itemsError && items ? items.map((i: any) => shapeBundleItem(i)) : [];

  return {
    id: bundle.id,
    name: bundle.name,
    slug: bundle.slug,
    description: bundle.description,
    bundlePrice: bundle.bundle_price.toString(),
    originalPrice: bundle.original_price.toString(),
    iconUrl: bundle.icon_url,
    isActive: bundle.is_active,
    createdAt: new Date(bundle.created_at),
    items: formattedItems,
  };
}

export async function createBundle(input: {
  name: string;
  slug: string;
  description?: string;
  bundlePrice: string;
  originalPrice: string;
  iconUrl?: string;
  isActive?: boolean;
  items: { productId: string; accessPlan: string }[];
}) {
  const supabase = getDb();

  const { data: createdBundle, error } = await supabase
    .from("bundles")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      bundle_price: Number(input.bundlePrice),
      original_price: Number(input.originalPrice),
      icon_url: input.iconUrl,
      is_active: input.isActive ?? true,
    })
    .select()
    .single();

  if (error || !createdBundle) throw new Error("Failed to create Bundle.");

  if (input.items.length > 0) {
    const itemsToInsert = input.items.map((item) => ({
      bundle_id: createdBundle.id,
      product_id: item.productId,
      access_plan: item.accessPlan as any,
    }));
    await supabase.from("bundle_items").insert(itemsToInsert as any);
  }

  return {
    id: createdBundle.id,
    name: createdBundle.name,
    slug: createdBundle.slug,
    description: createdBundle.description,
    bundlePrice: createdBundle.bundle_price.toString(),
    originalPrice: createdBundle.original_price.toString(),
    iconUrl: createdBundle.icon_url,
    isActive: createdBundle.is_active,
    createdAt: new Date(createdBundle.created_at),
  };
}

export async function updateBundle(
  id: string,
  input: {
    name?: string;
    slug?: string;
    description?: string;
    bundlePrice?: string;
    originalPrice?: string;
    iconUrl?: string;
    isActive?: boolean;
    items?: { productId: string; accessPlan: string }[];
  },
) {
  const supabase = getDb();

  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.description !== undefined)
    updateData.description = input.description;
  if (input.bundlePrice !== undefined)
    updateData.bundle_price = Number(input.bundlePrice);
  if (input.originalPrice !== undefined)
    updateData.original_price = Number(input.originalPrice);
  if (input.iconUrl !== undefined) updateData.icon_url = input.iconUrl;
  if (input.isActive !== undefined) updateData.is_active = input.isActive;

  const { data: updatedBundle, error } = await supabase
    .from("bundles")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error || !updatedBundle) throw new Error("Failed to update Bundle.");

  if (input.items !== undefined) {
    await supabase.from("bundle_items").delete().eq("bundle_id", id);
    if (input.items.length > 0) {
      const itemsToInsert = input.items.map((item) => ({
        bundle_id: id,
        product_id: item.productId,
        access_plan: item.accessPlan as any,
      }));
      await supabase.from("bundle_items").insert(itemsToInsert as any);
    }
  }

  return {
    id: updatedBundle.id,
    name: updatedBundle.name,
    slug: updatedBundle.slug,
    description: updatedBundle.description,
    bundlePrice: updatedBundle.bundle_price.toString(),
    originalPrice: updatedBundle.original_price.toString(),
    iconUrl: updatedBundle.icon_url,
    isActive: updatedBundle.is_active,
    createdAt: new Date(updatedBundle.created_at),
  };
}

export async function setBundleActive(id: string, isActive: boolean) {
  if (!hasDatabaseUrl()) return null;
  const supabase = getDb();
  const { data: updated, error } = await supabase
    .from("bundles")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) return null;

  return {
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    description: updated.description,
    bundlePrice: updated.bundle_price.toString(),
    originalPrice: updated.original_price.toString(),
    iconUrl: updated.icon_url,
    isActive: updated.is_active,
    createdAt: new Date(updated.created_at),
  };
}
