export type Product = {
  id: string;
  name: string;
  slug: string;
  price: string;
  category: string;
  description: string | null;
  iconUrl: string | null;
  isActive: boolean;
  createdAt: Date;
};

export type AccessPlan =
  | "one_month"
  | "three_months"
  | "six_months"
  | "one_year"
  | "two_years"
  | "lifetime";
export type OrderItemSelectionMode =
  | "subscription"
  | "service"
  | "package"
  | "addon";
export type FulfillmentProvider = "manual";
export type ServiceQuantity = 100 | 500 | 1000 | 10000 | 50000;
export type ServiceReaction =
  | "like"
  | "love"
  | "care"
  | "haha"
  | "wow"
  | "sad"
  | "angry";

export type PaymentMethod =
  | "gcash" // legacy — mapped to qrph
  | "qrph" // ✅ NOW — PH QR (GCash, Maya, banks)
  | "binance" // ✅ NOW — Binance Pay (crypto, global)
  | "alipay" // ✅ NOW — Alipay (GCash QR for Alipay-supported countries)
  | "wallet" // ✅ NOW — Wong Digital Wallet (1-click, instant)
  | "stripe" // 🔜 SOON
  | "paypal" // 🔜 SOON
  | "payoneer"; // 🔜 SOON

export type OrderStatus =
  | "pending"
  | "processing"
  | "delivered"
  | "completed"
  | "cancelled";

export type PromoDiscountType = "percentage" | "fixed";

export type PromoCode = {
  id: string;
  code: string;
  discountType: PromoDiscountType;
  discountValue: string;
  minOrderAmount: string | null;
  maxDiscountAmount: string | null;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
  startsAt: Date;
  expiresAt: Date | null;
  createdAt: Date;
};

export type BundleItem = {
  id: string;
  bundleId: string;
  accessPlan: AccessPlan;
  product: Pick<Product, "id" | "name" | "price"> & { iconUrl?: string | null };
};

export type Bundle = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bundlePrice: string;
  originalPrice: string;
  iconUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  items: BundleItem[];
};

export type ReviewStatus = "pending" | "approved" | "hidden";

export type Review = {
  id: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  content: string | null;
  status: ReviewStatus;
  orderId: string | null;
  createdAt: Date;
};

/**
 * A pending wallet deposit enriched with the joined customer's name/email
 * for admin review. Shape returned by `listPendingDeposits()`.
 */
export type WalletDeposit = WalletTransaction & {
  customerExt: { name: string; email: string } | null;
};

export type CustomerTier = "standard" | "gold" | "reseller";

export type Customer = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string | null;
  walletBalance: string;
  customerTier: CustomerTier;
  referralCode: string | null;
  referredBy: string | null;
  totalSpent: string;
  createdAt: Date;
};

/** Referral commission rates by customer tier */
export const REFERRAL_COMMISSION_RATES: Record<CustomerTier, number> = {
  standard: 0.05,  // 5%
  gold: 0.08,      // 8%
  reseller: 0.10,  // 10%
};

/** Tier upgrade thresholds in USDT total spend */
export const TIER_UPGRADE_THRESHOLDS: Record<CustomerTier, number> = {
  standard: 0,
  gold: 870,       // ~USDT 870 total spend → Gold
  reseller: 3480,  // ~USDT 3,480 total spend → Reseller
};

export type WalletTransactionType =
  | "deposit"
  | "purchase"
  | "refund"
  | "affiliate_credit";

export type WalletTransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled";

export type WalletTransaction = {
  id: string;
  customerId: string;
  transactionType: WalletTransactionType;
  amount: string;
  currency: string;
  status: WalletTransactionStatus;
  paymentMethod: string | null;
  referenceId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderRecord = {
  id: string;
  orderCode: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  tipAmount: string;
  totalPrice: string;
  promoCodeId: string | null;
  discountAmount: string;
  paymentMethod: PaymentMethod;
  paymentReference: string | null;
  receiptPath: string | null;
  notes: string | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderProductLine = {
  id: string;
  productId: string;
  selectionMode: OrderItemSelectionMode;
  fulfillmentProvider: FulfillmentProvider;
  accessPlan: AccessPlan;
  quantity: number;
  serviceOption: string | null;
  targetUrl: string | null;
  unitPrice: string;
  providerServiceId: string | null;
  providerOrderId: string | null;
  providerStatus: string | null;
  providerCharge: string | null;
  providerCurrency: string | null;
  providerStartCount: string | null;
  providerRemains: string | null;
  providerError: string | null;
  providerLastCheckedAt: Date | null;
  product: Product;
};

export type OrderWithProducts = OrderRecord & {
  product: Product;
  products: Product[];
  items: OrderProductLine[];
  subtotalPrice: string;
  totalPrice: string;
  promoCode?: PromoCode | null;
};

export type StoreSettings = {
  storeName: string;
  supportEmail: string;
  qrphNumber: string;
  qrphInstructions: string;
  binancePayId: string;
  binanceInstructions: string;
};

export type DashboardOverview = {
  totalOrders: number;
  pendingOrders: number;
  revenueThisMonth: string;
  totalCustomers: number;
  totalProducts: number;
  activeProducts: number;
  recentOrders: OrderWithProducts[];
};

export type DashboardOrdersResult = {
  orders: OrderWithProducts[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type DashboardCustomerSummary = {
  customer: Customer;
  orders: OrderWithProducts[];
  ordersCount: number;
  totalSpent: string;
  lastOrderAt: Date | null;
};

export type DashboardCustomersResult = {
  customers: DashboardCustomerSummary[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type ChatStatus = "open" | "resolved";
export type ChatSender = "customer" | "admin";

export type SupportChat = {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorEmail: string | null;
  discordThreadId: string | null;
  status: ChatStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type SupportMessage = {
  id: string;
  chatId: string;
  sender: ChatSender;
  content: string;
  createdAt: Date;
};

export type SupportChatWithMessages = SupportChat & {
  messages: SupportMessage[];
};
