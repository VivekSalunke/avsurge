export type DeviceKind = 'phone' | 'tablet'

/** Supabase table and foreign-key column for each kind of device */
export const VARIANT_TABLES: Record<DeviceKind, { table: string; deviceColumn: string }> = {
  phone: { table: 'phone_variants', deviceColumn: 'phone_id' },
  tablet: { table: 'tablet_variants', deviceColumn: 'tablet_id' },
}

export interface DeviceVariant {
  id: number
  phone_id?: number
  tablet_id?: number
  ram_gb: number
  storage_gb: number
  price_inr: number
  store: VariantStore
  store_url: string | null
  sort_order: number
}

/** Kept so existing imports keep working */
export type PhoneVariant = DeviceVariant

export type VariantStore = 'amazon' | 'flipkart'

export const STORE_LABELS: Record<VariantStore, string> = {
  amazon: 'Amazon',
  flipkart: 'Flipkart',
}

/** The URL a store link must start with, per store */
export const STORE_URL_PATTERNS: Record<VariantStore, RegExp> = {
  amazon: /^https:\/\/(www\.)?amazon\.in\//,
  flipkart: /^https:\/\/(www\.)?flipkart\.com\//,
}

/** 1024 GB -> "1 TB", 512 -> "512 GB" */
export function formatStorage(gb: number): string {
  return gb >= 1024 && gb % 1024 === 0 ? `${gb / 1024} TB` : `${gb} GB`
}

/** "8 GB + 256 GB" */
export function formatVariantLabel(ramGb: number, storageGb: number): string {
  return `${ramGb} GB + ${formatStorage(storageGb)}`
}

/** Cheapest first, then by RAM, then by storage */
export function sortVariants<T extends Pick<DeviceVariant, 'sort_order' | 'price_inr' | 'ram_gb' | 'storage_gb'>>(list: T[]): T[] {
  return [...list].sort(
    (a, b) =>
      a.sort_order - b.sort_order ||
      a.price_inr - b.price_inr ||
      a.ram_gb - b.ram_gb ||
      a.storage_gb - b.storage_gb
  )
}
