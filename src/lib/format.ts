export type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'EUR' | 'AED' | 'CNY'

interface CurrencyConfig {
  symbol: string
  locale: string
  maximumFractionDigits: number
}

const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyConfig> = {
  INR: { symbol: '₹', locale: 'en-IN', maximumFractionDigits: 0 },
  USD: { symbol: '$', locale: 'en-US', maximumFractionDigits: 0 },
  GBP: { symbol: '£', locale: 'en-GB', maximumFractionDigits: 0 },
  EUR: { symbol: '€', locale: 'de-DE', maximumFractionDigits: 0 },
  AED: { symbol: 'AED ', locale: 'en-AE', maximumFractionDigits: 0 },
  CNY: { symbol: '¥', locale: 'zh-CN', maximumFractionDigits: 0 },
}

/**
 * Approximate rupees per unit of each currency, used only for "≈ ₹" estimates
 * on devices not sold in India. Mid-market rates, 3 Nov 2026 — update occasionally.
 */
const APPROX_INR_PER_UNIT: Partial<Record<CurrencyCode, number>> = {
  INR: 1,
  CNY: 14.2,
}

/** Rough rupee equivalent, rounded to the nearest ₹100; null if no rate is known */
export function approxInINR(amount: number, currencyCode: CurrencyCode): number | null {
  const rate = APPROX_INR_PER_UNIT[currencyCode]
  return rate ? Math.round((amount * rate) / 100) * 100 : null
}

/**
 * Formats a price with the correct symbol and locale grouping for a given currency.
 * Defaults to INR to preserve existing India-only behavior.
 */
export function formatPrice(
  amount: number | null | undefined,
  currencyCode: CurrencyCode = 'INR'
): string {
  if (amount === null || amount === undefined) return 'N/A'

  const config = CURRENCY_CONFIG[currencyCode] ?? CURRENCY_CONFIG.INR
  const formatted = amount.toLocaleString(config.locale, {
    maximumFractionDigits: config.maximumFractionDigits,
  })

  return `${config.symbol}${formatted}`
}

/**
 * Convenience wrapper — identical output to the old `{formatPriceINR(x)}`
 * pattern used throughout the codebase. Use this for a safe drop-in replacement.
 */
export function formatPriceINR(amount: number | null | undefined): string {
  return formatPrice(amount, 'INR')
}
