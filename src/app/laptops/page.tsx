import { supabase } from '@/lib/supabase'
import Link from 'next/link'
export const revalidate = 60
export const metadata = {
  title: 'Laptops Price List in India 2025',
  alternates: { canonical: 'https://avsurge.com/laptops' },
  description: 'Browse all laptops available in India. Compare laptop specs, prices and reviews. Find the best laptop for your budget.',
}
export default async function LaptopsPage({ searchParams }: { searchParams: Promise<{ brand?: string }> }) {
  const params = await searchParams
  const brand = params?.brand
  let query = supabase.from('laptops').select('*').order('created_at', { ascending: false })
  if (brand) query = query.ilike('brand', brand)
  const { data: laptops } = await query
  const { data: brandsRaw } = await supabase.from('laptops').select('brand')
  const brands = [...new Set((brandsRaw || []).map((b: any) => b.brand))].sort()
  const brandIcons: Record<string, string> = {
    Apple: '🍎', Dell: '🔵', HP: '🔷', Lenovo: '🔲',
    ASUS: '🟥', Acer: '🟢', Microsoft: '🪟', Samsung: '🔵',
    MSI: '🔴', Razer: '🟢', LG: '🟣',
  }
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white">
        <p className="text-blue-200 text-xs mb-2 uppercase tracking-widest font-medium">India's laptop database</p>
        <h1 className="text-3xl font-bold mb-2">Find your perfect laptop</h1>
        <p className="text-blue-100 mb-6 max-w-md">Specs, prices and comparisons for every laptop in India.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/compare-laptops" className="bg-white text-blue-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition">
            Compare laptops
          </Link>
          <Link href="/best-laptops/50000" className="bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/30 transition">
            Browse by budget
          </Link>
        </div>
      </div>

      {/* Browse by budget */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-4">Browse by budget</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Under ₹30K', budget: 30000 },
            { label: 'Under ₹50K', budget: 50000 },
            { label: 'Under ₹70K', budget: 70000 },
            { label: 'Under ₹1L', budget: 100000 },
            { label: 'Under ₹1.5L', budget: 150000 },
            { label: 'Under ₹2L', budget: 200000 },
          ].map(({ label, budget }) => (
            <Link key={budget} href={`/best-laptops/${budget}`}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-sm transition group">
              <div className="text-2xl mb-1">💻</div>
              <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Brand filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/laptops"
          className={`px-3 py-1.5 rounded-full text-sm border transition ${!brand ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
          All
        </Link>
        {brands.map((b: any) => (
          <Link key={b} href={`/laptops?brand=${b}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition ${brand === b ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
            <span>{brandIcons[b] || '💻'}</span>{b}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">{brand ? `${brand} laptops` : 'All laptops'}</h2>
        <span className="text-sm text-gray-400">{laptops?.length || 0} devices</span>
      </div>

      {(!laptops || laptops.length === 0) ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center text-gray-400">
          <div className="text-4xl mb-3">💻</div>
          <p className="text-sm">No laptops yet. Add some from the admin panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {laptops.map((laptop: any) => (
            <div key={laptop.id} className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-sm transition group">
              <Link href={`/laptops/${laptop.slug}`}>
              <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                {laptop.image_url
                  ? <img src={laptop.image_url} alt={laptop.name} className="object-contain w-full h-full" />
                  : <span className="text-4xl">💻</span>}
              </div>
              <p className="text-xs text-gray-400 mb-0.5">{laptop.brand}</p>
              <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-blue-600 transition line-clamp-2">{laptop.name}</p>
              {laptop.price_inr && (
                <p className="text-xs text-blue-600 font-medium mt-1">₹{laptop.price_inr.toLocaleString('en-IN')}</p>
              )}
              </Link>
              <Link href={`/compare-laptops?a=${laptop.slug}`}
                className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg py-1.5 transition border border-transparent hover:border-blue-200">
                ⚖️ Compare
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
