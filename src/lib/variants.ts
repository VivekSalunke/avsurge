export type DeviceKind = 'phone' | 'tablet'

/**
 * Supabase table and foreign-key column for each kind of device.
 * Tablets also record connectivity (Wi-Fi vs Wi-Fi + Cellular), since many
 * tablets are sold in both versions with the same RAM and storage.
 */
export const VARIANT_TABLES: Record<DeviceKind, { table: string; deviceColumn: string; hasConnectivity: boolean }> = {
  phone: { table: 'phone_variants', deviceColumn: 'phone_id', hasConnectivity: false },
  tablet: { table: 'tablet_variants', deviceColumn: 'tablet_id', hasConnectivity: true },
}

export type VariantStore = 'amazon' | 'flipkart'
export type Connectivity = 'wifi' | 'cellular'

export interface DeviceVariant {
  id: number
  phone_id?: number
  tablet_id?: number
  ram_gb: number
  storage_gb: number
  price_inr: number
  store: VariantStore
  store_url: string | null
  /** Tablets only */
  connectivity?: Connectivity
  /** Launch date of this variant (YYYY-MM-DD); the earliest one becomes the device's release date */
  released_at: string | null
  sort_order: number
}

/** Earliest launch date among the variants, or null if none has a date */
export function earliestLaunchDate(list: Pick<DeviceVariant, 'released_at'>[]): string | null {
  const dates = list.map(v => v.released_at).filter((d): d is string => Boolean(d)).sort()
  return dates[0] ?? null
}

/** Kept so existing imports keep working */
export type PhoneVariant = DeviceVariant

export const STORE_LABELS: Record<VariantStore, string> = {
  amazon: 'Amazon',
  flipkart: 'Flipkart',
}

export const CONNECTIVITY_LABELS: Record<Connectivity, string> = {
  wifi: 'Wi-Fi',
  cellular: 'Wi-Fi + Cellular',
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

/** "8 GB + 256 GB", or "8 GB + 256 GB · Wi-Fi" for tablets */
export function formatVariantLabel(ramGb: number, storageGb: number, connectivity?: Connectivity): string {
  const base = `${ramGb} GB + ${formatStorage(storageGb)}`
  return connectivity ? `${base} · ${CONNECTIVITY_LABELS[connectivity]}` : base
}

/** Cheapest first, then by RAM, then storage, then Wi-Fi before Cellular */
export function sortVariants<T extends Pick<DeviceVariant, 'sort_order' | 'price_inr' | 'ram_gb' | 'storage_gb' | 'connectivity'>>(list: T[]): T[] {
  const conn = (c?: Connectivity) => (c === 'cellular' ? 1 : 0)
  return [...list].sort(
    (a, b) =>
      a.sort_order - b.sort_order ||
      a.price_inr - b.price_inr ||
      a.ram_gb - b.ram_gb ||
      a.storage_gb - b.storage_gb ||
      conn(a.connectivity) - conn(b.connectivity)
  )
}
