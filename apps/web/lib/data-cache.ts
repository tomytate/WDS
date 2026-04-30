import { unstable_cache } from "next/cache";
import {
  listActiveProducts as dbListActiveProducts,
  findProductBySlug as dbFindProductBySlug,
  getRecentCompletedOrders as dbGetRecentCompletedOrders,
  getStoreSettings as dbGetStoreSettings,
  getActiveBundles as dbGetActiveBundles,
} from "@wongdigital/db/storefront";

// Infinite cache (controlled purely by on-demand Webhook Revalidation)
const CACHE_TTL = 31536000; // 1 year essentially

export const getCachedActiveProducts = unstable_cache(
  async () => {
    return await dbListActiveProducts();
  },
  ["list-active-products"],
  {
    tags: ["store-products", "store-catalog"],
    revalidate: CACHE_TTL,
  }
);

export const getCachedProductBySlug = unstable_cache(
  async (slug: string) => {
    return await dbFindProductBySlug(slug);
  },
  ["find-product-by-slug"],
  {
    tags: ["store-products", "store-catalog"],
    revalidate: CACHE_TTL,
  }
);

export const getCachedRecentOrders = unstable_cache(
  async (limit: number) => {
    return await dbGetRecentCompletedOrders(limit);
  },
  ["recent-orders-list"],
  {
    tags: ["recent-orders"],
    revalidate: CACHE_TTL, // Invalidated by order creation webhooks if necessary
  }
);

export const getCachedStoreSettings = unstable_cache(
  async () => {
    return await dbGetStoreSettings();
  },
  ["store-settings-cache"],
  {
    tags: ["store-settings"],
    revalidate: CACHE_TTL,
  }
);

export const getCachedActiveBundles = unstable_cache(
  async () => {
    return await dbGetActiveBundles();
  },
  ["active-bundles-cache"],
  {
    tags: ["store-bundles", "store-catalog"],
    revalidate: CACHE_TTL,
  }
);
