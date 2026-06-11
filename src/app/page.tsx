import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

export default async function HomePage() {
  const { data: phones } = await supabase
    .from('phones')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12)

  const { data: brandsRaw } = await supabase
    .from('phones')
    .select('brand')

  const brands = [...new Set((brandsRaw || []).map((b: any) => b.brand))].sort()

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="bg-blue-600 rounded-2xl p-8 mb-10 text-white">
        <p className="text-blue-200 text-sm mb-2 uppercase tracking-widest">India's phone database</p>
        <h1 className="text-3xl font-bold mb-2">Find your perfect phone</h1>
        <p className="text-blue-100 mb-6">Specs, prices, and comparisons for every phone in India</p>
        <div className="flex gap-3">
          <Link href="/phones" className="bg-white text-blue-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition">
            Browse all phones
          </Link>
          <Link href="/finder" className="border border-white/40 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition">
            Phone finder →
          </Link>
        </div>
      </div>

      {/* Latest phones */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Latest phones</h2>
          <Link href="/phones" className="text-sm text-blue-600 hover:underline">See all →</Link>
        </div>

        {phones && phones.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
          <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center">
            <p className="text-gray-400 text-sm mb-3">No phones added yet</p>
            <Link href="/admin/add-phone" className="text-blue-600 text-sm font-medium hover:underline">Add your first phone →</Link>
          </div>
        )}
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Browse by brand</h2>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand: any) => (
              <Link key={brand} href={`/phones?brand=${brand}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition">
                {brand}
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
