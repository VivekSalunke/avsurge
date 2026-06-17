'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

const PRICE_RANGES = [
  { label: 'All prices', min: 0, max: 9999999 },
  { label: 'Under Rs.15,000', min: 0, max: 15000 },
  { label: 'Rs.15,000 – Rs.30,000', min: 15000, max: 30000 },
  { label: 'Rs.30,000 – Rs.60,000', min: 30000, max: 60000 },
  { label: 'Rs.60,000 – Rs.1,00,000', min: 60000, max: 100000 },
  { label: 'Above Rs.1,00,000', min: 100000, max: 9999999 },
]

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest first', value: 'newest' },
]

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQ)
  const [results, setResults] = useState<any[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Filters
  const [selectedBrand, setSelectedBrand] = useState('')
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0])
  const [only5G, setOnly5G] = useState(false)
  const [sort, setSort] = useState('relevance')

  useEffect(() => {
    supabase.from('phones').select('brand').then(({ data }) => {
      const b = [...new Set((data || []).map((p: any) => p.brand))].sort()
      setBrands(b as string[])
    })
    if (initialQ) doSearch(initialQ)
  }, [])

  const doSearch = useCallback(async (q: string) => {
    setLoading(true)
    setSearched(true)

    let queryBuilder = supabase
      .from('phones')
      .select('*')

    if (q.length >= 2) {
      queryBuilder = queryBuilder.or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
    }

    if (selectedBrand) queryBuilder = queryBuilder.eq('brand', selectedBrand)
    if (priceRange.min > 0) queryBuilder = queryBuilder.gte('price_inr', priceRange.min)
    if (priceRange.max < 9999999) queryBuilder = queryBuilder.lte('price_inr', priceRange.max)

    if (sort === 'price_asc') queryBuilder = queryBuilder.order('price_inr', { ascending: true })
    else if (sort === 'price_desc') queryBuilder = queryBuilder.order('price_inr', { ascending: false })
    else if (sort === 'newest') queryBuilder = queryBuilder.order('released_at', { ascending: false })
    else queryBuilder = queryBuilder.order('name', { ascending: true })

    const { data } = await queryBuilder.limit(50)
    let phones = data || []

    // Filter 5G from specs if needed
    if (only5G) {
      const phoneIds = phones.map(p => p.id)
      const { data: specs } = await supabase
        .from('phone_specs')
        .select('phone_id')
        .in('phone_id', phoneIds)
        .eq('label', '5G')
        .eq('value', 'Yes')
      const fiveGIds = new Set((specs || []).map(s => s.phone_id))
      phones = phones.filter(p => fiveGIds.has(p.id))
    }

    setResults(phones)
    setLoading(false)
  }, [selectedBrand, priceRange, only5G, sort])

  const handleSearch = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
    doSearch(query)
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search phones</h1>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
          placeholder="Search by phone name or brand..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Brand</h2>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setSelectedBrand('')}
                className={`text-left text-sm px-3 py-2 rounded-lg transition ${!selectedBrand ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                All brands
              </button>
              {brands.map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(selectedBrand === b ? '' : b)}
                  className={`text-left text-sm px-3 py-2 rounded-lg transition ${selectedBrand === b ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Price range</h2>
            <div className="flex flex-col gap-1.5">
              {PRICE_RANGES.map(range => (
                <button
                  key={range.label}
                  onClick={() => setPriceRange(range)}
                  className={`text-left text-sm px-3 py-2 rounded-lg transition ${priceRange.label === range.label ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Features</h2>
            <button
              onClick={() => setOnly5G(!only5G)}
              className={`w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition border ${only5G ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              <span>📡</span> 5G only
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sort by</h2>
            <div className="flex flex-col gap-1.5">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`text-left text-sm px-3 py-2 rounded-lg transition ${sort === opt.value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => doSearch(query)}
            className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition">
            Apply filters
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {!searched && (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-24 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-400 text-sm">Search for a phone or apply filters</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {searched && !loading && results.length === 0 && (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center">
              <p className="text-3xl mb-3">😕</p>
              <p className="text-gray-500 text-sm font-medium mb-1">No phones found</p>
              <p className="text-gray-400 text-xs">Try different filters or search terms</p>
            </div>
          )}

          {searched && !loading && results.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-4">{results.length} phone{results.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {results.map(phone => (
                  <Link key={phone.id} href={`/phones/${phone.slug}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-sm transition group">
                    <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                      {phone.image_url
                        ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full" />
                        : <span className="text-4xl">📱</span>}
                    </div>
                    <p className="text-xs text-gray-400 mb-0.5">{phone.brand}</p>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2">{phone.name}</p>
                    {phone.price_inr && (
                      <p className="text-xs text-blue-600 font-medium mt-1">Rs.{phone.price_inr.toLocaleString('en-IN')}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  )
}
