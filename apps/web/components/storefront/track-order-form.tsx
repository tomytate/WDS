"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";
import { useState, useTransition, useEffect } from "react";

import { createClient } from "@/utils/supabase/client";

import {
  Check,
  Copy,
  Search,
  Hash,
  Mail,
  ShoppingBag,
  Calendar,
  Receipt,
  Package,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Badge, Input, buttonStyles } from "@wongdigital/ui";

import { lookupOrders } from "@/app/(storefront)/track/actions";
import { ProductLogo } from "@/components/product-logo";
import {
  formatDate,
  formatOrderItemMeta,
  statusLabel,
} from "@/lib/format";
import { useGeoPricing } from "@/hooks/use-geo-pricing";
import type { AccessPlan } from "@wongdigital/db";

import { OrderStatusTimeline } from "./order-status-timeline";

type TrackedOrder = {
  id: string;
  orderCode: string;
  status: "pending" | "processing" | "delivered" | "completed" | "cancelled";
  createdAt: string;
  notes: string | null;
  paymentMethod: string;
  tipAmount: string;
  product: {
    name: string;
    price: string;
    iconUrl: string | null;
  };
  items: Array<{
    id: string;
    name: string;
    iconUrl: string | null;
    selectionMode: "subscription" | "service" | "package" | "addon";
    fulfillmentProvider: "manual";
    accessPlan: AccessPlan;
    quantity: number;
    serviceOption: string | null;
    unitPrice: string;
    providerServiceId: string | null;
    providerOrderId: string | null;
    providerStatus: string | null;
    providerCharge: string | null;
    providerCurrency: string | null;
    providerStartCount: string | null;
    providerRemains: string | null;
    providerError: string | null;
    providerLastCheckedAt: string | null;
  }>;
  products: Array<{
    id: string;
    name: string;
    price: string;
    iconUrl: string | null;
  }>;
  subtotalPrice: string;
  totalPrice: string;
};

type TrackOrderFormProps = {
  initialOrderCode?: string;
  supportEmail: string;
};

function getStatusColor(status: TrackedOrder["status"]) {
  switch (status) {
    case "completed":
    case "delivered":
      return "var(--color-success)";
    case "processing":
      return "var(--accent)";
    case "cancelled":
      return "var(--color-danger)";
    default:
      return "var(--text-muted)";
  }
}

