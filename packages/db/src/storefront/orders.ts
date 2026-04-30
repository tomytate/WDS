import { getDb, hasDatabaseUrl } from "../client";
import {
  getAccessPlanPrice,
  getProductSelectionMode,
  getServiceProductConfig,
  getServiceProductPrice,
  isValidServiceQuantity,
  isValidServiceReaction,
} from "../pricing";

import type {
  AccessPlan,
  DashboardOrdersResult,
  DashboardOverview,
  OrderProductLine,
  OrderStatus,
  OrderWithProducts,
  PaymentMethod,
  Product,
} from "../types";
import {
  calculateGrandTotal,
  DEFAULT_DASHBOARD_PAGE_SIZE,
  filterOrdersByQuery,
  filterOrdersByStatus,
  getMemoryStore,
  normalizeMoney,
  normalizePage,
  paginateItems,
  sortOrdersByNewest,
  sumItemPrices,
  mapProductRecord,
} from "./common";
import { upsertCustomerDb, upsertCustomerMemory } from "./customers";
import { findProductsByIds } from "./products";
import { validatePromoCode } from "./promos";

export type CreateOrderInput = {
  orderCode: string;
  items: Array<{
    productId: string;
    accessPlan?: AccessPlan;
    quantity?: number;
    serviceOption?: string;
    targetUrl?: string;
  }>;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  tipAmount: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  receiptPath?: string;
  promoCode?: string;
  bundleId?: string;
  notes?: string;
};

