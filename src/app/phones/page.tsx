import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60
export const metadata = {
  title: 'Phones Price List in India 2025 | AVSurge',
  description: 'Browse all smartphones available in India. Compare phone specs, prices and reviews. Find the best phone for your budget.',
  alternates: { canonical: 'https://avsurge.com/phones' },
}

export default async function PhonesPage({ searchParams }: { searchParams: Promise<{ brand?: string }> }) {
  const params = await searchParams
  const brand = params?.brand

  let query = supabase.from('phones').select('*').order('created_at', { ascending: false })
  if (brand) query = query.ilike('brand', brand)
  const { data: phones } = await query

  const { data: brandsRaw } = await supabase.from('phones').select('brand')
  const brands = [...new Set((brandsRaw || []).map((b: any) => b.brand))].sort()

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {brand ? `${brand} phones` : 'All phones'}
        </h1>
        <span className="text-sm text-gray-400">{phones?.length || 0} devices</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/phones"
          className={`px-3 py-1.5 rounded-full text-sm border transition ${!brand ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
          All
        </Link>
        {brands.map((b: any) => (
          <Link key={b} href={`/phones?brand=${b}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${brand === b ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
            {b}
          </Link>
        ))}
      </div>

      {phones && phones.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {phones.map((phone: any) => (
            <div key={phone.id} className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 transition group card-hover relative">
              <Link href={`/phones/${phone.slug}`}>
              <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 text-4xl">
                {phone.image_url ? (
                  <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full" />
                ) : '📱'}
              </div>
              <p className="text-xs text-gray-400 mb-0.5">{phone.brand}</p>
              <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-blue-600 transition line-clamp-2">{phone.name}</p>
              {phone.price_inr && (
                <p className="text-xs text-blue-600 font-medium mt-1">₹{phone.price_inr.toLocaleString('en-IN')}</p>
              )}
              </Link>
              <Link href={`/compare?a=${phone.slug}`}
                className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg py-1.5 transition border border-transparent hover:border-blue-200">
                ⚖️ Compare
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl py-20 text-center">
          <p className="text-gray-400 text-sm mb-3">No phones found</p>
          <Link href="/phones" className="text-blue-600 text-sm font-medium hover:underline">View all phones →</Link>
        </div>
      )}
    </main>
  )
}
