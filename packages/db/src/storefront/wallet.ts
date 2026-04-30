import { getDb, hasDatabaseUrl } from "../client";
import type { Customer, WalletDeposit, WalletTransaction } from "../types";
import { getMemoryStore } from "./common";

/**
 * Fetch a customer profile by their Supabase Auth user ID.
 */
export async function getCustomerByUserId(
  userId: string,
): Promise<Customer | null> {
  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    const found = store.customers.find(
      (customer: any) => customer.userId === userId,
    );
    return found ?? null;
  }

  const supabase = getDb();
  const { data: row, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !row) return null;

  return {
    id: row.id,
    userId: row.user_id ?? null,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    walletBalance: String(row.wallet_balance ?? "0.00"),
    customerTier: row.customer_tier ?? "standard",
    referralCode: row.referral_code ?? null,
    referredBy: row.referred_by ?? null,
    totalSpent: String(row.total_spent ?? "0.00"),
    createdAt: new Date(row.created_at),
  } satisfies Customer;
}

/**
 * List wallet transactions for a customer, newest first.
 */
export async function listWalletTransactions(
  customerId: string,
): Promise<WalletTransaction[]> {
  if (!hasDatabaseUrl()) {
    return [];
  }

  const supabase = getDb();
  const { data: rows, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !rows) return [];

  return rows.map((row: any) => ({
    id: row.id,
    customerId: row.customer_id,
    transactionType: row.transaction_type,
    amount: String(row.amount),
    currency: row.currency ?? "USDT",
    status: row.status ?? "pending",
    paymentMethod: row.payment_method ?? null,
    referenceId: row.reference_id ?? null,
    notes: row.notes ?? null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  })) satisfies WalletTransaction[];
}

/**
 * List all pending wallet deposits for admin review.
 */
export async function listPendingDeposits(): Promise<WalletDeposit[]> {
  if (!hasDatabaseUrl()) return [];

  const supabase = getDb();
  const { data: rows, error } = await supabase
    .from("wallet_transactions")
    .select("*, customers(name, email)")
    .eq("transaction_type", "deposit")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error || !rows) return [];

  return rows.map((row: any) => ({
    id: row.id,
    customerId: row.customer_id,
    transactionType: row.transaction_type,
    amount: String(row.amount),
    currency: row.currency ?? "USDT",
    status: row.status,
    paymentMethod: row.payment_method ?? null,
    referenceId: row.reference_id ?? null,
    notes: row.notes ?? null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    // Attach customer info for the dashboard
    customerExt: row.customers
      ? { name: row.customers.name, email: row.customers.email }
      : null,
  })) satisfies WalletDeposit[];
}

/**
 * Create a pending deposit request in wallet_transactions.
 * Admin must manually approve and credit the customer's balance.
 */
export async function createDepositRequest(input: {
  customerId: string;
  amount: number;
  paymentMethod: "qrph" | "binance_pay";
  referenceId?: string;
  notes?: string;
}): Promise<WalletTransaction> {
  if (!hasDatabaseUrl()) {
    throw new Error("Database connection required for wallet operations.");
  }

  const supabase = getDb();

  const { data: row, error } = await supabase
    .from("wallet_transactions")
    .insert({
      customer_id: input.customerId,
      transaction_type: "deposit",
      amount: input.amount,
      currency: "USDT",
      status: "pending",
      payment_method: input.paymentMethod,
      reference_id: input.referenceId ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error || !row) {
    throw new Error("Failed to create deposit request.");
  }

  return {
    id: row.id,
    customerId: row.customer_id,
    transactionType: row.transaction_type,
    amount: String(row.amount),
    currency: row.currency,
    status: row.status,
    paymentMethod: row.payment_method,
    referenceId: row.reference_id,
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  } satisfies WalletTransaction;
}

/**
 * Atomically debit a customer's wallet balance for a purchase.
 * Calls the Postgres RPC `process_wallet_purchase` which:
 *   1. Locks the customer row (SELECT FOR UPDATE)
 *   2. Validates sufficient balance
 *   3. Debits wallet_balance
 *   4. Records a wallet_transaction of type 'purchase'
 *
 * @throws Error if insufficient balance or customer not found
 */
export async function processWalletPurchase(input: {
  customerId: string;
  amount: number;
  orderCode: string;
}): Promise<number> {
  if (!hasDatabaseUrl()) {
    throw new Error("Database connection required for wallet purchases.");
  }

  const supabase = getDb();
  const { data, error } = await supabase.rpc("process_wallet_purchase", {
    p_customer_id: input.customerId,
    p_amount: input.amount,
    p_order_code: input.orderCode,
  });

  if (error) {
    // Parse Postgres error message for user-friendly output
    const msg = error.message || "";
    if (msg.includes("Insufficient wallet balance")) {
      throw new Error(
        "Insufficient wallet balance. Please top up before purchasing.",
      );
    }
    if (msg.includes("Customer not found")) {
      throw new Error("Customer profile not found.");
    }
    throw new Error(`Wallet payment failed: ${msg}`);
  }

  return Number(data);
}

/**
 * Approve a pending wallet deposit (Admin only).
 * Calls the Postgres RPC `approve_wallet_deposit` which:
 *   1. Locks the wallet_transactions row
 *   2. Updates its status to 'completed'
 *   3. Locks the customer row and increments wallet_balance
 *
 * @throws Error if transaction is missing, not pending, or fails
 */
export async function approveWalletDeposit(transactionId: string): Promise<number> {
  if (!hasDatabaseUrl()) {
    throw new Error("Database connection required for wallet operations.");
  }

  const supabase = getDb();
  const { data, error } = await supabase.rpc("approve_wallet_deposit", {
    p_transaction_id: transactionId,
  });

  if (error) {
    throw new Error(`Deposit approval failed: ${error.message || ""}`);
  }

  return Number(data);
}
