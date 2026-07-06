import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

export const metadata = {
  title: 'Tablets Price List in India',
  alternates: { canonical: 'https://avsurge.com/tablets' },
  description: 'Browse all tablets available in India. Compare tablet specs, prices and reviews. Find the best tablet for your budget.',
}

export default async function TabletsPage({ searchParams }: { searchParams: Promise<{ brand?: string }> }) {
  const params = await searchParams
  const brand = params?.brand

  let query = supabase.from('tablets').select('*').order('created_at', { ascending: false })
  if (brand) query = query.ilike('brand', brand)
  const { data: tablets } = await query

  const { data: brandsRaw } = await supabase.from('tablets').select('brand')
  const brands = [...new Set((brandsRaw || []).map((b: any) => b.brand))].sort()

  const brandIcons: Record<string, string> = {
    Samsung: '🔵', Apple: '🍎', Xiaomi: '🟠', Realme: '🟢',
    Lenovo: '🔷', OnePlus: '🔴', OPPO: '🟣', Honor: '🟡',
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white">
        <p className="text-blue-200 text-xs mb-2 uppercase tracking-widest font-medium">India's tablet database</p>
        <h1 className="text-3xl font-bold mb-2">Find your perfect tablet</h1>
        <p className="text-blue-100 max-w-md">Specs, prices and comparisons for every tablet in India.</p>
          <div className="flex gap-3 mt-6">
            <Link href="/compare-tablets" className="bg-white text-blue-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition">Compare tablets →</Link>
          </div>
      </div>

      {/* Brand filter */}
      {/* Browse by Budget */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-4">Browse by budget</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Under ₹10K', budget: 10000 },
            { label: 'Under ₹20K', budget: 20000 },
            { label: 'Under ₹30K', budget: 30000 },
            { label: 'Under ₹50K', budget: 50000 },
            { label: 'Under ₹1L', budget: 100000 },
            { label: 'Under ₹1.5L', budget: 150000 },
          ].map(({ label, budget }) => (
            <Link key={budget} href={`/best-tablets/${budget}`}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-sm transition group">
              <div className="text-2xl mb-1">📟</div>
              <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/tablets"
          className={`px-3 py-1.5 rounded-full text-sm border transition ${!brand ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
          All
        </Link>
        {brands.map((b: any) => (
          <Link key={b} href={`/tablets?brand=${b}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${brand === b ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
            {brandIcons[b] || '📱'} {b}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-gray-900">{brand ? `${brand} tablets` : 'All tablets'}</h2>
        <span className="text-sm text-gray-400">{tablets?.length || 0} devices</span>
      </div>

      {tablets && tablets.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tablets.map((tablet: any) => (
            <div key={tablet.id} className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 transition group">
              <Link href={`/tablets/${tablet.slug}`}>
              <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                {tablet.image_url
                  ? <img src={tablet.image_url} alt={tablet.name} className="object-contain w-full h-full" />
                  : <span className="text-4xl">📟</span>}
              </div>
              <p className="text-xs text-gray-400 mb-0.5">{tablet.brand}</p>
              <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-blue-600 transition line-clamp-2">{tablet.name}</p>
              {tablet.price_inr && (
                <p className="text-xs text-blue-600 font-medium mt-1">₹{tablet.price_inr.toLocaleString('en-IN')}</p>
              )}
              </Link>
              <Link href={`/compare-tablets?a=${tablet.slug}`}
                className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg py-1.5 transition border border-transparent hover:border-blue-200">
                ⚖️ Compare
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl py-20 text-center">
          <p className="text-4xl mb-4">📟</p>
          <p className="text-gray-400 text-sm">No tablets yet. Check back soon!</p>
        </div>
      )}
    </main>
  )
}
