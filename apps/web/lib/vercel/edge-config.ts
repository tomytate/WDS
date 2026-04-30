export type PromoBanner = {
  text: string
  link?: string
  variant?: "info" | "accent"
} | null

export type StoreRuntimeFlags = {
  maintenanceMode: boolean
  acceptOrders: boolean
  boostingEnabled: boolean
  maintenanceMessage: string | null
  promoBanner: PromoBanner
}

// Hardcoded for production launch without Edge Config setup.
const defaultStoreRuntimeFlags: StoreRuntimeFlags = {
  maintenanceMode: false,
  acceptOrders: true,
  boostingEnabled: true,
  maintenanceMessage: "We are currently undergoing upgrades securely.",
  promoBanner: null,
}

export async function getStoreRuntimeFlags(): Promise<StoreRuntimeFlags> {
  return defaultStoreRuntimeFlags;
}
