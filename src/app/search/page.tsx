'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

const BUDGET_PRESETS = {
  phones: [
    { label: 'Under ₹15K', min: 0, max: 15000 },
    { label: '₹15-30K', min: 15000, max: 30000 },
    { label: '₹30-60K', min: 30000, max: 60000 },
    { label: '₹60K-1L', min: 60000, max: 100000 },
    { label: 'Above ₹1L', min: 100000, max: 200000 },
  ],
  tablets: [
    { label: 'Under ₹15K', min: 0, max: 15000 },
    { label: '₹15-30K', min: 15000, max: 30000 },
    { label: '₹30-60K', min: 30000, max: 60000 },
    { label: 'Above ₹60K', min: 60000, max: 200000 },
  ],
  laptops: [
    { label: 'Under ₹30K', min: 0, max: 30000 },
    { label: '₹30-50K', min: 30000, max: 50000 },
    { label: '₹50-80K', min: 50000, max: 80000 },
    { label: '₹80K-1.5L', min: 80000, max: 150000 },
    { label: 'Above ₹1.5L', min: 150000, max: 300000 },
  ],
}

const RAM_OPTIONS = ['4GB', '6GB', '8GB', '12GB', '16GB', '32GB']
const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB']
const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest first', value: 'newest' },
]

type Mode = 'phones' | 'tablets' | 'laptops'