export type OrderRow = {
  id: string;
  orderCode: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  tipAmount: string | number | null;
  totalPrice: string | number | null;
  promoCodeId?: string | null;
  discountAmount?: string | number | null;
  paymentMethod: PaymentMethod;
  paymentReference: string | null;
  receiptPath: string | null;
  notes: string | null;
  status: OrderStatus | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export function buildManualProviderState() {
  return {
    fulfillmentProvider: "manual" as const,
    providerServiceId: null,
    providerOrderId: null,
    providerStatus: null,
    providerCharge: null,
    providerCurrency: null,
    providerStartCount: null,
    providerRemains: null,
    providerError: null,
    providerLastCheckedAt: null,
  };
}

export function buildServiceProviderState(input: {
  product: Product;
  serviceOption: string | null;
  selectionMode: OrderProductLine["selectionMode"];
}) {
  return {
    fulfillmentProvider: "manual" as const,
    providerServiceId: null,
    providerOrderId: null,
    providerStatus: null,
    providerCharge: null,
    providerCurrency: null,
    providerStartCount: null,
    providerRemains: null,
    providerError: null,
    providerLastCheckedAt: null,
  };
}

export function buildOrderItems(
  input: Array<{
    productId: string;
    accessPlan?: AccessPlan;
    quantity?: number;
    serviceOption?: string;
    targetUrl?: string;
  }>,
  matchedProducts: Product[],
) {
  const productById = new Map(
    matchedProducts.map((product) => [product.id, product]),
  );

  return input.map((entry, index) => {
    const product = productById.get(entry.productId);

    if (!product)
      throw new Error("One or more selected products could not be found.");

    const selectionMode = getProductSelectionMode(product);

    if (selectionMode === "service") {
      const config = getServiceProductConfig(product);

      if (!config)
        throw new Error(
          "Service configuration could not be found for one of the selected products.",
        );

      const quantity = Number(entry.quantity ?? config.quantities[0]);

      if (!isValidServiceQuantity(product, quantity))
        throw new Error(`Choose a valid quantity for ${product.name}.`);

      const serviceOption = entry.serviceOption?.trim().toLowerCase() || null;

      if (config.requiresReaction && !isValidServiceReaction(serviceOption)) {
        throw new Error(`Choose a valid reaction type for ${product.name}.`);
      }

      return {
        id: `line_${index + 1}_${product.id}`,
        productId: product.id,
        selectionMode,
        accessPlan: "one_year",
        quantity,
        serviceOption,
        targetUrl: entry.targetUrl?.trim() || null,
        unitPrice: getServiceProductPrice(product, quantity),
        ...buildServiceProviderState({ product, serviceOption, selectionMode }),
        product,
      } satisfies OrderProductLine;
    }

    if (selectionMode === "package") {
      return {
        id: `line_${index + 1}_${product.id}`,
        productId: product.id,
        selectionMode,
        accessPlan: "one_year", // Irrelevant for packages but required by type
        quantity: entry.quantity ?? 1,
        serviceOption: entry.serviceOption?.trim() || null,
        targetUrl: entry.targetUrl?.trim() || null,
        unitPrice: product.price, // Base package price from DB
        ...buildManualProviderState(),
        product,
      } satisfies OrderProductLine;
    }

    return {
      id: `line_${index + 1}_${product.id}`,
      productId: product.id,
      selectionMode,
      accessPlan: entry.accessPlan ?? "one_year",
      quantity: 1,
      serviceOption: null,
      targetUrl: null,
      unitPrice: getAccessPlanPrice(
        product,
        product.price,
        entry.accessPlan ?? "one_year",
      ),
      ...buildManualProviderState(),
      product,
    } satisfies OrderProductLine;
  });
}

export async function hydrateOrderRows(records: OrderRow[]) {
  if (records.length === 0) return [];

  const supabase = getDb();
  const orderIdList = records.map((record) => record.id);

  const { data: itemRecords, error } = await supabase
    .from("order_items")
    .select(`*, product:products(*)`)
    .in("order_id", orderIdList);

  const itemsByOrderId = new Map<string, OrderProductLine[]>();

  if (itemRecords && itemRecords.length > 0) {
    itemRecords.forEach((record: any) => {
      const current = itemsByOrderId.get(record.order_id) ?? [];
      const productObj = mapProductRecord({
        id: record.product.id,
        name: record.product.name,
        slug: record.product.slug,
        price: record.product.price.toString(),
        category: record.product.category,
        description: record.product.description,
        iconUrl: record.product.icon_url,
        isActive: record.product.is_active,
        createdAt: new Date(record.product.created_at),
      });

      current.push({
        id: record.id,
        productId: record.product.id,
        selectionMode: getProductSelectionMode(productObj),
        accessPlan: record.access_plan as any,
        quantity: record.quantity,
        serviceOption: record.service_option,
        targetUrl: record.target_url,
        unitPrice: normalizeMoney(record.unit_price),
        fulfillmentProvider: "manual",
        providerServiceId: record.provider_service_id,
        providerOrderId: record.provider_order_id,
        providerStatus: record.provider_status,
        providerCharge: record.provider_charge,
        providerCurrency: record.provider_currency,
        providerStartCount: record.provider_start_count,
        providerRemains: record.provider_remains,
        providerError: record.provider_error,
        providerLastCheckedAt: record.provider_last_checked_at ?? null,
        product: productObj,
      });
      itemsByOrderId.set(record.order_id, current);
    });
  }

  return records.map((record) => {
    const selectedItems = itemsByOrderId.get(record.id) ?? [];
    const primaryProduct = selectedItems[0]?.product;

    if (!primaryProduct)
      throw new Error(`Order ${record.orderCode} has no order items.`);

    const selectedProducts = selectedItems.map((item) => item.product);
    const subtotalPrice = sumItemPrices(selectedItems);
    const tipAmount = normalizeMoney(record.tipAmount);

    return {
      id: record.id,
      orderCode: record.orderCode,
      customerId: record.customerId ?? "",
      customerName: record.customerName,
      customerEmail: record.customerEmail,
      customerPhone: record.customerPhone,
      tipAmount,
      totalPrice: record.totalPrice
        ? normalizeMoney(record.totalPrice)
        : calculateGrandTotal(subtotalPrice, tipAmount),
      promoCodeId: record.promoCodeId ?? null,
      discountAmount: normalizeMoney(record.discountAmount ?? "0"),
      paymentMethod: record.paymentMethod,
      paymentReference: record.paymentReference,
      receiptPath: record.receiptPath,
      notes: record.notes,
      status: (record.status ?? "pending") as OrderStatus,
      createdAt: record.createdAt ?? new Date(),
      updatedAt: record.updatedAt ?? new Date(),
      product: primaryProduct,
      items: selectedItems,
      products: selectedProducts,
      subtotalPrice,
    } satisfies OrderWithProducts;
  });
}

export async function createOrderRecord(input: CreateOrderInput) {
  const normalizedItems = input.items.filter((item) => item.productId);
  const uniqueProductIds = Array.from(
    new Set(normalizedItems.map((item) => item.productId)),
  );

  if (normalizedItems.length === 0 || uniqueProductIds.length === 0)
    throw new Error("Select at least one product.");
  if (normalizedItems.length !== uniqueProductIds.length)
    throw new Error("Each product can only be selected once per order.");

  const selectedProducts = await findProductsByIds(uniqueProductIds);
  if (selectedProducts.length !== uniqueProductIds.length)
    throw new Error("One or more selected products could not be found.");

  const selectedItems = buildOrderItems(normalizedItems, selectedProducts);
  const primaryProduct = selectedItems[0]?.product;
  if (!primaryProduct) throw new Error("Select at least one product.");

  if (
    selectedItems.some(
      (item) => item.selectionMode === "service" && !item.targetUrl?.trim(),
    )
  ) {
    throw new Error(
      "Each Facebook service item needs its own target URL before submission.",
    );
  }

  let subtotalPrice = sumItemPrices(selectedItems);
  const tipAmount = normalizeMoney(input.tipAmount);

  let discountAmount = 0;
  let unformattedDiscount = "0";
  let promoCodeId: string | null = null;
  let validatedPromo: any = null;

  if (input.bundleId && hasDatabaseUrl()) {
    const supabase = getDb();
    const { data: bundle } = await supabase
      .from("bundles")
      .select("*")
      .eq("id", input.bundleId)
      .limit(1)
      .maybeSingle();

    // Auto-apply Bundle price discount
    if (bundle && bundle.is_active) {
      const dbBasePrice = Number(subtotalPrice);
      const bundlePrice = Number(bundle.bundle_price);
      if (dbBasePrice > bundlePrice) {
        discountAmount += dbBasePrice - bundlePrice;
        subtotalPrice = String(bundlePrice);
      }
    }
  }

  if (input.promoCode) {
    const numericSubtotal = Number(subtotalPrice);
    const result = await validatePromoCode(input.promoCode, numericSubtotal);

    if (!result.valid) {
      throw new Error(result.error || "Invalid promo code.");
    }

    if (result.promo) {
      promoCodeId = result.promo.id;
      discountAmount = result.discountAmount || 0;
      unformattedDiscount = discountAmount.toFixed(2);
      validatedPromo = result.promo;
    }
  }

  const rawTotal = calculateGrandTotal(subtotalPrice, tipAmount);
  const totalPrice = Math.max(0, Number(rawTotal) - discountAmount).toFixed(2);

  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    const customer = await upsertCustomerMemory({
      name: input.customerName,
      email: input.customerEmail,
      phone: input.customerPhone,
    });
    const nextStatus = "pending";

    const order: OrderWithProducts = {
      id: `order_${store.orders.length + 1}`,
      orderCode: input.orderCode,
      customerId: customer.id,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone ?? null,
      tipAmount,
      totalPrice,
      promoCodeId,
      discountAmount: unformattedDiscount,
      paymentMethod: input.paymentMethod,
      paymentReference: input.paymentReference ?? null,
      receiptPath: input.receiptPath ?? null,
      notes: input.notes?.trim() || null,
      status: nextStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
      product: primaryProduct,
      items: selectedItems,
      products: selectedItems.map((item) => item.product),
      subtotalPrice,
    };

    store.orders.unshift(order);
    return order;
  }

  const customer = await upsertCustomerDb({
    name: input.customerName,
    email: input.customerEmail,
    phone: input.customerPhone,
  });

  const supabase = getDb();

  const orderData = {
    order_code: input.orderCode,
    customer_id: customer.id,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone ?? null,
    tip_amount: Number(tipAmount),
    total_price: Number(totalPrice),
    promo_code_id: promoCodeId,
    discount_amount: Number(unformattedDiscount),
    payment_method: input.paymentMethod,
    payment_reference: input.paymentReference ?? null,
    receipt_path: input.receiptPath ?? null,
    notes: input.notes?.trim() || null,
    status: "pending",
  };

  const itemsData = selectedItems.map((item) => ({
    product_id: item.productId,
    access_plan: item.accessPlan,
    quantity: item.quantity,
    service_option: item.serviceOption,
    target_url: item.targetUrl,
    unit_price: Number(item.unitPrice),
    fulfillment_provider: item.fulfillmentProvider,
    provider_service_id: item.providerServiceId,
    provider_order_id: item.providerOrderId,
    provider_status: item.providerStatus,
    provider_charge: item.providerCharge,
    provider_currency: item.providerCurrency,
    provider_start_count: item.providerStartCount,
    provider_remains: item.providerRemains,
    provider_error: item.providerError,
    provider_last_checked_at: item.providerLastCheckedAt,
  }));

  const { data: created, error: rpcError } = await supabase.rpc(
    "create_order_atomic",
    {
      p_order_data: orderData,
      p_items_data: itemsData,
    }
  );

  if (rpcError || !created) {
    const detail = rpcError?.message || rpcError?.details || "Unknown database error";
    console.error("create_order_atomic failed:", rpcError);
    throw new Error(`Order creation failed: ${detail}`);
  }

  const nextStatus: OrderStatus = (created.status as OrderStatus) ?? "pending";
  const touchedAt = new Date();

  return {
    id: created.id,
    orderCode: created.order_code,
    customerId: created.customer_id ?? customer.id,
    customerName: created.customer_name,
    customerEmail: created.customer_email,
    customerPhone: created.customer_phone,
    tipAmount: normalizeMoney(created.tip_amount),
    totalPrice: normalizeMoney(created.total_price ?? Number(totalPrice)),
    promoCodeId: created.promo_code_id ?? null,
    discountAmount: normalizeMoney(created.discount_amount ?? 0),
    paymentMethod: created.payment_method as any,
    paymentReference: created.payment_reference,
    receiptPath: created.receipt_path,
    notes: created.notes,
    status: nextStatus,
    createdAt: created.created_at ? new Date(created.created_at) : new Date(),
    updatedAt: touchedAt,
    product: primaryProduct,
    items: selectedItems,
    products: selectedItems.map((item) => item.product),
    subtotalPrice,
  } satisfies OrderWithProducts;
}

