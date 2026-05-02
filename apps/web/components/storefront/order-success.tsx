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
      <Card className="relative overflow-hidden border-[--color-success]">
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
                  "var(--accent)",
                  "var(--text-primary)",
                  "var(--color-success)",
                  "var(--accent)",
                  "var(--accent-hover)",
                  "var(--text-primary)",
                ][i % 6],
                animation: `confetti-fall ${2 + Math.random() * 2}s ease-in ${i * 0.15}s forwards`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        <CardContent className="relative space-y-6 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-[--radius-card] border border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[--color-success-text]"
              initial={{ scale: 0.7, opacity: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.1,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              <CheckCircle size={28} strokeWidth={1.5} />
            </motion.div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 flex-1"
              initial={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="success" size="sm" className="gap-1">
                  <Sparkles size={9} aria-hidden="true" />
                  Success
                </Badge>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-[--text-primary]">
                Order received.
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[--text-secondary]">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} aria-hidden="true" />
                  Delivery within 24h
                </span>
                <span className="hidden sm:inline text-[--border]">·</span>
                <span>Hours: {handlingHoursLabel}</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[--radius-card] border border-[--text-primary] bg-[--bg-surface] p-5"
            initial={{ opacity: 0, scale: 0.97 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted]">
              Your order code
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-[--text-primary]">
                {orderCode}
              </p>
              <button
                className={`inline-flex items-center gap-1.5 rounded-[--radius-inner] border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] font-semibold transition-colors duration-200 ${
                  copied
                    ? "border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[--color-success-text]"
                    : "border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-[--text-primary] hover:text-[--text-primary]"
                }`}
                onClick={copyOrderCode}
                type="button"
              >
                {copied ? (
                  <>
                    <Check aria-hidden="true" size={11} strokeWidth={2.5} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy aria-hidden="true" size={11} strokeWidth={2} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </motion.div>

          <motion.div
            className="space-y-5 rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-5 sm:p-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] text-[--text-primary]">
                <ArrowRight size={14} aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--accent-strong] font-semibold">
                  Next step
                </p>
                <h3 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[--text-primary]">
                  Send your order summary via Telegram or Facebook
                </h3>
                <p className="text-sm leading-relaxed text-[--text-secondary]">
                  Copy the message below and send it through your preferred
                  channel for faster processing.
                </p>
              </div>
            </div>

            <div className="rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] p-4">
              <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-[--text-primary] font-mono">
                {processingMessage}
              </pre>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                className={buttonStyles({
                  className: `w-full justify-center sm:w-auto ${messageCopied ? "!border-[--color-success] !bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] !text-[--color-success-text]" : ""}`,
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
                      size={14}
                      strokeWidth={2.5}
                    />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy aria-hidden="true" className="mr-2" size={14} />
                    Copy message
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
                  <Send aria-hidden="true" size={14} />
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
                className: "group w-full justify-center gap-2 sm:w-auto",
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
