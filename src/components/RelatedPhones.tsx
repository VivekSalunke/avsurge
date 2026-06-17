import { supabase } from '@/lib/supabase'
import Link from 'next/link'

async function getRelated(phoneId: number, brand: string, priceInr: number | null) {
  // Get phones from same brand, similar price range
  const minPrice = priceInr ? priceInr * 0.6 : 0
  const maxPrice = priceInr ? priceInr * 1.4 : 999999

  const { data } = await supabase
    .from('phones')
    .select('*')
    .eq('brand', brand)
    .neq('id', phoneId)
    .gte('price_inr', minPrice)
    .lte('price_inr', maxPrice)
    .limit(4)

  // If less than 4 from same brand, fill with other brands in price range
  if ((data || []).length < 4) {
    const existing = (data || []).map(p => p.id)
    const { data: more } = await supabase
      .from('phones')
      .select('*')
      .neq('id', phoneId)
      .neq('brand', brand)
      .gte('price_inr', minPrice)
      .lte('price_inr', maxPrice)
      .not('id', 'in', `(${[phoneId, ...existing].join(',')})`)
      .limit(4 - (data || []).length)
    return [...(data || []), ...(more || [])]
  }

  return data || []
}

export default async function RelatedPhones({ phoneId, brand, priceInr }: {
  phoneId: number
  brand: string
  priceInr: number | null
}) {
  const related = await getRelated(phoneId, brand, priceInr)
  if (related.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">Similar phones</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-gray-100">
        {related.map(phone => (
          <Link key={phone.id} href={`/phones/${phone.slug}`}
            className="p-4 text-center hover:bg-blue-50 transition group">
            <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-3 overflow-hidden">
              {phone.image_url
                ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full p-2" />
                : <span className="text-3xl">📱</span>}
            </div>
            <p className="text-xs text-gray-400 mb-0.5">{phone.brand}</p>
            <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2 leading-tight mb-1">{phone.name}</p>
            {phone.price_inr && (
              <p className="text-xs text-blue-600 font-medium">Rs.{phone.price_inr.toLocaleString('en-IN')}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
