import { del, get, list, put } from "@vercel/blob"

/**
 * Vercel Blob Utility
 *
 * Configured for the Hobby Plan limitations:
 * - Free up to 1 GB storage
 * - 10,000 simple ops, 2,000 advanced ops
 * - 10 GB blob transfer
 *
 * Recommended use cases for Wong Digital Shop:
 * Small public assets or lightweight user uploads (e.g. avatars, lightweight product images).
 */

export const uploadAsset = async (filename: string, file: File | Blob | string) => {
  return await put(filename, file, { access: "public" })
}

export const privateReceiptPrefix = "blob:private:"

function sanitizeFilename(filename: string) {
  return filename
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const uploadReceiptAsset = async (file: File) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    if (process.env.NODE_ENV === "development") {
      console.warn("BLOB_READ_WRITE_TOKEN is missing. Skipping actual Vercel upload for local development.")
      return {
        url: `https://mock-blob-url.vercel.app/receipts/mock-${Date.now()}`,
        downloadUrl: `https://mock-blob-url.vercel.app/receipts/mock-${Date.now()}`,
        pathname: `receipts/mock-${Date.now()}`,
        contentType: file.type || "image/jpeg",
        contentDisposition: "inline",
      }
    }
    throw new Error("BLOB_READ_WRITE_TOKEN is required before receipt uploads can be enabled.")
  }

  const buffer = await file.arrayBuffer()
  const arr = new Uint8Array(buffer).subarray(0, 12)
  const hex = Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()

  const isJPEG = hex.startsWith("FFD8FF")
  const isPNG = hex.startsWith("89504E47")
  const isWEBP = hex.startsWith("52494646") && hex.substring(16, 24) === "57454250"
  const isPDF = hex.startsWith("25504446")

  if (!isJPEG && !isPNG && !isWEBP && !isPDF) {
    throw new Error("Invalid file format. Uploaded asset failed security signature validation.")
  }

  const safeFilename = sanitizeFilename(file.name || "receipt")
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "")

  return await put(`receipts/${timestamp}/${safeFilename}`, file, {
    access: "private",
    contentType: file.type || undefined,
    addRandomSuffix: true,
  })
}

export function encodePrivateReceiptPath(pathname: string) {
  return `${privateReceiptPrefix}${pathname}`
}

export function decodePrivateReceiptPath(receiptPath: string | null | undefined) {
  if (!receiptPath?.startsWith(privateReceiptPrefix)) {
    return null
  }

  return receiptPath.slice(privateReceiptPrefix.length)
}

export async function getPrivateAsset(pathname: string, ifNoneMatch?: string | null) {
  return await get(pathname, {
    access: "private",
    ifNoneMatch: ifNoneMatch ?? undefined,
    useCache: false,
  })
}

export async function deleteReceiptAssetsOlderThan(retentionDays: number) {
  const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000
  let cursor: string | undefined
  let deletedCount = 0

  do {
    const result = await list({
      cursor,
      limit: 250,
      prefix: "receipts/",
    })

    const expiredPathnames = result.blobs
      .filter((blob) => blob.uploadedAt.getTime() <= cutoffTime)
      .map((blob) => blob.pathname)

    if (expiredPathnames.length > 0) {
      await del(expiredPathnames)
      deletedCount += expiredPathnames.length
    }

    cursor = result.hasMore ? result.cursor : undefined
  } while (cursor)

  return deletedCount
}

export const deleteAsset = async (url: string) => {
  return await del(url)
}

export const listAssets = async () => {
  return await list()
}
