import { supabase } from '@/lib/supabase'
import Link from 'next/link'
export const revalidate = 60
const brandIcons: Record<string, string> = {
  Samsung: '🔵', Apple: '🍎', OnePlus: '🔴', Google: '🟡',
  Xiaomi: '🟠', Realme: '🟢', Vivo: '🔷', OPPO: '🟣',
  Nothing: '⚫', iQOO: '🔸', Motorola: '🔹', Lenovo: '🔲',
  ASUS: '🟥', Dell: '🔵', HP: '🔷', Acer: '🟢', MSI: '🔴',
  Microsoft: '🪟', Razer: '🟢', LG: '🟣',
}
export default async function BrandsPage() {
  const [{ data: phonesRaw }, { data: tabletsRaw }, { data: laptopsRaw }] = await Promise.all([
    supabase.from('phones').select('brand'),
    supabase.from('tablets').select('brand'),
    supabase.from('laptops').select('brand'),
  ])
  const phoneBrandCount: Record<string, number> = {}
  for (const p of phonesRaw || []) phoneBrandCount[p.brand] = (phoneBrandCount[p.brand] || 0) + 1

  const tabletBrandCount: Record<string, number> = {}
  for (const t of tabletsRaw || []) tabletBrandCount[t.brand] = (tabletBrandCount[t.brand] || 0) + 1

  const laptopBrandCount: Record<string, number> = {}
  for (const l of laptopsRaw || []) laptopBrandCount[l.brand] = (laptopBrandCount[l.brand] || 0) + 1

  const phoneBrands = Object.entries(phoneBrandCount).sort((a, b) => b[1] - a[1])
  const tabletBrands = Object.entries(tabletBrandCount).sort((a, b) => b[1] - a[1])
  const laptopBrands = Object.entries(laptopBrandCount).sort((a, b) => b[1] - a[1])

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Brands</h1>
        <p className="text-sm text-gray-400">Browse phones, tablets and laptops by brand</p>
      </div>

      {/* Phone brands */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-base font-bold text-gray-900">📱 Phone Brands</h2>
          <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">{phoneBrands.length} brands</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {phoneBrands.map(([brand, count]) => (
            <Link key={brand} href={`/brands/${encodeURIComponent(brand)}`}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group text-center">
              <div className="text-4xl mb-3">{brandIcons[brand] || '📱'}</div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition text-sm">{brand}</h3>
              <p className="text-xs text-gray-400 mt-1">{count} phone{count !== 1 ? 's' : ''}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Tablet brands */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-base font-bold text-gray-900">📟 Tablet Brands</h2>
          <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">{tabletBrands.length} brands</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tabletBrands.map(([brand, count]) => (
            <Link key={brand} href={`/brands/${encodeURIComponent(brand)}`}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group text-center">
              <div className="text-4xl mb-3">{brandIcons[brand] || '📟'}</div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition text-sm">{brand}</h3>
              <p className="text-xs text-gray-400 mt-1">{count} tablet{count !== 1 ? 's' : ''}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Laptop brands */}
      {laptopBrands.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-base font-bold text-gray-900">💻 Laptop Brands</h2>
            <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">{laptopBrands.length} brands</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {laptopBrands.map(([brand, count]) => (
              <Link key={brand} href={`/brands/${encodeURIComponent(brand)}`}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group text-center">
                <div className="text-4xl mb-3">{brandIcons[brand] || '💻'}</div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition text-sm">{brand}</h3>
                <p className="text-xs text-gray-400 mt-1">{count} laptop{count !== 1 ? 's' : ''}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
