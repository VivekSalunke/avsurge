import { approxInINR, formatPrice, formatPriceINR, type CurrencyCode } from '@/lib/format'
import { describeMarkets, MARKET_LABELS, type MarketCode, type RegionalPrice } from '@/lib/markets'

/**
 * Shown instead of the Indian price box and buy buttons on devices that are not
 * officially sold in India (e.g. China-only launches).
 */
export default function NotSoldInIndia({
  markets,
  prices,
}: {
  markets: string[] | null
  prices: RegionalPrice[]
}) {
  // Cheapest official launch price per region
  const byRegion = new Map<string, RegionalPrice>()
  for (const p of prices) {
    const current = byRegion.get(p.region_code)
    if (!current || p.price_amount < current.price_amount) byRegion.set(p.region_code, p)
  }

  return (
    <div className="mb-4">
      <div
        className="rounded-xl px-3 py-2 mb-3 text-xs font-medium text-center"
        style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}
      >
        Not officially sold in India · launched in {describeMarkets(markets)}
      </div>

      {[...byRegion.values()].map(p => {
        const currency = p.currency_code as CurrencyCode
        const approx = approxInINR(p.price_amount, currency)
        return (
          <div key={p.region_code} className="price-tag rounded-xl px-4 py-3 mb-2 text-center">
            <div className="text-xs mb-0.5" style={{ color: '#22d3ee' }}>
              {MARKET_LABELS[p.region_code as MarketCode] ?? p.region_code} launch price
            </div>
            <div className="text-2xl font-bold" style={{ color: '#22d3ee' }}>
              {formatPrice(p.price_amount, currency)}
            </div>
            {approx !== null && currency !== 'INR' && (
              <div className="text-xs text-[rgba(255,255,255,0.5)] mt-0.5">
                ≈ {formatPriceINR(approx)} (converted, approximate)
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
