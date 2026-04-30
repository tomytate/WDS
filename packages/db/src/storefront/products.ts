import { getDb, hasDatabaseUrl } from "../client";
import type { Product } from "../types";
import {
  cloneProduct,
  getMemoryStore,
  getSlugCandidates,
  mapProductRecord,
  normalizeMoney,
  slugifyProductName,
} from "./common";

export async function findProductsByIds(productIds: string[]) {
  const uniqueProductIds = Array.from(new Set(productIds));

  if (uniqueProductIds.length === 0) return [];

  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    return uniqueProductIds
      .map(
        (productId) =>
          store.products.find(
            (product) => product.id === productId && product.isActive,
          ) ?? null,
      )
      .filter((product): product is Product => product !== null);
  }

  const supabase = getDb();
  const { data: records, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .in("id", uniqueProductIds);

  if (error || !records) return [];

  const mappedProducts = records.map((record: any) =>
    mapProductRecord({
      id: record.id,
      name: record.name,
      slug: record.slug,
      price: record.price.toString(),
      category: record.category,
      description: record.description,
      iconUrl: record.icon_url,
      isActive: record.is_active,
      createdAt: new Date(record.created_at),
    }),
  );

  const productById = new Map(
    mappedProducts.map((product: any) => [product.id, product]),
  );
  return uniqueProductIds
    .map((productId: string) => productById.get(productId) ?? null)
    .filter((product): product is Product => product !== null);
}

const PRODUCT_PRIORITY_ORDER = [
  "chatgpt-pro",
  "google-ai-pro",
  "chatgpt-go",
  "chatgpt-renew-plus",
  "claude-pro",
  "claude-max-5x",
  "claude-max-20x",
  "figma-edu",
  "figma-pro",
  "perplexity-pro",
  "capcut-shared",
  "netflix",
  "cursor-pro-own",
  "cursor-pro-plus-own",
  "cursor-ultra-own",
  "cursor-pro-presupplied",
  "jetbrains-edu",
  "super-grok",
  "super-grok-6m",
  "expressvpn-pro",
  "pia-vpn",
];

function sortByPriority(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const ai = PRODUCT_PRIORITY_ORDER.indexOf(a.slug);
    const bi = PRODUCT_PRIORITY_ORDER.indexOf(b.slug);
    const ap = ai === -1 ? Infinity : ai;
    const bp = bi === -1 ? Infinity : bi;
    if (ap !== bp) return ap - bp;
    return a.name.localeCompare(b.name);
  });
}

