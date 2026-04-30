"use client";

import Link from "next/link";
import {
  Check,
  CheckCircle,
  Copy,
  ExternalLink,
  Send,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { Card, CardContent, Badge, buttonStyles } from "@wongdigital/ui";

import { handlingHoursLabel } from "@/lib/urgency";

type OrderSuccessProps = {
  orderCode: string;
  supportEmail: string;
  supportTelegramUrl?: string;
  supportFacebookUrl?: string;
  firstProductSlug?: string;
  summary: {
    customerName: string;
    customerEmail: string;
    paymentReference: string;
    totalPrice: string;
    items: string[];
  };
};

function buildProcessingMessage({
  orderCode,
  summary,
}: Pick<OrderSuccessProps, "orderCode" | "summary">) {
  const itemLines = summary.items.map((item) => `- ${item}`).join("\n");

  return [
    "Hello Wong Digital Shop,",
    "",
    "I already submitted my order. Here are my details:",
    `Order Code: ${orderCode}`,
    `Name: ${summary.customerName}`,
    `Email: ${summary.customerEmail}`,
    `Payment Reference: ${summary.paymentReference || "N/A"}`,
    `Grand Total: ${summary.totalPrice}`,
    "Items:",
    itemLines || "- No items listed",
    "",
    "Please process my order. Thank you.",
  ].join("\n");
}

export function OrderSuccess({
  orderCode,
  supportEmail: _supportEmail,
  supportTelegramUrl,
  supportFacebookUrl,
  firstProductSlug,
  summary,
}: OrderSuccessProps) {
  const [copied, setCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const processingMessage = buildProcessingMessage({ orderCode, summary });

  async function fallbackCopyText(text: string) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(textarea);
    }
  }

  async function copyOrderCode() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(orderCode);
      } else {
        fallbackCopyText(orderCode);
      }
    } catch {
      fallbackCopyText(orderCode);
    }
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  async function copyProcessingMessage() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(processingMessage);
      } else {
        fallbackCopyText(processingMessage);
      }
    } catch {
      fallbackCopyText(processingMessage);
    }
    setMessageCopied(true);

    window.setTimeout(() => {
      setMessageCopied(false);
    }, 2000);
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden border-[color-mix(in_srgb,var(--color-success)_20%,var(--border))]">
        {/* CSS Confetti particles */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute block rounded-sm"
              style={{
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                left: `${8 + i * 7.5}%`,
                top: `-20px`,
                background: [
                  "#3B82F6",
                  "#60A5FA",
                  "#38BDF8",
                  "#16A34A",
                  "#FBBF24",
                  "#F87171",
                ][i % 6],
                animation: `confetti-fall ${2 + Math.random() * 2}s ease-in ${i * 0.15}s forwards`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        {/* Decorative gradient */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-[--accent-tint-soft] blur-3xl"
          aria-hidden="true"
        />

        <CardContent className="relative space-y-6 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[color-mix(in_srgb,var(--color-success)_20%,transparent)] to-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[--color-success] shadow-[0_0_32px_color-mix(in_srgb,var(--color-success)_20%,transparent)] border border-[color-mix(in_srgb,var(--color-success)_20%,transparent)]"
              initial={{ scale: 0.5, opacity: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              <CheckCircle size={32} strokeWidth={1.5} />
            </motion.div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 flex-1"
              initial={{ opacity: 0, y: 12 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  tone="accent"
                  className="gap-1.5 shadow-[0_0_12px_color-mix(in_srgb,var(--color-success)_16%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[--color-success] border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]"
                >
                  <Sparkles size={10} aria-hidden="true" />
                  Success
                </Badge>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-[--text-primary]">
                Order Received!
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[--text-secondary]">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} aria-hidden="true" />
                  Delivery within 24h
                </span>
                <span className="hidden sm:inline text-[--border]">•</span>
                <span>Hours: {handlingHoursLabel}</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border-2 border-[--accent] bg-gradient-to-br from-[--accent-tint-soft] to-[--accent-tint-faint] p-5 shadow-[0_0_32px_var(--accent-tint-soft)]"
            initial={{ opacity: 0, scale: 0.96 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-[--text-muted] font-semibold">
              Your Order Code
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-[--accent]">
                {orderCode}
              </p>
              <button
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-300 ${
                  copied
                    ? "border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[--color-success]"
                    : "border-[--border] bg-[--bg-surface] text-[--text-secondary] hover:border-[--accent] hover:text-[--accent] hover:bg-[--accent-tint-soft]"
                }`}
                onClick={copyOrderCode}
                type="button"
              >
                {copied ? (
                  <>
                    <Check aria-hidden="true" size={12} strokeWidth={2.5} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy aria-hidden="true" size={12} strokeWidth={2} />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </motion.div>

          <motion.div
            className="space-y-5 rounded-2xl border border-[--accent-border] bg-gradient-to-br from-[color-mix(in_srgb,var(--bg-surface)_90%,transparent)] to-[var(--bg-card)] p-5 sm:p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[--accent-tint-soft] text-[--accent]">
                <ArrowRight size={16} aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[--accent] font-semibold">
                  Next Step
                </p>
                <h3 className="font-display text-xl sm:text-2xl tracking-tight text-[--text-primary]">
                  Send your order summary via Telegram or Facebook
                </h3>
                <p className="text-sm leading-relaxed text-[--text-secondary]">
                  Copy the message below and send it through your preferred
                  channel for faster processing.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[--border] bg-[--bg-card] p-4 shadow-inner">
              <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-[--text-primary] font-mono">
                {processingMessage}
              </pre>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                className={buttonStyles({
                  className: `w-full justify-center sm:w-auto transition-all duration-300 ${messageCopied ? "!border-[--color-success] !bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] !text-[--color-success] !shadow-[0_0_16px_color-mix(in_srgb,var(--color-success)_16%,transparent)]" : ""}`,
                  variant: "surface",
                })}
                onClick={copyProcessingMessage}
                type="button"
              >
                {messageCopied ? (
                  <>
                    <Check
                      aria-hidden="true"
                      className="mr-2"
                      size={16}
                      strokeWidth={2.5}
                    />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy aria-hidden="true" className="mr-2" size={16} />
                    Copy Message
                  </>
                )}
              </button>

              {supportTelegramUrl ? (
                <a
                  className={buttonStyles({
                    className: "justify-center gap-2",
                    variant: "ghost",
                  })}
                  href={supportTelegramUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Send aria-hidden="true" size={16} />
                  Telegram
                </a>
              ) : null}

              {supportFacebookUrl ? (
                <a
                  className={buttonStyles({
                    className: "justify-center",
                    variant: "ghost",
                  })}
                  href={supportFacebookUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Facebook
                </a>
              ) : null}
            </div>
          </motion.div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              className={buttonStyles({
                className:
                  "group w-full justify-center gap-2 sm:w-auto shadow-[0_4px_16px_var(--accent-tint-medium)] hover:shadow-[0_8px_24px_var(--accent-tint-strong)]",
              })}
              href={`/track?orderCode=${orderCode}`}
            >
              <ExternalLink aria-hidden="true" size={16} />
              Track My Order
              <ArrowRight
                aria-hidden="true"
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              className={buttonStyles({
                className: "w-full justify-center sm:w-auto",
                variant: "ghost",
              })}
              href={
                firstProductSlug
                  ? `/order?product=${firstProductSlug}`
                  : "/order"
              }
            >
              Order Again
            </Link>
          </div>

          <p className="text-sm leading-relaxed text-[--text-secondary] pt-2">
            Need help?{" "}
            <a
              className="font-medium text-[--accent] transition-colors hover:underline"
              href={
                supportFacebookUrl ||
                "https://www.facebook.com/WongDigitalStore/"
              }
              rel="noreferrer"
              target="_blank"
            >
              Chat our Facebook Store
            </a>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
