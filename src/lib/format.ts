type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'EUR' | 'AED'

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