const AI_EXAMPLES: Record<Mode, string[]> = {
  phones: ['Best camera phone under ₹30,000', 'Gaming phone with 5G under ₹50,000', 'Long battery phone under ₹20,000'],
  tablets: ['Best tablet for students under ₹30,000', 'Tablet for drawing under ₹50,000', 'Lightweight tablet for reading'],
  laptops: ['Best laptop for college under ₹50,000', 'Gaming laptop under ₹1,00,000', 'Lightweight laptop for travel'],
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get('q') || ''

  const [mode, setMode] = useState<Mode>('phones')
  const [query, setQuery] = useState(initialQ)
  const [results, setResults] = useState<any[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Filters
  const [selectedBrand, setSelectedBrand] = useState('')
  const [minBudget, setMinBudget] = useState(0)
  const [maxBudget, setMaxBudget] = useState(300000)
  const [only5G, setOnly5G] = useState(false)
  const [minRAM, setMinRAM] = useState('')
  const [minStorage, setMinStorage] = useState('')
  const [sort, setSort] = useState('relevance')
  const [showFilters, setShowFilters] = useState(false)

  // AI
  const [aiMode, setAiMode] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResults, setAiResults] = useState<any[]>([])
  const [aiExplanation, setAiExplanation] = useState('')
  const [aiError, setAiError] = useState('')

  useEffect(() => {
    loadBrands()
    if (initialQ) doSearch(initialQ)
  }, [mode])

  const loadBrands = async () => {
    const { data } = await supabase.from(mode).select('brand')
    const b = [...new Set((data || []).map((p: any) => p.brand))].sort()
    setBrands(b as string[])
    setSelectedBrand('')
    setMinBudget(0)
    setMaxBudget(300000)
    setOnly5G(false)
    setMinRAM('')
    setMinStorage('')
    setSort('relevance')
    setResults([])
    setSearched(false)
    setAiResults([])
    setAiExplanation('')
  }

  const doSearch = useCallback(async (q: string) => {
    setLoading(true)
    setSearched(true)
    setAiResults([])

    let queryBuilder = supabase.from(mode).select('*')
    if (q.length >= 2) queryBuilder = queryBuilder.or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
    if (selectedBrand) queryBuilder = queryBuilder.eq('brand', selectedBrand)
    if (minBudget > 0) queryBuilder = queryBuilder.gte('price_inr', minBudget)
    if (maxBudget < 300000) queryBuilder = queryBuilder.lte('price_inr', maxBudget)
    if (sort === 'price_asc') queryBuilder = queryBuilder.order('price_inr', { ascending: true })
    else if (sort === 'price_desc') queryBuilder = queryBuilder.order('price_inr', { ascending: false })
    else if (sort === 'newest') queryBuilder = queryBuilder.order('created_at', { ascending: false })
    else queryBuilder = queryBuilder.order('name', { ascending: true })

    const { data } = await queryBuilder.limit(50)
    let items = data || []

    if (only5G && mode !== 'laptops') {
      const specsTable = mode === 'phones' ? 'phone_specs' : 'tablet_specs'
      const idKey = mode === 'phones' ? 'phone_id' : 'tablet_id'
      const ids = items.map(p => p.id)
      const { data: specs } = await supabase.from(specsTable).select(idKey).in(idKey, ids).eq('label', '5G').eq('value', 'Yes')
      const fiveGIds = new Set((specs || []).map((s: any) => s[idKey]))
      items = items.filter(p => fiveGIds.has(p.id))
    }

    if (minRAM) {
      const specsTable = mode === 'phones' ? 'phone_specs' : mode === 'tablets' ? 'tablet_specs' : 'laptop_specs'
      const idKey = mode === 'phones' ? 'phone_id' : mode === 'tablets' ? 'tablet_id' : 'laptop_id'
      const ids = items.map(p => p.id)
      const { data: specs } = await supabase.from(specsTable).select(`${idKey}, value`).in(idKey, ids).eq('label', 'RAM')
      const ramMap: Record<number, number> = {}
      for (const s of specs || []) ramMap[s[idKey]] = parseFloat(s.value) || 0
      const minVal = parseFloat(minRAM) || 0
      items = items.filter(p => (ramMap[p.id] || 0) >= minVal)
    }

    setResults(items)
    setLoading(false)
  }, [mode, selectedBrand, minBudget, maxBudget, only5G, minRAM, minStorage, sort])

  const handleSearch = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
    doSearch(query)
  }

  const handleAISearch = async () => {
    if (!aiQuery.trim()) return
    setAiLoading(true)
    setAiResults([])
    setAiExplanation('')
    setAiError('')
    setResults([])
    setSearched(false)

    try {
      const specsTable = mode === 'phones' ? 'phone_specs' : mode === 'tablets' ? 'tablet_specs' : 'laptop_specs'
      const idKey = mode === 'phones' ? 'phone_id' : mode === 'tablets' ? 'tablet_id' : 'laptop_id'
      const specLabels = mode === 'laptops'
        ? ['Processor', 'RAM', 'Storage', 'Display', 'Battery Life', 'GPU', 'Screen Size', 'Weight']
        : ['Chipset', 'RAM', 'Main camera', 'Capacity', 'Charging speed', 'Screen size', '5G', 'Storage']

      const { data: items } = await supabase.from(mode).select('id, name, brand, slug, price_inr, image_url').not('price_inr', 'is', null).order('price_inr', { ascending: true })
      const { data: specsRaw } = await supabase.from(specsTable).select('*').in('label', specLabels)
      const specs = specsRaw as any[]

      const specMap: Record<number, Record<string, string>> = {}
      for (const s of specs || []) {
        const id = s[idKey] as number
        if (!specMap[id]) specMap[id] = {}
        specMap[id][s.label] = s.value
      }

      const itemList = (items || []).map(p => ({ ...p, specs: specMap[p.id] || {} }))

      const res = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery, phones: itemList, deviceType: mode.slice(0, -1) }),
      })

      const parsed = await res.json()
      if (!res.ok) throw new Error(parsed.error)

      setAiExplanation(parsed.explanation)
      const matched = parsed.recommendations.map((rec: any) => {
        const item = itemList.find(p => p.name.toLowerCase() === rec.name.toLowerCase() || p.name.toLowerCase().includes(rec.name.toLowerCase()))
        return { ...rec, item }
      }).filter((r: any) => r.item)
      setAiResults(matched)
    } catch {
      setAiError('AI search failed. Try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const itemBase = mode === 'phones' ? '/phones' : mode === 'tablets' ? '/tablets' : '/laptops'
  const itemEmoji = mode === 'phones' ? '📱' : mode === 'tablets' ? '📟' : '💻'
  const itemLabel = mode === 'phones' ? 'phone' : mode === 'tablets' ? 'tablet' : 'laptop'
  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search & Discover</h1>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-5 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {(['phones', 'tablets', 'laptops'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${mode === m ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            {m === 'phones' ? '📱 Phones' : m === 'tablets' ? '📟 Tablets' : '💻 Laptops'}
          </button>
        ))}
      </div>

      {/* Search mode toggle */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setAiMode(false)}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${!aiMode ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400'}`}>
          🔍 Search & Filter
        </button>
        <button onClick={() => setAiMode(true)}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${aiMode ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-500 border-gray-200 hover:border-purple-400'}`}>
          🤖 AI Search
        </button>
      </div>

      {aiMode ? (
        /* AI Search */
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-3">Describe what you're looking for in plain English</p>
            <div className="flex gap-3 mb-4">
              <textarea value={aiQuery} onChange={e => setAiQuery(e.target.value)} rows={2}
                placeholder={`e.g. ${AI_EXAMPLES[mode][0]}`}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 resize-none"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAISearch())} />
              <button onClick={handleAISearch} disabled={aiLoading || !aiQuery.trim()}
                className="bg-purple-600 text-white px-5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2">
                {aiLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '🤖'}
                {aiLoading ? '' : 'Ask AI'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {AI_EXAMPLES[mode].map(ex => (
                <button key={ex} onClick={() => setAiQuery(ex)}
                  className="text-xs px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-full hover:bg-purple-100 transition">
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {aiError && <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-600 text-sm">{aiError}</div>}

          {aiExplanation && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-purple-700"><span className="font-semibold">🤖 AI:</span> {aiExplanation}</p>
            </div>
          )}

          {aiResults.length > 0 && (
            <div className="flex flex-col gap-4">
              {aiResults.map((rec: any, i: number) => (
                <Link key={i} href={`${itemBase}/${rec.item.slug}`}
                  className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-sm transition group flex gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {rec.item.image_url
                      ? <img src={rec.item.image_url} alt={rec.item.name} className="object-contain w-full h-full p-1" />
                      : <span className="text-3xl">{itemEmoji}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium mr-2">#{i + 1}</span>
                        <span className="text-xs text-gray-400">{rec.item.brand}</span>
                      </div>
                      {rec.item.price_inr && <span className="text-sm font-bold text-blue-600">₹{rec.item.price_inr.toLocaleString('en-IN')}</span>}
                    </div>
                    <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition mb-1">{rec.item.name}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{rec.reason}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Search & Filter */
        <div>
          <div className="flex gap-3 mb-4">
            <input type="text"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              placeholder={`Search ${itemLabel} by name or brand...`}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              Search
            </button>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl text-sm font-medium border transition ${showFilters ? 'bg-blue-50 border-blue-400 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-400'}`}>
              ⚙️ Filters
            </button>
          </div>

          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Budget presets */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Budget</p>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => { setMinBudget(0); setMaxBudget(300000) }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${minBudget === 0 && maxBudget === 300000 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-400'}`}>
                    All
                  </button>
                  {BUDGET_PRESETS[mode].map(p => (
                    <button key={p.label} onClick={() => { setMinBudget(p.min); setMaxBudget(p.max) }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition ${minBudget === p.min && maxBudget === p.max ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-400'}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Brand</p>
                <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}>
                  <option value="">All brands</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* RAM */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Min RAM</p>
                <div className="flex flex-wrap gap-1.5">
                  {RAM_OPTIONS.map(r => (
                    <button key={r} onClick={() => setMinRAM(minRAM === r ? '' : r)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition ${minRAM === r ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-400'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort + 5G */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sort by</p>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 mb-2"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {mode !== 'laptops' && (
                  <button onClick={() => setOnly5G(!only5G)}
                    className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition border ${only5G ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                    📡 5G only
                  </button>
                )}
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-between items-center pt-2 border-t border-gray-100">
                <button onClick={() => doSearch(query)}
                  className="bg-blue-600 text-white rounded-xl px-5 py-2 text-sm font-semibold hover:bg-blue-700 transition">
                  Apply filters
                </button>
                <button onClick={() => { setSelectedBrand(''); setMinBudget(0); setMaxBudget(300000); setOnly5G(false); setMinRAM(''); setSort('relevance') }}
                  className="text-sm text-gray-400 hover:text-gray-600 transition">
                  Reset all
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {!searched && !loading && (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-24 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-400 text-sm mb-2">Search for a {itemLabel} or apply filters</p>
              <p className="text-xs text-gray-300">Or try <button onClick={() => setAiMode(true)} className="text-purple-500 hover:underline">AI Search 🤖</button> for natural language queries</p>
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
              <p className="text-gray-500 text-sm font-medium mb-1">No {itemLabel}s found</p>
              <p className="text-gray-400 text-xs mb-3">Try different filters or search terms</p>
              <button onClick={() => setAiMode(true)} className="text-sm text-purple-600 border border-purple-200 px-4 py-2 rounded-xl hover:bg-purple-50 transition">
                Try AI Search instead 🤖
              </button>
            </div>
          )}

          {searched && !loading && results.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-4">{results.length} {itemLabel}{results.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.map(item => (
                  <Link key={item.id} href={`${itemBase}/${item.slug}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-sm transition group">
                    <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                      {item.image_url
                        ? <img src={item.image_url} alt={item.name} className="object-contain w-full h-full" />
                        : <span className="text-4xl">{itemEmoji}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mb-0.5">{item.brand}</p>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2">{item.name}</p>
                    {item.price_inr && <p className="text-xs text-blue-600 font-medium mt-1">{fmt(item.price_inr)}</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>
}
