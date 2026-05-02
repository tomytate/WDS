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
  discountAmount: string;
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
    product: { slug: string };
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

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? orders[0] ?? null;

  const orderTotals = selectedOrder ? calculateDisplayTotals(
    selectedOrder.items,
    selectedOrder.tipAmount,
    selectedOrder.discountAmount
  ) : null;

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
      <div className="relative overflow-hidden rounded-[--radius-card] border border-[--border] bg-[--bg-card]">
        <div className="relative space-y-5 p-5 sm:p-6 lg:p-8">
          {/* Tab Switcher */}
          <div className="inline-flex items-center gap-1 rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] p-1 w-fit">
            <button
              className={`flex items-center gap-2 rounded-[calc(var(--radius-inner)-2px)] px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                tab === "code"
                  ? "bg-[--text-primary] text-[--bg-base]"
                  : "text-[--text-secondary] hover:text-[--text-primary]"
              }`}
              onClick={() => setTab("code")}
              type="button"
            >
              <Hash size={13} aria-hidden="true" />
              Order Code
            </button>
            <button
              className={`flex items-center gap-2 rounded-[calc(var(--radius-inner)-2px)] px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                tab === "email"
                  ? "bg-[--text-primary] text-[--bg-base]"
                  : "text-[--text-secondary] hover:text-[--text-primary]"
              }`}
              onClick={() => setTab("email")}
              type="button"
            >
              <Mail size={13} aria-hidden="true" />
              Email
            </button>
          </div>

          {/* Input Section */}
          {tab === "code" ? (
            <div className="space-y-2">
              <label
                className="block font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[--text-muted]"
                htmlFor="orderCode"
              >
                Order Code
              </label>
              <Input
                id="orderCode"
                className="font-mono"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setCodeValue(
                    event.target.value.replace(/\s+/g, "").toUpperCase(),
                  )
                }
                placeholder="TT-20260327-4F2A"
                value={codeValue}
              />
              <p className="text-xs leading-relaxed text-[--text-muted]">
                Use the code shown after checkout, including the TT- prefix.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label
                className="block font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[--text-muted]"
                htmlFor="email"
              >
                Email Used for Order
              </label>
              <Input
                id="email"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setEmailValue(event.target.value)
                }
                placeholder="you@example.com"
                type="email"
                value={emailValue}
              />
              <p className="text-xs leading-relaxed text-[--text-muted]">
                We&apos;ll show all orders placed with this email so you can
                choose the right one.
              </p>
            </div>
          )}

          {error ? (
            <p
              className="rounded-[--radius-inner] border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-2.5 text-sm font-medium text-[--color-danger-text]"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            className={buttonStyles({
              className: "w-full justify-center gap-2",
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
                  className="h-4 w-4 animate-spin"
                />
                Checking…
              </>
            ) : (
              <>
                <Search aria-hidden="true" size={14} />
                Track Order
              </>
            )}
          </button>
        </div>
      </div>

      {/* Multiple Orders Selector */}
      {orders.length > 1 ? (
        <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Package size={13} className="text-[--text-muted]" aria-hidden="true" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                Multiple orders found
              </p>
              <p className="mt-0.5 text-xs text-[--text-secondary]">
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
                  className={`rounded-[--radius-inner] border p-3 sm:p-4 text-left transition-colors duration-150 ${
                    active
                      ? "border-[--text-primary] bg-[--bg-surface]"
                      : "border-[--border] bg-[--bg-card] hover:border-[--text-primary]"
                  }`}
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <ProductLogo
                      className="shrink-0"
                      iconUrl={order.items[0]?.iconUrl ?? order.product.iconUrl}
                      name={order.items[0]?.name ?? order.product.name}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs text-[--text-primary]">
                          {order.orderCode}
                        </p>
                        <span
                          className="shrink-0 rounded-[--radius-inner] border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em]"
                          style={{
                            color: statusColor,
                            borderColor: `color-mix(in srgb, ${statusColor} 50%, var(--border))`,
                            backgroundColor: `color-mix(in srgb, ${statusColor} 10%, transparent)`,
                          }}
                        >
                          {statusLabel(order.status)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[--text-secondary] truncate">
                        {order.items.length === 1
                          ? `${order.items[0]?.name} (${formatOrderItemMeta(order.items[0] ?? { accessPlan: "one_year", quantity: 1 })})`
                          : `${order.items[0]?.name} +${order.items.length - 1} more`}{" "}
                        · {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {active ? (
                      <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-[--radius-inner] bg-[--text-primary] text-[--bg-base]">
                        <Check size={11} strokeWidth={2.5} />
                      </div>
                    ) : (
                      <ArrowRight
                        size={14}
                        className="shrink-0 text-[--text-muted]"
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
          <div className="relative rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-5 sm:p-6">
            <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="space-y-1.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                  Order status
                </p>
                <h2
                  className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl"
                  style={{ color: getStatusColor(selectedOrder.status) }}
                >
                  {statusLabel(selectedOrder.status)}
                </h2>
              </div>
              <Badge tone="muted" size="sm" className="w-fit gap-1.5">
                <Hash size={10} aria-hidden="true" />
                {selectedOrder.orderCode}
              </Badge>
            </div>

            {/* Timeline */}
            <div className="mt-6">
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
          <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-[--border] bg-[--bg-surface] px-5 py-3">
              <ShoppingBag size={13} className="text-[--text-muted]" aria-hidden="true" />
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                Order items
              </p>
            </div>

            <div className="divide-y divide-[--border]">
              {selectedOrder.items.map((item) => (
                <div
                  className="flex items-start justify-between gap-4 p-4 sm:p-5"
                  key={`${selectedOrder.id}-${item.id}`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <ProductLogo
                      className="shrink-0"
                      iconUrl={item.iconUrl}
                      name={item.name}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <span className="block text-sm font-medium text-[--text-primary] truncate">
                        {item.name}
                      </span>
                      <span className="block text-xs text-[--text-secondary]">
                        {formatOrderItemMeta(item)}
                      </span>
                      {item.selectionMode === "service" ? (
                        <span className="mt-1 block text-xs text-[--text-muted]">
                          {item.providerError ? (
                            <span className="text-[--color-danger-text]">
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
                    <span className="font-display text-sm font-semibold tabular-nums text-[--text-primary]">
                      {formatPrimaryPrice(item.unitPrice, item.product?.slug, item.accessPlan)}
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
            <div className="border-t border-[--border] bg-[--bg-surface] p-5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-[--text-secondary]">Subtotal</span>
                <span className="font-medium tabular-nums text-[--text-primary]">
                  {orderTotals?.formattedSubtotal}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4 text-sm">
                <span className="text-[--text-secondary]">Tip</span>
                <span className="font-medium tabular-nums text-[--text-primary]">
                  {orderTotals?.formattedTip}
                </span>
              </div>
              {Number(selectedOrder.discountAmount) > 0 && (
                <div className="mt-2 flex items-center justify-between gap-4 text-sm">
                  <span className="text-[--color-success-text]">Discount</span>
                  <span className="font-medium tabular-nums text-[--color-success-text]">
                    −{orderTotals?.formattedDiscount}
                  </span>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between gap-4 border-t border-[--border] pt-3">
                <span className="text-sm font-semibold text-[--text-primary]">
                  Grand total
                </span>
                <div className="text-right">
                  <span className="font-display text-2xl font-semibold tabular-nums tracking-tight text-[--text-primary]">
                    {orderTotals?.formattedTotal}
                  </span>
                  {showSecondary && (
                    <p className="mt-0.5 text-[10px] text-[--text-muted] text-right">
                      ≈ {formatSecondaryPrice(selectedOrder.totalPrice)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submitted Notes */}
          {selectedOrder.notes ? (
            <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden">
              <div className="flex items-center gap-2.5 border-b border-[--border] bg-[--bg-surface] px-5 py-3">
                <MessageSquare size={13} className="text-[--text-muted]" aria-hidden="true" />
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
                  Submitted details
                </p>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[--text-primary] p-5">
                {selectedOrder.notes}
              </p>
            </div>
          ) : null}

          {/* Info Grid */}
          <div className="grid gap-px bg-[--border] border border-[--border] rounded-[--radius-card] overflow-hidden grid-cols-1 sm:grid-cols-3">
            <InfoBlock
              icon={<Calendar size={13} />}
              label="Order date"
              value={formatDate(selectedOrder.createdAt)}
            />
            <InfoBlock
              icon={<Hash size={13} />}
              copyValue={selectedOrder.orderCode}
              label="Order code"
              mono
              value={selectedOrder.orderCode}
            />
            <InfoBlock
              icon={<Receipt size={13} />}
              label="Total"
              value={formatPrimaryPrice(selectedOrder.totalPrice)}
            />
          </div>

          {/* Help Footer */}
          <div className="flex items-start gap-3 rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] p-4">
            <HelpCircle size={14} className="mt-0.5 shrink-0 text-[--text-muted]" />
            <p className="text-xs leading-relaxed text-[--text-secondary]">
              Need help?{" "}
              <a
                className="font-medium text-[--text-primary] underline-offset-2 hover:underline"
                href={`mailto:${supportEmail}`}
              >
                Email {supportEmail}
              </a>{" "}
              or{" "}
              <Link
                className="font-medium text-[--text-primary] underline-offset-2 hover:underline"
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
    <div className="bg-[--bg-card] p-4">
      <div className="flex items-center gap-2 text-[--text-muted]">
        {icon}
        <p className="font-mono text-[10px] uppercase tracking-[0.12em]">
          {label}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p
          className={`text-sm font-medium text-[--text-primary] ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
        {copyValue ? (
          <button
            className="inline-flex items-center gap-1.5 rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[--text-secondary] transition-colors hover:border-[--text-primary] hover:text-[--text-primary]"
            onClick={copyText}
            type="button"
          >
            {copied ? (
              <>
                <Check
                  aria-hidden="true"
                  size={10}
                  className="text-[--color-success]"
                  strokeWidth={2.5}
                />
                Copied
              </>
            ) : (
              <>
                <Copy aria-hidden="true" size={10} />
                Copy
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
