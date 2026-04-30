"use client";

import { useState, useTransition } from "react";
import { Check, Clock, ExternalLink, RefreshCw } from "lucide-react";

function timeAgo(dateInput: Date | string) {
  const date = new Date(dateInput);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + "y";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + "mo";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + "d";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + "h";
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + "m";
  return Math.floor(seconds) + "s";
}

import { Badge, Button, Card, CardContent } from "@wongdigital/ui";
import type { WalletDeposit } from "@wongdigital/db";
import { useGeoPricing } from "@/hooks/use-geo-pricing";
import { approveDepositAction } from "./actions";

type WalletDashboardClientProps = {
  initialDeposits: WalletDeposit[];
};

export function WalletDashboardClient({
  initialDeposits,
}: WalletDashboardClientProps) {
  const [deposits, setDeposits] = useState(initialDeposits);
  const { formatPrice } = useGeoPricing();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {deposits.map((deposit) => (
        <DepositCard
          key={deposit.id}
          deposit={deposit}
          formatPrice={formatPrice}
          onApprove={(id) => setDeposits((prev) => prev.filter((d) => d.id !== id))}
        />
      ))}
    </div>
  );
}

function DepositCard({
  deposit,
  formatPrice,
  onApprove,
}: {
  deposit: WalletDeposit;
  formatPrice: (val: number) => string;
  onApprove: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleApprove = () => {
    startTransition(async () => {
      setError(null);
      const res = await approveDepositAction(deposit.id);
      if (res.success) {
        onApprove(deposit.id);
      } else {
        setError(res.error || "Approval failed.");
      }
    });
  };

  const customerName = deposit.customerExt?.name || "Unknown Customer";
  const customerEmail = deposit.customerExt?.email || "No Email";

  return (
    <Card className="flex flex-col border-[--border] bg-[--bg-surface] p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <Badge tone="accent" className="mb-2 uppercase text-[10px] sm:text-xs">
            {deposit.paymentMethod === "qrph" ? "QRPH" : "BINANCE PAY"}
          </Badge>
          <p className="font-display text-2xl font-bold tracking-tight text-[--text-primary]">
            {formatPrice(Number(deposit.amount))}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[--text-secondary]">
          {timeAgo(deposit.createdAt)} ago
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-1 bg-[--bg-card] rounded-xl p-3 border border-[color-mix(in_srgb,var(--border)_50%,transparent)]">
        <p className="font-medium text-sm text-[--text-primary]">{customerName}</p>
        <p className="text-xs text-[--text-muted] truncate">{customerEmail}</p>

        {deposit.referenceId && (
          <p className="mt-2 text-xs text-[--text-secondary] break-all">
            <span className="font-medium">Ref:</span> {deposit.referenceId}
          </p>
        )}
      </div>

      {error ? (
        <p className="mt-3 text-xs text-[--color-danger] text-center bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] py-1.5 rounded-lg border border-[--color-danger]">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <Button
          className="flex-1 justify-center gap-2 bg-[--color-success] text-white hover:opacity-90"
          onClick={handleApprove}
          disabled={isPending}
        >
          {isPending ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          {isPending ? "Approving..." : "Approve Deposit"}
        </Button>
      </div>
    </Card>
  );
}
