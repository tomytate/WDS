import { getDb, getAdminDb, hasDatabaseUrl } from "../client";
import { defaultStoreSettings } from "../store-config";
import type { StoreSettings } from "../types";
import {
  cloneStoreSettings,
  getMemoryStore,
  mapStoreSettingsRecord,
  PRIMARY_SETTINGS_ID,
} from "./common";

export async function getStoreSettings(): Promise<StoreSettings> {
  if (!hasDatabaseUrl()) {
    return cloneStoreSettings(getMemoryStore().settings);
  }

  const supabase = getDb();
  const { data: record, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", PRIMARY_SETTINGS_ID)
    .maybeSingle();

  if (error) {
    console.error("Error fetching store settings:", error);
    return cloneStoreSettings(defaultStoreSettings);
  }

  return record
    ? mapStoreSettingsRecord({
        storeName: record.store_name,
        supportEmail: record.support_email,
        qrphNumber: record.qrph_number,
        qrphInstructions: record.qrph_instructions,
        binancePayId: record.binance_pay_id,
        binanceInstructions: record.binance_instructions,
      })
    : cloneStoreSettings(defaultStoreSettings);
}

export async function saveStoreSettings(input: StoreSettings) {
  const nextSettings = {
    storeName: input.storeName.trim(),
    supportEmail: input.supportEmail.trim(),
    qrphNumber: input.qrphNumber.trim(),
    qrphInstructions: input.qrphInstructions.trim(),
    binancePayId: input.binancePayId.trim(),
    binanceInstructions: input.binanceInstructions.trim(),
  } satisfies StoreSettings;

  if (!nextSettings.storeName || !nextSettings.supportEmail) {
    throw new Error("Store name and support email are required.");
  }

  if (!hasDatabaseUrl()) {
    const store = getMemoryStore();
    store.settings = cloneStoreSettings(nextSettings);
    return cloneStoreSettings(store.settings);
  }

  const supabase = getAdminDb();
  const { data: saved, error } = await supabase
    .from("store_settings")
    .upsert(
      {
        id: PRIMARY_SETTINGS_ID,
        store_name: nextSettings.storeName,
        support_email: nextSettings.supportEmail,
        qrph_number: nextSettings.qrphNumber,
        qrph_instructions: nextSettings.qrphInstructions,
        binance_pay_id: nextSettings.binancePayId,
        binance_instructions: nextSettings.binanceInstructions,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  if (error || !saved) {
    throw new Error("Failed to save store settings");
  }

  return mapStoreSettingsRecord({
    storeName: saved.store_name,
    supportEmail: saved.support_email,
    qrphNumber: saved.qrph_number,
    qrphInstructions: saved.qrph_instructions,
    binancePayId: saved.binance_pay_id,
    binanceInstructions: saved.binance_instructions,
  });
}