export async function getOrderById(
  orderId: string,
): Promise<OrderWithProducts | null> {
  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    return store.orders.find((order) => order.id === orderId) ?? null;
  }

  const supabase = getDb();
  const { data: row, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !row) return null;

  const hydrated = await hydrateOrderRows([
    {
      id: row.id,
      orderCode: row.order_code,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      tipAmount: row.tip_amount,
      totalPrice: row.total_price,
      promoCodeId: row.promo_code_id,
      discountAmount: row.discount_amount,
      paymentMethod: row.payment_method as any,
      paymentReference: row.payment_reference,
      receiptPath: row.receipt_path,
      notes: row.notes,
      status: row.status as OrderStatus,
      createdAt: row.created_at ? new Date(row.created_at) : null,
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    },
  ]);

  return hydrated[0] ?? null;
}

export async function lookupOrdersByCode(orderCode: string) {
  if (!hasDatabaseUrl()) {
    return getMemoryStore().orders.filter(
      (order) => order.orderCode.toLowerCase() === orderCode.toLowerCase(),
    );
  }

  const supabase = getDb();
  const { data: rows, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_code", orderCode)
    .limit(5);
  if (error || !rows) return [];

  return hydrateOrderRows(
    rows.map((row: any) => ({
      id: row.id,
      orderCode: row.order_code,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      tipAmount: row.tip_amount,
      totalPrice: row.total_price,
      promoCodeId: row.promo_code_id,
      discountAmount: row.discount_amount,
      paymentMethod: row.payment_method as any,
      paymentReference: row.payment_reference,
      receiptPath: row.receipt_path,
      notes: row.notes,
      status: row.status as OrderStatus,
      createdAt: row.created_at ? new Date(row.created_at) : null,
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    })),
  );
}

export async function lookupOrdersByEmail(email: string) {
  if (!hasDatabaseUrl()) {
    return getMemoryStore().orders.filter(
      (order) => order.customerEmail.toLowerCase() === email.toLowerCase(),
    );
  }

  const supabase = getDb();
  const { data: rows, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_email", email)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error || !rows) return [];

  return hydrateOrderRows(
    rows.map((row: any) => ({
      id: row.id,
      orderCode: row.order_code,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      tipAmount: row.tip_amount,
      totalPrice: row.total_price,
      promoCodeId: row.promo_code_id,
      discountAmount: row.discount_amount,
      paymentMethod: row.payment_method as any,
      paymentReference: row.payment_reference,
      receiptPath: row.receipt_path,
      notes: row.notes,
      status: row.status as OrderStatus,
      createdAt: row.created_at ? new Date(row.created_at) : null,
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    })),
  );
}

export async function syncBoostingStatusesForOrderIds(orderIds: string[]) {
  const uniqueOrderIds = Array.from(new Set(orderIds.filter(Boolean)));

  if (uniqueOrderIds.length === 0) return [];

  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    return store.orders.filter((order) => uniqueOrderIds.includes(order.id));
  }

  const supabase = getDb();
  const { data: rows, error } = await supabase
    .from("orders")
    .select("*")
    .in("id", uniqueOrderIds);
  if (error || !rows) return [];

  return hydrateOrderRows(
    rows.map((row: any) => ({
      id: row.id,
      orderCode: row.order_code,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      tipAmount: row.tip_amount,
      totalPrice: row.total_price,
      promoCodeId: row.promo_code_id,
      discountAmount: row.discount_amount,
      paymentMethod: row.payment_method as any,
      paymentReference: row.payment_reference,
      receiptPath: row.receipt_path,
      notes: row.notes,
      status: row.status as OrderStatus,
      createdAt: row.created_at ? new Date(row.created_at) : null,
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    })),
  );
}

export async function listOrderRowsForDashboard(input: {
  page?: number;
  pageSize?: number;
  query?: string;
  status?: OrderStatus | "all";
}) {
  const supabase = getDb();
  const pageSize = input.pageSize ?? DEFAULT_DASHBOARD_PAGE_SIZE;
  const currentPage = normalizePage(input.page);
  const normalizedQuery = input.query?.trim();

  let query = supabase.from("orders").select("*", { count: "exact" });

  if (input.status && input.status !== "all")
    query = query.eq("status", input.status);
  if (normalizedQuery) {
    query = query.or(
      `order_code.ilike.%${normalizedQuery}%,customer_email.ilike.%${normalizedQuery}%,customer_name.ilike.%${normalizedQuery}%`,
    );
  }

  const safePage = Math.max(1, currentPage);
  const offset = (safePage - 1) * pageSize;

  const {
    data: dbRows,
    count,
    error,
  } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeReturnPage = Math.min(currentPage, totalPages);

  const rows = (dbRows || []).map((row: any) => ({
    id: row.id,
    orderCode: row.order_code,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    tipAmount: row.tip_amount,
    totalPrice: row.total_price,
    promoCodeId: row.promo_code_id,
    discountAmount: row.discount_amount,
    paymentMethod: row.payment_method as any,
    paymentReference: row.payment_reference,
    receiptPath: row.receipt_path,
    notes: row.notes,
    status: row.status as OrderStatus,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  }));

  return {
    currentPage: safeReturnPage,
    pageSize,
    totalCount,
    totalPages,
    rows,
  };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    const order = store.orders.find((entry) => entry.id === orderId);
    if (!order) throw new Error("Order could not be found.");
    order.status = status;
    order.updatedAt = new Date();
    return order;
  }

  const supabase = getDb();
  const { data: updated, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single();
  if (error || !updated) throw new Error("Order could not be found.");

  const hydrated = await getOrderById(orderId);
  if (!hydrated) throw new Error("Order could not be found.");

  return hydrated;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    const allOrders = sortOrdersByNewest(store.orders);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return {
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter((order) => order.status === "pending")
        .length,
      revenueThisMonth: allOrders
        .filter((order) => order.createdAt >= monthStart)
        .reduce((sum, order) => sum + Number(order.totalPrice), 0)
        .toFixed(2),
      totalCustomers: store.customers.length,
      totalProducts: store.products.length,
      activeProducts: store.products.filter((product) => product.isActive)
        .length,
      recentOrders: allOrders.slice(0, 10),
    };
  }

  const supabase = getDb();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalCustomers },
    { count: totalProducts },
    { count: activeProducts },
    { data: recentRows },
    { data: monthRows },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("orders")
      .select("*")
      .gte("created_at", monthStart.toISOString())
      .order("created_at", { ascending: false }),
  ]);

  const mapRow = (row: any) => ({
    id: row.id,
    orderCode: row.order_code,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    tipAmount: row.tip_amount,
    totalPrice: row.total_price,
    promoCodeId: row.promo_code_id,
    discountAmount: row.discount_amount,
    paymentMethod: row.payment_method as any,
    paymentReference: row.payment_reference,
    receiptPath: row.receipt_path,
    notes: row.notes,
    status: row.status as OrderStatus,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  });

  const [recentOrders, monthOrders] = await Promise.all([
    hydrateOrderRows((recentRows || []).map(mapRow)),
    hydrateOrderRows((monthRows || []).map(mapRow)),
  ]);

  return {
    totalOrders: totalOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    revenueThisMonth: monthOrders
      .reduce((sum, order) => sum + Number(order.totalPrice), 0)
      .toFixed(2),
    totalCustomers: totalCustomers ?? 0,
    totalProducts: totalProducts ?? 0,
    activeProducts: activeProducts ?? 0,
    recentOrders,
  };
}

