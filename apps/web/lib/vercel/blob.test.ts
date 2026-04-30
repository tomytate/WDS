import { describe, expect, it } from "vitest"
import {
  encodePrivateReceiptPath,
  decodePrivateReceiptPath,
  privateReceiptPrefix,
} from "./blob"

describe("Vercel Blob Utilities", () => {
  describe("privateReceiptPrefix", () => {
    it("is a non-empty string starting with blob:", () => {
      expect(privateReceiptPrefix).toBeDefined()
      expect(privateReceiptPrefix.startsWith("blob:")).toBe(true)
    })
  })

  describe("encodePrivateReceiptPath", () => {
    it("prepends the private receipt prefix", () => {
      const encoded = encodePrivateReceiptPath("receipts/20260417/test.jpg")
      expect(encoded).toBe(`${privateReceiptPrefix}receipts/20260417/test.jpg`)
    })

    it("handles empty pathname", () => {
      const encoded = encodePrivateReceiptPath("")
      expect(encoded).toBe(privateReceiptPrefix)
    })
  })

  describe("decodePrivateReceiptPath", () => {
    it("strips the prefix and returns the raw pathname", () => {
      const encoded = `${privateReceiptPrefix}receipts/20260417/test.jpg`
      expect(decodePrivateReceiptPath(encoded)).toBe("receipts/20260417/test.jpg")
    })

    it("returns null for paths without the prefix", () => {
      expect(decodePrivateReceiptPath("https://example.com/receipt.jpg")).toBeNull()
    })

    it("returns null for null input", () => {
      expect(decodePrivateReceiptPath(null)).toBeNull()
    })

    it("returns null for undefined input", () => {
      expect(decodePrivateReceiptPath(undefined)).toBeNull()
    })

    it("returns null for empty string", () => {
      expect(decodePrivateReceiptPath("")).toBeNull()
    })

    it("roundtrips correctly through encode → decode", () => {
      const original = "receipts/20260417/my-receipt-abc123.png"
      const encoded = encodePrivateReceiptPath(original)
      const decoded = decodePrivateReceiptPath(encoded)
      expect(decoded).toBe(original)
    })
  })
})
