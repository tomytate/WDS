import type { Metadata } from "next";
import { Suspense } from "react";
import { ServerCrash, Wallet } from "lucide-react";

import { listPendingDeposits } from "@wongdigital/db/storefront";
import { Card, CardContent } from "@wongdigital/ui";

import { WalletDashboardClient } from "./wallet-dashboard-client";

export const metadata: Metadata = {
  title: "Wallet | Dashboard",
};

export default async function WalletDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">
          Dashboard
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[--text-primary]">
          Wallet
        </h1>
        <p className="mt-1 text-sm text-[--text-secondary]">
          Review and approve pending wallet top-up requests.
        </p>
      </div>

      <Suspense fallback={<WalletSkeleton />}>
        <WalletDepositsData />
      </Suspense>
    </div>
  );
}

async function WalletDepositsData() {
  let deposits;
  let hasError = false;

  try {
    deposits = await listPendingDeposits();
  } catch (error) {
    hasError = true;
  }

  if (hasError || !deposits) {
    return (
      <Card className="border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]">
        <CardContent className="flex items-center gap-3 p-5">
          <ServerCrash className="text-[--color-danger]" size={20} />
          <p className="text-sm font-medium text-[--color-danger]">
            Couldn’t load deposits. Try refreshing.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (deposits.length === 0) {
    return (
      <Card className="border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_40%,transparent)]">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[--accent-tint-soft] text-[--accent] mb-4">
            <Wallet size={24} />
          </div>
          <h3 className="font-semibold text-[--text-primary]">All caught up</h3>
          <p className="mt-1 text-sm text-[--text-secondary]">
            No deposits waiting on you.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <WalletDashboardClient initialDeposits={deposits} />;
}

function WalletSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="shimmer-bg h-24 rounded-xl border border-[--border] bg-[--bg-card]"
        />
      ))}
    </div>
  );
}
