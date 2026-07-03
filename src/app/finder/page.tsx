'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const BUDGET_PRESETS_MOBILE = [
  { label: 'Under 15k', min: 0, max: 15000 },
  { label: '15-30k', min: 15000, max: 30000 },
  { label: '30-60k', min: 30000, max: 60000 },
  { label: '60-1L', min: 60000, max: 100000 },
  { label: 'Above 1L', min: 100000, max: 200000 },
]

const BUDGET_PRESETS_LAPTOP = [
  { label: 'Under 30k', min: 0, max: 30000 },
  { label: '30-50k', min: 30000, max: 50000 },
  { label: '50-80k', min: 50000, max: 80000 },
  { label: '80-1.5L', min: 80000, max: 150000 },
  { label: 'Above 1.5L', min: 150000, max: 300000 },
]

const RAM_OPTIONS = ['4GB', '6GB', '8GB', '12GB', '16GB', '32GB']
const STORAGE_OPTIONS = ['128GB', '256GB', '512GB', '1TB', '2TB']
const CHARGING_OPTIONS = ['18W+', '33W+', '45W+', '67W+', '100W+']

type Mode = 'phones' | 'tablets' | 'laptops'

export default function FinderPage() {
  const [mode, setMode] = useState<Mode>('phones')
  const [allItems, setAllItems] = useState<any[]>([])
  const [allSpecs, setAllSpecs] = useState<any[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [minBudget, setMinBudget] = useState(0)
  const [maxBudget, setMaxBudget] = useState(200000)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [only5G, setOnly5G] = useState(false)
  const [minRAM, setMinRAM] = useState('')
  const [minStorage, setMinStorage] = useState('')
  const [minCharging, setMinCharging] = useState('')
  const [priority, setPriority] = useState('')
  const [results, setResults] = useState<any[]>([])

  useEffect(() => { loadData() }, [mode])

  const loadData = async () => {
    setLoading(true)
    reset(false)
    const table = mode === 'phones' ? 'phones' : mode === 'tablets' ? 'tablets' : 'laptops'
    const specsTable = mode === 'phones' ? 'phone_specs' : mode === 'tablets' ? 'tablet_specs' : 'laptop_specs'
    const [{ data: items }, { data: specs }] = await Promise.all([
      supabase.from(table).select('*'),
      supabase.from(specsTable).select('*'),
    ])
    setAllItems(items || [])
    setAllSpecs(specs || [])
    setBrands([...new Set((items || []).map((p: any) => p.brand))].sort() as string[])
    setLoading(false)
  }

  useEffect(() => {
    if (loading) return
    const idKey = mode === 'phones' ? 'phone_id' : mode === 'tablets' ? 'tablet_id' : 'laptop_id'
    const specMap: Record<number, any[]> = {}
    for (const s of allSpecs) {
      if (!specMap[s[idKey]]) specMap[s[idKey]] = []
      specMap[s[idKey]].push(s)
    }
    const getSpec = (id: number, label: string) => specMap[id]?.find(s => s.label === label)?.value || ''
    const parseNum = (val: string) => parseFloat(val.replace(/[^0-9.]/g, '')) || 0

    let filtered = allItems.filter(p => {
      if (p.price_inr && (p.price_inr < minBudget || p.price_inr > maxBudget)) return false
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false
      if (only5G && mode !== 'laptops' && getSpec(p.id, '5G').toLowerCase() !== 'yes') return false
      if (minRAM && parseNum(getSpec(p.id, 'RAM')) < parseNum(minRAM)) return false
      if (minStorage && parseNum(getSpec(p.id, mode === 'laptops' ? 'Storage' : 'Storage')) < parseNum(minStorage)) return false
      if (minCharging && mode !== 'laptops' && parseNum(getSpec(p.id, 'Charging speed')) < parseNum(minCharging)) return false
      return true
    })

    if (priority === 'camera') filtered.sort((a, b) => parseNum(getSpec(b.id, 'Main camera')) - parseNum(getSpec(a.id, 'Main camera')))
    else if (priority === 'battery') filtered.sort((a, b) => parseNum(getSpec(b.id, mode === 'laptops' ? 'Battery Life' : 'Capacity')) - parseNum(getSpec(a.id, mode === 'laptops' ? 'Battery Life' : 'Capacity')))
    else if (priority === 'charging') filtered.sort((a, b) => parseNum(getSpec(b.id, 'Charging speed')) - parseNum(getSpec(a.id, 'Charging speed')))
    else if (priority === 'display') filtered.sort((a, b) => parseNum(getSpec(b.id, 'Screen Size')) - parseNum(getSpec(a.id, 'Screen Size')))
    else if (priority === 'ram') filtered.sort((a, b) => parseNum(getSpec(b.id, 'RAM')) - parseNum(getSpec(a.id, 'RAM')))
    else if (priority === 'performance') filtered.sort((a, b) => parseNum(getSpec(b.id, 'Processor')) - parseNum(getSpec(a.id, 'Processor')))
    else filtered.sort((a, b) => (a.price_inr || 0) - (b.price_inr || 0))

    setResults(filtered)
  }, [allItems, allSpecs, minBudget, maxBudget, selectedBrands, only5G, minRAM, minStorage, minCharging, priority, loading])

  const toggleBrand = (brand: string) =>
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])

  const reset = (reload = true) => {
    setMinBudget(0)
    setMaxBudget(mode === 'laptops' ? 300000 : 200000)
    setSelectedBrands([])
    setOnly5G(false); setMinRAM(''); setMinStorage(''); setMinCharging(''); setPriority('')
  }

  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')
  const budgetPresets = mode === 'laptops' ? BUDGET_PRESETS_LAPTOP : BUDGET_PRESETS_MOBILE
  const maxSlider = mode === 'laptops' ? 300000 : 200000

  const activeFilters = [
    selectedBrands.length > 0 && selectedBrands.join(', '),
    only5G && '5G',
    minRAM && `${minRAM}+ RAM`,
    minStorage && `${minStorage}+ Storage`,
    minCharging && `${minCharging}+ Charging`,
  ].filter(Boolean)

  const itemSlugBase = mode === 'phones' ? '/phones' : mode === 'tablets' ? '/tablets' : '/laptops'
  const itemEmoji = mode === 'phones' ? '📱' : mode === 'tablets' ? '📟' : '💻'
  const itemLabel = mode === 'phones' ? 'phone' : mode === 'tablets' ? 'tablet' : 'laptop'

  const sortOptions = mode === 'laptops' ? [
    { key: 'price', label: '💰 Price: Low to High' },
    { key: 'ram', label: '🚀 Most RAM' },
    { key: 'display', label: '🖥️ Largest Display' },
    { key: 'battery', label: '🔋 Best Battery Life' },
    { key: 'storage', label: '💾 Most Storage' },
  ] : [
    { key: 'price', label: '💰 Price: Low to High' },
    { key: 'camera', label: '📷 Best Camera' },
    { key: 'battery', label: '🔋 Best Battery' },
    { key: 'charging', label: '⚡ Fastest Charging' },
    { key: 'display', label: '🖥️ Largest Display' },
    { key: 'ram', label: '🚀 Most RAM' },
  ]

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Finder</h1>
        <p className="text-sm text-gray-400 mt-1">Filter by budget, specs and what matters most</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {(['phones', 'tablets', 'laptops'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${mode === m ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            {m === 'phones' ? '📱 Phones' : m === 'tablets' ? '📟 Tablets' : '💻 Laptops'}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-72 shrink-0 space-y-4">

          {/* Budget */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">💰 Budget</h2>
            <div className="flex justify-between text-xs text-blue-600 font-medium mb-2">
              <span>{fmt(minBudget)}</span>
              <span>{fmt(maxBudget)}</span>
            </div>
            <div className="space-y-2 mb-3">
              <input type="range" min={0} max={maxSlider} step={1000}
                value={minBudget}
                onChange={e => setMinBudget(Math.min(+e.target.value, maxBudget - 1000))}
                className="w-full accent-blue-600" />
              <input type="range" min={0} max={maxSlider} step={1000}
                value={maxBudget}
                onChange={e => setMaxBudget(Math.max(+e.target.value, minBudget + 1000))}
                className="w-full accent-blue-600" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {budgetPresets.map(p => (
                <button key={p.label}
                  onClick={() => { setMinBudget(p.min); setMaxBudget(p.max) }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition ${minBudget === p.min && maxBudget === p.max ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-400'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort by */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">🎯 Sort by</h2>
            <div className="space-y-1.5">
              {sortOptions.map(p => (
                <button key={p.key}
                  onClick={() => setPriority(priority === p.key ? '' : p.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${priority === p.key ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">✨ Features</h2>

            {mode !== 'laptops' && (
              <button onClick={() => setOnly5G(!only5G)}
                className={`w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition border mb-3 ${only5G ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                📡 5G only
              </button>
            )}

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Min RAM</label>
              <div className="flex flex-wrap gap-1.5">
                {RAM_OPTIONS.map(r => (
                  <button key={r} onClick={() => setMinRAM(minRAM === r ? '' : r)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${minRAM === r ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-400'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Min Storage</label>
              <div className="flex flex-wrap gap-1.5">
                {STORAGE_OPTIONS.map(s => (
                  <button key={s} onClick={() => setMinStorage(minStorage === s ? '' : s)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${minStorage === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {mode !== 'laptops' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Min Charging</label>
                <div className="flex flex-wrap gap-1.5">
                  {CHARGING_OPTIONS.map(c => (
                    <button key={c} onClick={() => setMinCharging(minCharging === c ? '' : c)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition ${minCharging === c ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-400'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Brand */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">🏷️ Brand</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map(brand => (
                <label key={brand} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="accent-blue-600 w-3.5 h-3.5" />
                  <span className="text-sm text-gray-600">{brand}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={() => reset()}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition">
            Reset all filters
          </button>
        </aside>

        <div className="flex-1 min-w-0">
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {(activeFilters as string[]).map((f, i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full">{f}</span>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-60 text-gray-400 text-sm">
              Loading {mode}...
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-gray-400">
              <span className="text-3xl mb-2">😕</span>
              <p className="text-sm">No {mode} match your filters.</p>
              <button onClick={() => reset()} className="mt-3 text-blue-600 text-sm hover:underline">Reset filters</button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-4">{results.length} {itemLabel}{results.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {results.map(item => (
                  <Link key={item.slug} href={`${itemSlugBase}/${item.slug}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-sm transition group">
                    <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                      {item.image_url
                        ? <img src={item.image_url} alt={item.name} className="object-contain w-full h-full" />
                        : <span className="text-4xl">{itemEmoji}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mb-0.5">{item.brand}</p>
                    <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-blue-600 transition line-clamp-2">{item.name}</p>
                    {item.price_inr && (
                      <p className="text-xs text-blue-600 font-medium mt-1">{fmt(item.price_inr)}</p>
                    )}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
