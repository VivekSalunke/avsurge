import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

const brandIcons: Record<string, string> = {
  Samsung: '🔵', Apple: '🍎', OnePlus: '🔴', Google: '🟡',
  Xiaomi: '🟠', Realme: '🟢', Vivo: '🔷', OPPO: '🟣',
  Nothing: '⚫', iQOO: '🔸', Motorola: '🔹',
}

export default async function BrandsPage() {
  const { data: phonesRaw } = await supabase.from('phones').select('brand')
  const brandCount: Record<string, number> = {}
  for (const p of phonesRaw || []) {
    brandCount[p.brand] = (brandCount[p.brand] || 0) + 1
  }
  const brands = Object.entries(brandCount).sort((a, b) => b[1] - a[1])

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Phone Brands in India</h1>
        <p className="text-sm text-gray-400">Browse smartphones by brand</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {brands.map(([brand, count]) => (
          <Link key={brand} href={`/brands/${encodeURIComponent(brand)}`}
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group text-center">
            <div className="text-4xl mb-3">{brandIcons[brand] || '📱'}</div>
            <h2 className="font-bold text-gray-900 group-hover:text-blue-600 transition">{brand}</h2>
            <p className="text-xs text-gray-400 mt-1">{count} phones</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
