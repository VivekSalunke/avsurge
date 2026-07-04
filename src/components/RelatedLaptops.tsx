import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function getCategory(price: number): string {
  if (price < 40000) return 'budget'
  if (price < 70000) return 'mid'
  if (price < 120000) return 'upper-mid'
  if (price < 180000) return 'premium'
  return 'flagship'
}

export default async function RelatedLaptops({ laptopId, brand, priceInr }: {
  laptopId: number
  brand: string
  priceInr: number | null
}) {
  const { data: allLaptops } = await supabase
    .from('laptops')
    .select('id, name, brand, slug, price_inr, image_url')
    .neq('id', laptopId)
    .order('price_inr', { ascending: true })

  if (!allLaptops || allLaptops.length === 0) return null

  const currentCategory = priceInr ? getCategory(priceInr) : 'mid'
  const currentPrice = priceInr || 0

  // Score each laptop by similarity
  const scored = allLaptops.map(laptop => {
    let score = 0
    if (laptop.brand === brand) score += 3
    if (laptop.price_inr && priceInr) {
      const diff = Math.abs(laptop.price_inr - currentPrice) / currentPrice
      if (diff < 0.1) score += 4
      else if (diff < 0.2) score += 3
      else if (diff < 0.3) score += 2
      else if (diff < 0.5) score += 1
    }
    if (laptop.price_inr && getCategory(laptop.price_inr) === currentCategory) score += 2
    return { ...laptop, score }
  })

  const related = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  if (related.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">Similar laptops</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
        {related.map(laptop => (
          <Link key={laptop.id} href={`/laptops/${laptop.slug}`}
            className="p-4 text-center hover:bg-blue-50 transition group">
            <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-3 overflow-hidden">
              {laptop.image_url
                ? <img src={laptop.image_url} alt={laptop.name} className="object-contain w-full h-full p-2" />
                : <span className="text-3xl">💻</span>}
            </div>
            <p className="text-xs text-gray-400 mb-0.5">{laptop.brand}</p>
            <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2 leading-tight mb-1">{laptop.name}</p>
            {laptop.price_inr && (
              <p className="text-xs text-blue-600 font-medium">₹{laptop.price_inr.toLocaleString('en-IN')}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
