import { normalizePrice } from "../pricing";
import { seedProducts } from "../seed-products";
import { defaultStoreSettings } from "../store-config";
import type {
  Customer,
  OrderProductLine,
  OrderStatus,
  OrderWithProducts,
  PaymentMethod,
  Product,
  StoreSettings,
} from "../types";

export const PRIMARY_SETTINGS_ID = "primary";
export const DEFAULT_DASHBOARD_PAGE_SIZE = 10;
export const MEMORY_SEED_VERSION = "2026-03-28-catalog-v13-social-logos-polish";
export const legacyProductSlugMap: Record<string, string> = {
  "chatgpt-solo": "chatgpt-pro",
  "facebook-followers-high-quality":
    "facebook-followers-high-quality-no-refill",
  "facebook-followers-low-quality": "facebook-followers-low-quality-no-refill",
  "facebook-group-members-bot-no-refill":
    "facebook-group-members-low-quality-no-refill",
  "facebook-group-members-bot-lifetime":
    "facebook-group-members-low-quality-lifetime",
  "facebook-post-share": "facebook-shares-no-refill",
  "facebook-post-likes-bot-no-refill":
    "facebook-post-likes-low-quality-no-refill",
  "facebook-react-high-quality": "facebook-post-reaction-global-high-quality",
  "facebook-react-low-quality": "facebook-post-reaction-like-no-refill",
  "facebook-video-reels-views": "facebook-plays-refill-30d",
  gemini: "google-ai-pro",
  "instagram-followers-old-accounts-ai-refill-30d":
    "instagram-followers-old-accounts-ai-refill",
  ms365: "microsoft-365",
  "tiktok-video-views-high-quality-no-refill":
    "tiktok-video-views-high-quality",
};

export type MemoryStore = {
  customers: Customer[];
  orders: OrderWithProducts[];
  products: Product[];
  settings: StoreSettings;
  seedVersion: string;
};

declare global {
  var __wongdigitalMemoryStore: MemoryStore | undefined;
}

export function cloneProduct(product: Product): Product {
  return { ...product, createdAt: new Date(product.createdAt) };
}

export function cloneStoreSettings(settings: StoreSettings): StoreSettings {
  return { ...settings };
}

export function createMemoryStore(): MemoryStore {
  return {
    customers: [],
    orders: [],
    products: seedProducts.map(cloneProduct),
    settings: cloneStoreSettings(defaultStoreSettings),
    seedVersion: MEMORY_SEED_VERSION,
  };
}

export function getMemoryStore() {
  if (
    !globalThis.__wongdigitalMemoryStore ||
    globalThis.__wongdigitalMemoryStore.seedVersion !== MEMORY_SEED_VERSION
  ) {
    globalThis.__wongdigitalMemoryStore = createMemoryStore();
  }

  const store = globalThis.__wongdigitalMemoryStore;
  if (!Array.isArray(store.customers)) store.customers = [];
  if (!Array.isArray(store.orders)) store.orders = [];
  if (!Array.isArray(store.products))
    store.products = seedProducts.map(cloneProduct);
  if (!store.settings)
    store.settings = cloneStoreSettings(defaultStoreSettings);
  if (!store.seedVersion) store.seedVersion = MEMORY_SEED_VERSION;

  return store;
}

export function mapProductRecord(record: {
  id: string;
  name: string;
  slug: string;
  price: string;
  category: string;
  description: string | null;
  iconUrl: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
}): Product {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    price: String(record.price),
    category: record.category,
    description: record.description,
    iconUrl: record.iconUrl,
    isActive: Boolean(record.isActive),
    createdAt: record.createdAt ?? new Date(),
  };
}

export function mapStoreSettingsRecord(record: {
  storeName: string;
  supportEmail: string;
  qrphNumber: string | null;
  qrphInstructions: string | null;
  binancePayId: string | null;
  binanceInstructions: string | null;
}): StoreSettings {
  return {
    storeName: record.storeName,
    supportEmail: record.supportEmail,
    qrphNumber: record.qrphNumber ?? defaultStoreSettings.qrphNumber,
    qrphInstructions:
      record.qrphInstructions ?? defaultStoreSettings.qrphInstructions,
    binancePayId: record.binancePayId ?? defaultStoreSettings.binancePayId,
    binanceInstructions:
      record.binanceInstructions ?? defaultStoreSettings.binanceInstructions,
  };
}

export function normalizeMoney(value: string | number | null | undefined) {
  return normalizePrice(typeof value === "number" ? value : Number(value ?? 0));
}

export function sumItemPrices(items: Array<{ unitPrice: string | number }>) {
  return items
    .reduce((sum, item) => sum + Number(item.unitPrice), 0)
    .toFixed(2);
}

export function calculateGrandTotal(subtotalPrice: string, tipAmount: string) {
  return (Number(subtotalPrice) + Number(tipAmount)).toFixed(2);
}

export function normalizePage(value?: number) {
  if (!value || Number.isNaN(value) || value < 1) return 1;
  return Math.floor(value);
}

export function slugifyProductName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function getSlugCandidates(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  const aliasSlug = legacyProductSlugMap[normalizedSlug];
  return aliasSlug ? [normalizedSlug, aliasSlug] : [normalizedSlug];
}

export function sortOrdersByNewest(items: OrderWithProducts[]) {
  return [...items].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
  );
}

export function filterOrdersByQuery(
  items: OrderWithProducts[],
  query?: string,
) {
  const normalizedQuery = query?.trim().toLowerCase();
  if (!normalizedQuery) return items;
  return items.filter((order) =>
    [
      order.orderCode,
      order.customerEmail,
      order.customerName,
      order.products.map((product) => product.name).join(" "),
      order.notes ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );
}

export function filterOrdersByStatus(
  items: OrderWithProducts[],
  status?: OrderStatus | "all",
) {
  if (!status || status === "all") return items;
  return items.filter((order) => order.status === status);
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const currentPage = normalizePage(page);
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const offset = (safePage - 1) * pageSize;
  return {
    currentPage: safePage,
    totalCount,
    totalPages,
    items: items.slice(offset, offset + pageSize),
  };
}