export async function listDashboardOrders(
  input: {
    page?: number;
    pageSize?: number;
    query?: string;
    status?: OrderStatus | "all";
  } = {},
): Promise<DashboardOrdersResult> {
  const pageSize = input.pageSize ?? DEFAULT_DASHBOARD_PAGE_SIZE;

  if (!hasDatabaseUrl()) {
    const filteredOrders = filterOrdersByStatus(
      filterOrdersByQuery(
        sortOrdersByNewest(getMemoryStore().orders),
        input.query,
      ),
      input.status,
    );
    const paginated = paginateItems(filteredOrders, input.page ?? 1, pageSize);
    return {
      orders: paginated.items,
      currentPage: paginated.currentPage,
      pageSize,
      totalCount: paginated.totalCount,
      totalPages: paginated.totalPages,
    };
  }

  const rowsPage = await listOrderRowsForDashboard(input);
  const hydratedOrders = await hydrateOrderRows(rowsPage.rows);

  return {
    orders: hydratedOrders,
    currentPage: rowsPage.currentPage,
    pageSize: rowsPage.pageSize,
    totalCount: rowsPage.totalCount,
    totalPages: rowsPage.totalPages,
  };
}

export async function getOrdersForExport(orderIds: string[]) {
  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    return store.orders
      .filter((o) => orderIds.includes(o.id))
      .map((o) => ({
        ...o,
        productNames: [
          o.product.name,
          ...o.items.slice(1).map((i) => i.product.name),
        ],
      }));
  }

  const supabase = getDb();
  const { data: rawData, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      customer:customers(*),
      items:order_items(
        *,
        product:products(*)
      )
    `,
    )
    .in("id", orderIds);

  if (error || !rawData) return [];

  return rawData.map((row: any) => ({
    ...row,
    customerName: row.customer?.name || "",
    customerEmail: row.customer?.email || "",
    customerPhone: row.customer?.phone || "",
    productNames: (row.items || [])
      .map((item: any) => item.product?.name)
      .filter(Boolean),
  }));
}

export async function getRecentCompletedOrders(limit: number = 20) {
  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    return store.orders
      .filter((o) => o.status === "completed")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map((o) => ({
        id: o.id,
        customerName: o.customerName,
        productName: o.product.name,
        timeAgo: Math.floor((Date.now() - o.createdAt.getTime()) / 60000),
      }));
  }

  const supabase = getDb();
  const { data: records, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      customer_name,
      created_at,
      items:order_items(
        product:products(name)
      )
    `,
    )
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !records) return [];

  return records.map((record: any) => ({
    id: record.id,
    customerName: record.customer_name || "A customer",
    productName: record.items?.[0]?.product?.name || "Premium Item",
    timeAgo: Math.max(
      1,
      Math.floor((Date.now() - new Date(record.created_at).getTime()) / 60000),
    ),
  }));
}

export async function deleteOrderRecord(orderId: string) {
  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    store.orders = store.orders.filter((o) => o.id !== orderId);
    return true;
  }

  const supabase = getDb();
  // Supabase takes care of cascade deletes on foreign keys depending on DB setup
  await supabase.from("order_items").delete().eq("order_id", orderId);
  await supabase.from("orders").delete().eq("id", orderId);
  return true;
}


