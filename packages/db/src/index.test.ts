import { describe, expect, it } from "vitest";

import { defaultStoreSettings } from "./store-config";

describe("DB Package", () => {
  describe("Default Store Settings", () => {
    it("exports a non-empty store name", () => {
      expect(defaultStoreSettings.storeName).toBeDefined();
      expect(defaultStoreSettings.storeName.length).toBeGreaterThan(0);
    });

    it("exports a valid support email", () => {
      expect(defaultStoreSettings.supportEmail).toContain("@");
    });

    it("exports a QRPH number placeholder", () => {
      expect(defaultStoreSettings.qrphNumber).toBeDefined();
      expect(defaultStoreSettings.qrphNumber.length).toBeGreaterThan(0);
    });

    it("exports QRPH instructions", () => {
      expect(defaultStoreSettings.qrphInstructions).toBeDefined();
      expect(defaultStoreSettings.qrphInstructions.length).toBeGreaterThan(0);
    });

    it("exports Binance Pay ID", () => {
      expect(defaultStoreSettings.binancePayId).toBeDefined();
      expect(defaultStoreSettings.binancePayId.length).toBeGreaterThan(0);
    });

    it("exports Binance instructions", () => {
      expect(defaultStoreSettings.binanceInstructions).toBeDefined();
      expect(defaultStoreSettings.binanceInstructions.length).toBeGreaterThan(
        0,
      );
    });

    it("has all required fields", () => {
      const requiredKeys = [
        "storeName",
        "supportEmail",
        "qrphNumber",
        "qrphInstructions",
        "binancePayId",
        "binanceInstructions",
      ];

      for (const key of requiredKeys) {
        expect(defaultStoreSettings).toHaveProperty(key);
      }
    });
  });
});
