import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

export default async function PhonesPage({ searchParams }: { searchParams: { brand?: string } }) {
  let query = supabase.from('phones').select('*').order('created_at', { ascending: false })
  if (searchParams.brand) query = query.ilike('brand', searchParams.brand)

  const { data: phones } = await query
  const { data: brandsRaw } = await supabase.from('phones').select('brand')
  const brands = [...new Set((brandsRaw || []).map((b: any) => b.brand))].sort()

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {searchParams.brand ? `${searchParams.brand} phones` : 'All phones'}
        </h1>
        <span className="text-sm text-gray-400">{phones?.length || 0} devices</span>
      </div>

      {/* Brand filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/phones"
          className={`px-3 py-1.5 rounded-full text-sm border transition ${!searchParams.brand ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
          All
        </Link>
        {brands.map((brand: any) => (
          <Link key={brand} href={`/phones?brand=${brand}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${searchParams.brand === brand ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
            {brand}
          </Link>
        ))}
      </div>

      {phones && phones.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {phones.map((phone: any) => (
            <Link key={phone.id} href={`/phones/${phone.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-sm transition group">
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
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl py-20 text-center">
          <p className="text-gray-400 text-sm mb-3">No phones found</p>
          <Link href="/admin/add-phone" className="text-blue-600 text-sm font-medium hover:underline">Add a phone →</Link>
        </div>
      )}
    </main>
  )
}
