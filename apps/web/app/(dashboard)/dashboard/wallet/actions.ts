"use server";

import { revalidatePath } from "next/cache";
import { approveWalletDeposit } from "@wongdigital/db/storefront";

export async function approveDepositAction(transactionId: string) {
  try {
    await approveWalletDeposit(transactionId);
    revalidatePath("/dashboard/wallet");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to approve deposit";
    return { success: false, error: message };
  }
}
