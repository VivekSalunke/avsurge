import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function getCategory(price: number): string {
  if (price < 15000) return 'budget'
  if (price < 30000) return 'mid'
  if (price < 60000) return 'upper-mid'
  return 'premium'
}

export default async function RelatedTablets({ tabletId, brand, priceInr }: {
  tabletId: number
  brand: string
  priceInr: number | null
}) {
  const { data: allTablets } = await supabase
    .from('tablets')
    .select('id, name, brand, slug, price_inr, image_url')
    .neq('id', tabletId)
    .order('price_inr', { ascending: true })

  if (!allTablets || allTablets.length === 0) return null

  const currentCategory = priceInr ? getCategory(priceInr) : 'mid'
  const currentPrice = priceInr || 0

  const scored = allTablets.map(tablet => {
    let score = 0
    if (tablet.brand === brand) score += 3
    if (tablet.price_inr && priceInr) {
      const diff = Math.abs(tablet.price_inr - currentPrice) / currentPrice
      if (diff < 0.1) score += 4
      else if (diff < 0.2) score += 3
      else if (diff < 0.3) score += 2
      else if (diff < 0.5) score += 1
    }
    if (tablet.price_inr && getCategory(tablet.price_inr) === currentCategory) score += 2
    return { ...tablet, score }
  })

  const related = scored.sort((a, b) => b.score - a.score).slice(0, 4)
  if (related.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">Similar tablets</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
        {related.map(tablet => (
          <Link key={tablet.id} href={`/tablets/${tablet.slug}`}
            className="p-4 text-center hover:bg-blue-50 transition group">
            <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-3 overflow-hidden">
              {tablet.image_url
                ? <img src={tablet.image_url} alt={tablet.name} className="object-contain w-full h-full p-2" />
                : <span className="text-3xl">📟</span>}
            </div>
            <p className="text-xs text-gray-400 mb-0.5">{tablet.brand}</p>
            <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2 leading-tight mb-1">{tablet.name}</p>
            {tablet.price_inr && (
              <p className="text-xs text-blue-600 font-medium">₹{tablet.price_inr.toLocaleString('en-IN')}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