export function TrackOrderForm({
  initialOrderCode = "",
  supportEmail,
}: TrackOrderFormProps) {
  const [tab, setTab] = useState<"code" | "email">("code");
  const [codeValue, setCodeValue] = useState(initialOrderCode);
  const [emailValue, setEmailValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { formatPrimaryPrice, formatSecondaryPrice, calculateDisplayTotals, showSecondary } = useGeoPricing();

  const orderTotals = selectedOrder ? calculateDisplayTotals(
    selectedOrder.items,
    selectedOrder.tipAmount,
    selectedOrder.discountAmount
  ) : null;

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? orders[0] ?? null;

  function submit() {
    setError(null);

    startTransition(async () => {
      const result = await lookupOrders(
        tab === "code"
          ? {
              mode: "code",
              value: codeValue,
            }
          : {
              mode: "email",
              value: emailValue,
            },
      );

      if (!result.success) {
        setOrders([]);
        setSelectedOrderId(null);
        setError(result.error);
        return;
      }

      setOrders(result.data.orders);
      setSelectedOrderId(result.data.orders[0]?.id ?? null);
    });
  }

  useEffect(() => {
    if (orders.length === 0) return;

    const supabase = createClient();

    // Subscribing to filter by multiple codes is tricky with eq. So we listen to all orders
    // but the payload is filtered natively by RLS on Supabase if configured,
    // or we just check if payload.new matched our tracked orders.
    const channel = supabase
      .channel("public:orders")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const newDoc = payload.new as {
            id?: string;
            order_code?: string;
            status?: string;
          };
          if (!newDoc.id || !newDoc.status) return;

          setOrders((current) => {
            const exists = current.some((o) => o.id === newDoc.id);
            if (!exists) return current;

            return current.map((order) =>
              order.id === newDoc.id
                ? { ...order, status: newDoc.status as TrackedOrder["status"] }
                : order,
            );
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orders]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Card */}
      <div className="glass-panel relative overflow-hidden rounded-xl sm:rounded-2xl">
        {/* Decorative glow */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[--accent-tint-soft] blur-3xl"
          aria-hidden="true"
        />

        <div className="relative space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 rounded-lg sm:rounded-xl border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)] p-1 sm:p-1.5 w-fit">
            <button
              className={`flex items-center gap-1.5 sm:gap-2 rounded-[10px] sm:rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 ${
                tab === "code"
                  ? "bg-[--accent] text-[--accent-fg] shadow-[0_2px_8px_var(--accent-tint-medium)]"
                  : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-[color-mix(in_srgb,var(--bg-surface)_80%,transparent)]"
              }`}
              onClick={() => setTab("code")}
              type="button"
            >
              <Hash
                size={13}
                className="sm:h-3.5 sm:w-3.5"
                aria-hidden="true"
              />
              Order Code
            </button>
            <button
              className={`flex items-center gap-1.5 sm:gap-2 rounded-[10px] sm:rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 ${
                tab === "email"
                  ? "bg-[--accent] text-[--accent-fg] shadow-[0_2px_8px_var(--accent-tint-medium)]"
                  : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-[color-mix(in_srgb,var(--bg-surface)_80%,transparent)]"
              }`}
              onClick={() => setTab("email")}
              type="button"
            >
              <Mail
                size={13}
                className="sm:h-3.5 sm:w-3.5"
                aria-hidden="true"
              />
              Email
            </button>
          </div>

          {/* Input Section */}
          {tab === "code" ? (
            <div className="space-y-2 sm:space-y-3">
              <label
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[--text-primary]"
                htmlFor="orderCode"
              >
                <Hash
                  size={12}
                  className="sm:h-3.5 sm:w-3.5 text-[--text-muted]"
                  aria-hidden="true"
                />
                Order Code
              </label>
              <Input
                id="orderCode"
                className="h-11 sm:h-12 text-sm sm:text-base font-mono"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setCodeValue(
                    event.target.value.replace(/\s+/g, "").toUpperCase(),
                  )
                }
                placeholder="TT-20260327-4F2A"
                value={codeValue}
              />
              <p className="text-[10px] sm:text-xs leading-relaxed text-[--text-muted]">
                Use the code shown after checkout, including the TT- prefix.
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <label
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[--text-primary]"
                htmlFor="email"
              >
                <Mail
                  size={12}
                  className="sm:h-3.5 sm:w-3.5 text-[--text-muted]"
                  aria-hidden="true"
                />
                Email Used for Order
              </label>
              <Input
                id="email"
                className="h-11 sm:h-12 text-sm sm:text-base"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setEmailValue(event.target.value)
                }
                placeholder="you@example.com"
                type="email"
                value={emailValue}
              />
              <p className="text-[10px] sm:text-xs leading-relaxed text-[--text-muted]">
                We&apos;ll show all orders placed with this email so you can
                choose the right one.
              </p>
            </div>
          )}

          {error ? (
            <p
              className="rounded-xl sm:rounded-2xl border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-[--color-danger]"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            className={buttonStyles({
              className:
                "w-full justify-center rounded-xl sm:rounded-2xl h-11 sm:h-12 text-sm sm:text-base shadow-[0_4px_16px_var(--accent-tint-medium)] hover:shadow-[0_8px_24px_var(--accent-tint-strong)] active:scale-[0.98] transition-all duration-200",
              size: "lg",
            })}
            onClick={submit}
            disabled={
              isPending ||
              (tab === "code"
                ? codeValue.length === 0
                : emailValue.length === 0)
            }
            type="button"
          >
            {isPending ? (
              <>
                <Loader2
                  aria-hidden="true"
                  className="mr-2 h-4 w-4 animate-spin"
                />
                Checking Status...
              </>
            ) : (
              <>
                <Search aria-hidden="true" className="mr-2 h-4 w-4" />
                Track Order
              </>
            )}
          </button>
        </div>
      </div>

      {/* Multiple Orders Selector */}
      {orders.length > 1 ? (
        <div className="rounded-xl sm:rounded-2xl border border-[--border] bg-[--bg-card] p-3.5 sm:p-5 lg:p-6">
          <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[--accent-tint-soft] text-[--accent]">
              <Package size={14} className="sm:h-4 sm:w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[--text-muted] font-semibold">
                Multiple Orders Found
              </p>
              <p className="mt-0.5 text-[10px] sm:text-xs text-[--text-secondary]">
                Select the order you want to view
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:gap-3">
            {orders.map((order) => {
              const active = selectedOrder?.id === order.id;
              const statusColor = getStatusColor(order.status);

              return (
                <button
                  className={`rounded-2xl sm:rounded-xl border p-3 sm:p-4 text-left transition-all duration-200 active:scale-[0.99] ${
                    active
                      ? "border-[--accent] bg-[--accent-tint-soft] shadow-[0_0_12px_var(--accent-tint-soft)]"
                      : "border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] hover:border-[--accent-border]"
                  }`}
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  type="button"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <ProductLogo
                      className="shrink-0"
                      iconUrl={order.items[0]?.iconUrl ?? order.product.iconUrl}
                      name={order.items[0]?.name ?? order.product.name}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs sm:text-sm text-[--text-primary]">
                          {order.orderCode}
                        </p>
                        <span
                          className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em]"
                          style={{
                            color: statusColor,
                            backgroundColor: `color-mix(in srgb, ${statusColor} 12%, transparent)`,
                          }}
                        >
                          {statusLabel(order.status)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] sm:text-xs text-[--text-secondary] truncate">
                        {order.items.length === 1
                          ? `${order.items[0]?.name} (${formatOrderItemMeta(order.items[0] ?? { accessPlan: "one_year", quantity: 1 })})`
                          : `${order.items[0]?.name} +${order.items.length - 1} more`}{" "}
                        · {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {active ? (
                      <div className="shrink-0 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[--accent] text-[--accent-fg]">
                        <Check
                          size={10}
                          className="sm:h-3 sm:w-3"
                          strokeWidth={3}
                        />
                      </div>
                    ) : (
                      <ArrowRight
                        size={14}
                        className="shrink-0 text-[--text-muted] sm:h-4 sm:w-4"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Order Details */}
      {selectedOrder ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Status Header */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[--border] bg-[--bg-card] p-4 sm:p-6">
            <div
              className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl"
              style={{
                backgroundColor: `color-mix(in srgb, ${getStatusColor(selectedOrder.status)} 14%, transparent)`,
              }}
              aria-hidden="true"
            />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[--text-muted] font-semibold">
                  Order Status
                </p>
                <h2
                  className="font-display text-2xl tracking-tight sm:text-3xl"
                  style={{ color: getStatusColor(selectedOrder.status) }}
                >
                  {statusLabel(selectedOrder.status)}
                </h2>
              </div>
              <Badge
                tone="accent"
                className="w-fit gap-1.5 text-[10px] sm:text-xs shadow-[0_0_8px_var(--accent-tint-medium)]"
              >
                <Hash size={10} className="sm:h-3 sm:w-3" aria-hidden="true" />
                {selectedOrder.orderCode}
              </Badge>
            </div>

            {/* Timeline */}
            <div className="mt-4 sm:mt-5">
              <OrderStatusTimeline status={selectedOrder.status} />
            </div>

            {/* Quick Reorder */}
            {(selectedOrder.status === "completed" ||
              selectedOrder.status === "delivered") &&
            selectedOrder.items[0] ? (
              <div className="mt-4 sm:mt-5">
                <Link
                  className={buttonStyles({
                    className:
                      "w-full justify-center gap-2 rounded-xl sm:w-auto",
                    variant: "ghost",
                  })}
                  href={`/order?product=${selectedOrder.items[0].name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <ArrowRight size={14} aria-hidden="true" />
                  Order Again
                </Link>
              </div>
            ) : null}
          </div>

          {/* Order Items */}
          <div className="rounded-xl sm:rounded-2xl border border-[--border] bg-[--bg-card] p-3.5 sm:p-5 lg:p-6">
            <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[--accent-tint-soft] text-[--accent]">
                <ShoppingBag
                  size={14}
                  className="sm:h-4 sm:w-4"
                  aria-hidden="true"
                />
              </div>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[--text-muted] font-semibold">
                Order Items
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {selectedOrder.items.map((item) => (
                <div
                  className="flex items-start justify-between gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg-surface)_40%,transparent)] p-3 sm:p-4"
                  key={`${selectedOrder.id}-${item.id}`}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                    <ProductLogo
                      className="shrink-0"
                      iconUrl={item.iconUrl}
                      name={item.name}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <span className="block text-xs sm:text-sm font-medium text-[--text-primary] truncate">
                        {item.name}
                      </span>
                      <span className="block text-[10px] sm:text-xs text-[--text-secondary]">
                        {formatOrderItemMeta(item)}
                      </span>
                      {item.selectionMode === "service" ? (
                        <span className="mt-1 block text-[10px] sm:text-xs text-[--text-secondary]">
                          {item.providerError ? (
                            <span className="text-[--color-danger]">
                              Issue: {item.providerError}
                            </span>
                          ) : item.providerOrderId ? (
                            <>
                              Order #{item.providerOrderId}
                              {item.providerStatus
                                ? ` · ${item.providerStatus}`
                                : ""}
                            </>
                          ) : (
                            "Awaiting submission"
                          )}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="rounded-lg bg-[--accent-tint-soft] px-2 py-1 text-xs sm:text-sm font-semibold text-[--accent]">
                      {formatPrimaryPrice(item.unitPrice, item.product?.slug)}
                    </span>
                    {item.selectionMode === "service" && item.providerCharge ? (
                      <span className="mt-1 block text-[10px] text-[--text-muted]">
                        Cost: {item.providerCharge}{" "}
                        {item.providerCurrency ?? "USD"}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-3 sm:mt-4 rounded-lg sm:rounded-xl border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)] p-3 sm:p-4">
              <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                <span className="text-[--text-secondary]">Subtotal</span>
                <span className="font-medium text-[--text-primary]">
                  {orderTotals?.formattedSubtotal}
                </span>
              </div>
              <div className="mt-1.5 sm:mt-2 flex items-center justify-between gap-4 text-xs sm:text-sm">
                <span className="text-[--text-secondary]">Tip</span>
                <span className="font-medium text-[--text-primary]">
                  {orderTotals?.formattedTip}
                </span>
              </div>
              {Number(selectedOrder.discountAmount) > 0 && (
                <div className="mt-1.5 sm:mt-2 flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <span className="text-[--color-success]">Discount</span>
                  <span className="font-medium text-[--color-success]">
                    -{orderTotals?.formattedDiscount}
                  </span>
                </div>
              )}
              <div className="mt-2.5 sm:mt-3 flex items-center justify-between gap-4 border-t border-[--border] pt-2.5 sm:pt-3">
                <span className="text-sm font-semibold text-[--text-primary]">
                  Grand Total
                </span>
                <span className="rounded-lg bg-[--accent] px-2.5 py-1 sm:px-3 sm:py-1.5 text-sm sm:text-base font-bold text-[--accent-fg] shadow-[0_2px_8px_var(--accent-tint-strong)]">
                  {orderTotals?.formattedTotal}
                </span>
                {showSecondary && (
                  <p className="mt-1 text-xs text-[--text-muted] text-right">
                    ≈ {formatSecondaryPrice(selectedOrder.totalPrice)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submitted Notes */}
          {selectedOrder.notes ? (
            <div className="rounded-xl sm:rounded-2xl border border-[--border] bg-[--bg-card] p-3.5 sm:p-5 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[--accent-tint-soft] text-[--accent]">
                  <MessageSquare
                    size={14}
                    className="sm:h-4 sm:w-4"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[--text-muted] font-semibold">
                  Submitted Details
                </p>
              </div>
              <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed sm:leading-7 text-[--text-primary] rounded-xl bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] p-3 sm:p-4 border border-[color-mix(in_srgb,var(--border)_60%,transparent)]">
                {selectedOrder.notes}
              </p>
            </div>
          ) : null}

          {/* Info Grid */}
          <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-3">
            <InfoBlock
              icon={<Calendar size={14} className="sm:h-4 sm:w-4" />}
              label="Order Date"
              value={formatDate(selectedOrder.createdAt)}
            />
            <InfoBlock
              icon={<Hash size={14} className="sm:h-4 sm:w-4" />}
              copyValue={selectedOrder.orderCode}
              label="Order Code"
              mono
              value={selectedOrder.orderCode}
            />
            <InfoBlock
              icon={<Receipt size={14} className="sm:h-4 sm:w-4" />}
              label="Total"
              value={formatPrimaryPrice(selectedOrder.totalPrice)}
            />
          </div>

          {/* Help Footer */}
          <div className="flex items-start gap-2.5 sm:gap-3 rounded-2xl sm:rounded-xl border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] p-3 sm:p-4">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[--color-info]">
              <HelpCircle size={14} className="sm:h-4 sm:w-4" />
            </div>
            <p className="text-[10px] sm:text-xs leading-relaxed text-[--text-secondary]">
              Need help?{" "}
              <a
                className="font-medium text-[--accent] hover:underline"
                href={`mailto:${supportEmail}`}
              >
                Email {supportEmail}
              </a>{" "}
              or{" "}
              <Link
                className="font-medium text-[--accent] hover:underline"
                href="/order"
              >
                place a new order
              </Link>
              .
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoBlock({
  copyValue,
  icon,
  label,
  mono = false,
  value,
}: {
  copyValue?: string;
  icon: React.ReactNode;
  label: string;
  mono?: boolean;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    if (!copyValue) return;
    await navigator.clipboard.writeText(copyValue);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl sm:rounded-xl border border-[--border] bg-[--bg-card] p-3 sm:p-4">
      <div className="flex items-center gap-1.5 sm:gap-2 text-[--text-muted]">
        {icon}
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] font-semibold">
          {label}
        </p>
      </div>
      <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
        <p
          className={`text-sm sm:text-base font-medium text-[--text-primary] ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
        {copyValue ? (
          <button
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)] px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs text-[--text-secondary] transition-all duration-200 hover:border-[--accent] hover:text-[--accent] active:scale-[0.97]"
            onClick={copyText}
            type="button"
          >
            {copied ? (
              <>
                <Check
                  aria-hidden="true"
                  size={10}
                  className="sm:h-3 sm:w-3 text-[--color-success]"
                  strokeWidth={2.5}
                />
                Copied
              </>
            ) : (
              <>
                <Copy aria-hidden="true" size={10} className="sm:h-3 sm:w-3" />
                Copy
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