export async function listActiveProducts() {
  if (!hasDatabaseUrl()) {
    return sortByPriority(
      getMemoryStore().products.filter((product) => product.isActive).map(cloneProduct)
    );
  }

  const supabase = getDb();
  const { data: records, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  if (error || !records) return [];
  const mapped = records.map((r: any) =>
    mapProductRecord({
      ...r,
      price: r.price.toString(),
      iconUrl: r.icon_url,
      isActive: r.is_active,
      createdAt: new Date(r.created_at),
    }),
  );
  return sortByPriority(mapped);
}

export async function listAllProducts() {
  if (!hasDatabaseUrl()) {
    return [...getMemoryStore().products]
      .sort((left, right) => {
        if (left.isActive !== right.isActive)
          return Number(right.isActive) - Number(left.isActive);
        return left.name.localeCompare(right.name);
      })
      .map(cloneProduct);
  }

  const supabase = getDb();
  const { data: records, error } = await supabase
    .from("products")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (error || !records) return [];
  return records.map((r: any) =>
    mapProductRecord({
      ...r,
      price: r.price.toString(),
      iconUrl: r.icon_url,
      isActive: r.is_active,
      createdAt: new Date(r.created_at),
    }),
  );
}

export async function findProductBySlug(slug: string) {
  const slugCandidates = getSlugCandidates(slug);

  if (!hasDatabaseUrl()) {
    return (
      getMemoryStore().products.find(
        (product) => slugCandidates.includes(product.slug) && product.isActive,
      ) ?? null
    );
  }

  const supabase = getDb();
  const { data: records, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .in("slug", slugCandidates)
    .limit(slugCandidates.length);

  if (error || !records || records.length === 0) return null;

  const record = slugCandidates
    .map(
      (candidateSlug) =>
        records.find((entry: any) => entry.slug === candidateSlug) ?? null,
    )
    .find((entry) => entry !== null);
  return record
    ? mapProductRecord({
        ...record,
        price: record.price.toString(),
        iconUrl: record.icon_url,
        isActive: record.is_active,
        createdAt: new Date(record.created_at),
      })
    : null;
}

export async function findProductById(productId: string) {
  if (!hasDatabaseUrl()) {
    return (
      getMemoryStore().products.find(
        (product) => product.id === productId && product.isActive,
      ) ?? null
    );
  }

  const supabase = getDb();
  const { data: record, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("id", productId)
    .maybeSingle();

  if (error || !record) return null;
  return mapProductRecord({
    ...record,
    price: record.price.toString(),
    iconUrl: record.icon_url,
    isActive: record.is_active,
    createdAt: new Date(record.created_at),
  });
}

export async function searchProducts(query: string) {
  if (!hasDatabaseUrl()) {
    return getMemoryStore().products.filter((product) =>
      `${product.name} ${product.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }

  const supabase = getDb();
  const { data: records, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .ilike("name", `%${query}%`)
    .order("name", { ascending: true });

  if (error || !records) return [];
  return records.map((r: any) =>
    mapProductRecord({
      ...r,
      price: r.price.toString(),
      iconUrl: r.icon_url,
      isActive: r.is_active,
      createdAt: new Date(r.created_at),
    }),
  );
}

export async function saveProduct(input: {
  id?: string;
  name: string;
  slug?: string;
  price: string;
  category: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
}) {
  const normalizedName = input.name.trim();
  const normalizedSlug = slugifyProductName(
    input.slug?.trim() || normalizedName,
  );
  const normalizedPrice = normalizeMoney(input.price);

  if (!normalizedName) throw new Error("Product name is required.");
  if (!normalizedSlug) throw new Error("Product slug is required.");
  if (!input.category.trim()) throw new Error("Product category is required.");

  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    const duplicate = store.products.find(
      (product) => product.slug === normalizedSlug && product.id !== input.id,
    );
    if (duplicate) throw new Error("A product with that slug already exists.");

    if (input.id) {
      const existing = store.products.find(
        (product) => product.id === input.id,
      );
      if (!existing) throw new Error("Product could not be found.");

      existing.name = normalizedName;
      existing.slug = normalizedSlug;
      existing.price = normalizedPrice;
      existing.category = input.category.trim();
      existing.description = input.description?.trim() || null;
      existing.iconUrl = input.iconUrl?.trim() || null;
      existing.isActive = input.isActive ?? existing.isActive;

      return cloneProduct(existing);
    }

    const created: Product = {
      id: crypto.randomUUID(),
      name: normalizedName,
      slug: normalizedSlug,
      price: normalizedPrice,
      category: input.category.trim(),
      description: input.description?.trim() || null,
      iconUrl: input.iconUrl?.trim() || null,
      isActive: input.isActive ?? true,
      createdAt: new Date(),
    };

    store.products.unshift(created);
    return cloneProduct(created);
  }

  const supabase = getDb();
  const { data: duplicate } = await supabase
    .from("products")
    .select("id")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (duplicate && duplicate.id !== input.id)
    throw new Error("A product with that slug already exists.");

  const dbInput = {
    name: normalizedName,
    slug: normalizedSlug,
    price: Number(normalizedPrice),
    category: input.category.trim(),
    description: input.description?.trim() || null,
    icon_url: input.iconUrl?.trim() || null,
    is_active: input.isActive ?? true,
  };

  if (input.id) {
    const { data: updated, error } = await supabase
      .from("products")
      .update(dbInput)
      .eq("id", input.id)
      .select()
      .single();

    if (error || !updated) throw new Error("Product could not be found.");
    return mapProductRecord({
      ...updated,
      price: updated.price.toString(),
      iconUrl: updated.icon_url,
      isActive: updated.is_active,
      createdAt: new Date(updated.created_at),
    });
  } else {
    const { data: created, error } = await supabase
      .from("products")
      .insert(dbInput)
      .select()
      .single();

    if (error || !created) throw new Error("Failed to create product.");
    return mapProductRecord({
      ...created,
      price: created.price.toString(),
      iconUrl: created.icon_url,
      isActive: created.is_active,
      createdAt: new Date(created.created_at),
    });
  }
}

export async function deleteProduct(productId: string) {
  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    const index = store.products.findIndex(
      (product) => product.id === productId,
    );

    if (index === -1) throw new Error("Product could not be found.");

    const [deleted] = store.products.splice(index, 1);
    if (!deleted) throw new Error("Product could not be found.");

    return cloneProduct(deleted);
  }

  const supabase = getDb();
  const { data: deleted, error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .select()
    .single();

  if (error || !deleted) throw new Error("Product could not be found.");

  return mapProductRecord({
    ...deleted,
    price: deleted.price.toString(),
    iconUrl: deleted.icon_url,
    isActive: deleted.is_active,
    createdAt: new Date(deleted.created_at),
  });
}

export async function setProductActive(productId: string, isActive: boolean) {
  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    const product = store.products.find((p) => p.id === productId);
    if (!product) throw new Error("Product not found");
    product.isActive = isActive;
    return cloneProduct(product);
  }

  const supabase = getDb();
  const { data: updated, error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId)
    .select()
    .single();

  if (error || !updated) throw new Error("Product could not be found.");

  return mapProductRecord({
    ...updated,
    price: updated.price.toString(),
    iconUrl: updated.icon_url,
    isActive: updated.is_active,
    createdAt: new Date(updated.created_at),
  });
}
