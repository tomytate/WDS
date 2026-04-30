import { getAdminDb, getDb, hasDatabaseUrl } from "../client";
import type {
  Customer,
  DashboardCustomersResult,
  OrderWithProducts,
} from "../types";
import {
  DEFAULT_DASHBOARD_PAGE_SIZE,
  getMemoryStore,
  normalizePage,
  paginateItems,
  sortOrdersByNewest,
} from "./common";
import { hydrateOrderRows } from "./orders";

export async function upsertCustomerMemory(input: {
  name: string;
  email: string;
  phone?: string;
}) {
  const store = getMemoryStore();
  const existing = store.customers.find(
    (customer: any) => customer.email === input.email,
  );

  if (existing) {
    existing.name = input.name;
    existing.phone = input.phone ?? existing.phone;
    return existing;
  }

  const created: Customer = {
    id: `cust_${store.customers.length + 1}`,
    userId: null,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    walletBalance: "0.00",
    customerTier: "standard",
    referralCode: null,
    referredBy: null,
    totalSpent: "0.00",
    createdAt: new Date(),
  };

  store.customers.push(created);

  return created;
}

export async function upsertCustomerDb(input: {
  name: string;
  email: string;
  phone?: string;
}) {
  const supabase = getAdminDb();
  const { data: customer, error } = await supabase
    .from("customers")
    .upsert(
      {
        email: input.email,
        name: input.name,
        phone: input.phone ?? null,
      },
      { onConflict: "email" },
    )
    .select()
    .single();

  if (error || !customer) throw new Error("Failed to upsert customer.");

  return {
    id: customer.id,
    userId: customer.user_id ?? null,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    walletBalance: String(customer.wallet_balance ?? "0.00"),
    customerTier: customer.customer_tier ?? "standard",
    referralCode: customer.referral_code ?? null,
    referredBy: customer.referred_by ?? null,
    totalSpent: String(customer.total_spent ?? "0.00"),
    createdAt: new Date(customer.created_at),
  } satisfies Customer;
}

export async function listDashboardCustomers(
  input: {
    page?: number;
    pageSize?: number;
    query?: string;
  } = {},
): Promise<DashboardCustomersResult> {
  const normalizedQuery = input.query?.trim().toLowerCase();
  const pageSize = input.pageSize ?? DEFAULT_DASHBOARD_PAGE_SIZE;

  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    const customerList = store.customers.filter((customer: any) => {
      if (!normalizedQuery) {
        return true;
      }

      return [customer.name, customer.email, customer.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });

    const mappedCustomers = customerList
      .map((customer: any) => {
        const relatedOrders = sortOrdersByNewest(
          store.orders.filter(
            (order) =>
              order.customerId === customer.id ||
              order.customerEmail.toLowerCase() ===
                customer.email.toLowerCase(),
          ),
        );

        return {
          customer,
          orders: relatedOrders,
          ordersCount: relatedOrders.length,
          totalSpent: relatedOrders
            .reduce((sum, order) => sum + Number(order.totalPrice), 0)
            .toFixed(2),
          lastOrderAt: relatedOrders[0]?.createdAt ?? null,
        };
      })
      .sort((left: any, right: any) => {
        const leftTime =
          left.lastOrderAt?.getTime() ?? left.customer.createdAt.getTime();
        const rightTime =
          right.lastOrderAt?.getTime() ?? right.customer.createdAt.getTime();

        return rightTime - leftTime;
      });
    const paginatedCustomers = paginateItems(
      mappedCustomers,
      input.page ?? 1,
      pageSize,
    );

    return {
      customers: paginatedCustomers.items,
      currentPage: paginatedCustomers.currentPage,
      pageSize,
      totalCount: paginatedCustomers.totalCount,
      totalPages: paginatedCustomers.totalPages,
    };
  }

  const supabase = getDb();

  let query = supabase.from("customers").select("*", { count: "exact" });

  if (normalizedQuery) {
    query = query.or(
      `name.ilike.%${normalizedQuery}%,email.ilike.%${normalizedQuery}%`,
    );
  }

  const currentPageUnsafe = normalizePage(input.page);
  // Ensure we don't pass an invalid safe page yet so we do a head count
  const { count, error: countError } = await query.range(0, 0);

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPageUnsafe, totalPages);
  const offset = (safePage - 1) * pageSize;

  const { data: customerRows, error: fetchError } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (fetchError || !customerRows || customerRows.length === 0) {
    return {
      customers: [],
      currentPage: 1,
      pageSize,
      totalCount,
      totalPages,
    };
  }

  const customerIdList = customerRows.map((customer: any) => customer.id);

  // Fetch related orders
  const { data: orderRows, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .in("customer_id", customerIdList)
    .order("created_at", { ascending: false });

  const hydratedOrders =
    orderRows && !ordersError
      ? await hydrateOrderRows(
          orderRows.map((row: any) => ({
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
            status: row.status as any,
            createdAt: row.created_at ? new Date(row.created_at) : null,
            updatedAt: row.updated_at ? new Date(row.updated_at) : null,
          })),
        )
      : [];

  const ordersByCustomerId = new Map<string, OrderWithProducts[]>();

  hydratedOrders.forEach((order) => {
    const current = ordersByCustomerId.get(order.customerId) ?? [];
    current.push(order);
    ordersByCustomerId.set(order.customerId, current);
  });

  const mappedCustomers = customerRows
    .map((customer: any) => {
      const relatedOrders = ordersByCustomerId.get(customer.id) ?? [];

      return {
        customer: {
          id: customer.id,
          userId: customer.user_id ?? null,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          walletBalance: String(customer.wallet_balance ?? "0.00"),
          customerTier: customer.customer_tier ?? "standard",
          referralCode: customer.referral_code ?? null,
          referredBy: customer.referred_by ?? null,
          totalSpent: String(customer.total_spent ?? "0.00"),
          createdAt: new Date(customer.created_at),
        },
        orders: relatedOrders,
        ordersCount: relatedOrders.length,
        totalSpent: relatedOrders
          .reduce((sum, order) => sum + Number(order.totalPrice), 0)
          .toFixed(2),
        lastOrderAt: relatedOrders[0]?.createdAt ?? null,
      };
    })
    .sort((left: any, right: any) => {
      const leftTime =
        left.lastOrderAt?.getTime() ?? left.customer.createdAt.getTime();
      const rightTime =
        right.lastOrderAt?.getTime() ?? right.customer.createdAt.getTime();

      return rightTime - leftTime;
    });

  return {
    customers: mappedCustomers,
    currentPage: safePage,
    pageSize,
    totalCount,
    totalPages,
  };
}
