/** Where a device is officially sold. Stored as `markets text[]` on phones/tablets/laptops. */
export type MarketCode = 'IN' | 'CN' | 'GLOBAL'

export const MARKET_LABELS: Record<MarketCode, string> = {
  IN: 'India',
  CN: 'China',
  GLOBAL: 'Global',
}

/** Devices without a markets value are treated as Indian (the site's original default) */
export function isSoldInIndia(markets: string[] | null | undefined): boolean {
  if (!markets || markets.length === 0) return true
  return markets.includes('IN') || markets.includes('GLOBAL')
}

/** "China", "China and Global", ... for the "launched in" badge */
export function describeMarkets(markets: string[] | null | undefined): string {
  const names = (markets ?? [])
    .map(m => MARKET_LABELS[m as MarketCode] ?? m)
    .filter(Boolean)
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] ?? 'other markets'
}

export interface RegionalPrice {
  region_code: string
  currency_code: string
  price_amount: number
  retailer: string
}
