import { getDb, hasDatabaseUrl } from "../client";
import { getMemoryStore } from "./common";

export type RevenueDataPoint = {
  date: string;
  revenue: number;
};

export type StatusDataPoint = {
  status: string;
  count: number;
};

export async function getRevenueOverTime(
  days: number = 30,
): Promise<RevenueDataPoint[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  // Initialize last N days with 0
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0]!;
    map.set(key, 0);
  }

  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    const filtered = store.orders.filter(
      (o: any) =>
        o.createdAt &&
        new Date(o.createdAt) >= cutoff &&
        o.status !== "cancelled",
    );
    for (const o of filtered) {
      const key = new Date(o.createdAt).toISOString().split("T")[0]!;
      map.set(key, (map.get(key) || 0) + Number(o.totalPrice));
    }

    return Array.from(map.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }

  const supabase = getDb();

  // Fetch only necessary columns from Supabase
  const { data: records, error } = await supabase
    .from("orders")
    .select("total_price, created_at, status")
    .gte("created_at", cutoff.toISOString())
    .neq("status", "cancelled");

  if (!error && records) {
    for (const row of records) {
      if (row.created_at) {
        const dateStr = row.created_at.split("T")[0]!;
        if (map.has(dateStr)) {
          map.set(dateStr, (map.get(dateStr) || 0) + Number(row.total_price));
        }
      }
    }
  }

  return Array.from(map.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}

export async function getOrdersByStatus(): Promise<StatusDataPoint[]> {
  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    const map = new Map<string, number>();

    for (const o of store.orders as any[]) {
      const s = String(o.status || "unknown");
      map.set(s, (map.get(s) || 0) + 1);
    }

    return Array.from(map.entries()).map(([status, count]) => ({
      status,
      count,
    }));
  }

  const supabase = getDb();

  // Pulling raw statuses to reduce in-memory
  const { data: records, error } = await supabase
    .from("orders")
    .select("status");

  const map = new Map<string, number>();

  if (!error && records) {
    for (const row of records) {
      const s = String(row.status || "unknown");
      map.set(s, (map.get(s) || 0) + 1);
    }
  }

  return Array.from(map.entries()).map(([status, count]) => ({
    status,
    count,
  }));
}
