'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const BUDGET_PRESETS = [
  { label: 'Under 15k', min: 0, max: 15000 },
  { label: '15-30k', min: 15000, max: 30000 },
  { label: '30-60k', min: 30000, max: 60000 },
  { label: '60-1L', min: 60000, max: 100000 },
  { label: 'Above 1L', min: 100000, max: 200000 },
]

const RAM_OPTIONS = ['4GB', '6GB', '8GB', '12GB', '16GB', '16GB+']
const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB']
const CHARGING_OPTIONS = ['18W+', '33W+', '45W+', '67W+', '100W+', '120W+']

export default function FinderPage() {
  const [allPhones, setAllPhones] = useState<any[]>([])
  const [allSpecs, setAllSpecs] = useState<any[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [minBudget, setMinBudget] = useState(0)
  const [maxBudget, setMaxBudget] = useState(200000)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [only5G, setOnly5G] = useState(false)
  const [minRAM, setMinRAM] = useState('')
  const [minStorage, setMinStorage] = useState('')
  const [minCharging, setMinCharging] = useState('')
  const [priority, setPriority] = useState('')
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: phones } = await supabase.from('phones').select('*')
      const { data: specs } = await supabase.from('phone_specs').select('*')
      setAllPhones(phones || [])
      setAllSpecs(specs || [])
      const b = [...new Set((phones || []).map((p: any) => p.brand))].sort()
      setBrands(b as string[])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (loading) return

    const specMap: Record<number, any[]> = {}
    for (const s of allSpecs) {
      if (!specMap[s.phone_id]) specMap[s.phone_id] = []
      specMap[s.phone_id].push(s)
    }

    const getSpec = (phoneId: number, label: string) =>
      specMap[phoneId]?.find(s => s.label === label)?.value || ''

    const parseNum = (val: string) => parseFloat(val.replace(/[^0-9.]/g, '')) || 0

    let filtered = allPhones.filter(p => {
      // Budget
      if (p.price_inr && (p.price_inr < minBudget || p.price_inr > maxBudget)) return false

      // Brand
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false

      // 5G
      if (only5G && getSpec(p.id, '5G').toLowerCase() !== 'yes') return false

      // RAM
      if (minRAM) {
        const minRAMNum = parseNum(minRAM)
        const phoneRAM = parseNum(getSpec(p.id, 'RAM'))
        if (phoneRAM < minRAMNum) return false
      }

      // Storage
      if (minStorage) {
        const minStorageNum = parseNum(minStorage)
        const phoneStorage = parseNum(getSpec(p.id, 'Storage'))
        if (phoneStorage < minStorageNum) return false
      }

      // Charging
      if (minCharging) {
        const minChargingNum = parseNum(minCharging)
        const phoneCharging = parseNum(getSpec(p.id, 'Charging speed'))
        if (phoneCharging < minChargingNum) return false
      }

      return true
    })

    // Sort by priority
    if (priority === 'camera') {
      filtered = filtered.sort((a, b) => parseNum(getSpec(b.id, 'Main camera')) - parseNum(getSpec(a.id, 'Main camera')))
    } else if (priority === 'battery') {
      filtered = filtered.sort((a, b) => parseNum(getSpec(b.id, 'Capacity')) - parseNum(getSpec(a.id, 'Capacity')))
    } else if (priority === 'charging') {
      filtered = filtered.sort((a, b) => parseNum(getSpec(b.id, 'Charging speed')) - parseNum(getSpec(a.id, 'Charging speed')))
    } else if (priority === 'display') {
      filtered = filtered.sort((a, b) => parseNum(getSpec(b.id, 'Refresh rate')) - parseNum(getSpec(a.id, 'Refresh rate')))
    } else if (priority === 'ram') {
      filtered = filtered.sort((a, b) => parseNum(getSpec(b.id, 'RAM')) - parseNum(getSpec(a.id, 'RAM')))
    } else {
      filtered = filtered.sort((a, b) => (a.price_inr || 0) - (b.price_inr || 0))
    }

    setResults(filtered)
  }, [allPhones, allSpecs, minBudget, maxBudget, selectedBrands, only5G, minRAM, minStorage, minCharging, priority, loading])

  const toggleBrand = (brand: string) =>
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])

  const reset = () => {
    setMinBudget(0); setMaxBudget(200000); setSelectedBrands([])
    setOnly5G(false); setMinRAM(''); setMinStorage(''); setMinCharging(''); setPriority('')
  }

  const fmt = (n: number) => 'Rs.' + n.toLocaleString('en-IN')

  const activeFilters = [
    selectedBrands.length > 0 && `${selectedBrands.join(', ')}`,
    only5G && '5G',
    minRAM && `${minRAM}+ RAM`,
    minStorage && `${minStorage}+ Storage`,
    minCharging && `${minCharging}+ Charging`,
  ].filter(Boolean)

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Phone Finder</h1>
        <p className="text-sm text-gray-400 mt-1">Filter by budget, specs and what matters most</p>
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
              <input type="range" min={0} max={200000} step={1000}
                value={minBudget}
                onChange={e => setMinBudget(Math.min(+e.target.value, maxBudget - 1000))}
                className="w-full accent-blue-600" />
              <input type="range" min={0} max={200000} step={1000}
                value={maxBudget}
                onChange={e => setMaxBudget(Math.max(+e.target.value, minBudget + 1000))}
                className="w-full accent-blue-600" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BUDGET_PRESETS.map(p => (
                <button key={p.label}
                  onClick={() => { setMinBudget(p.min); setMaxBudget(p.max) }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition ${minBudget === p.min && maxBudget === p.max ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-400'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">🎯 Sort by</h2>
            <div className="space-y-1.5">
              {[
                { key: 'price', label: '💰 Price: Low to High' },
                { key: 'camera', label: '📷 Best Camera' },
                { key: 'battery', label: '🔋 Best Battery' },
                { key: 'charging', label: '⚡ Fastest Charging' },
                { key: 'display', label: '🖥️ Best Display' },
                { key: 'ram', label: '🚀 Most RAM' },
              ].map(p => (
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
            <button
              onClick={() => setOnly5G(!only5G)}
              className={`w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition border mb-3 ${only5G ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              📡 5G only
            </button>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Min RAM</label>
              <div className="flex flex-wrap gap-1.5">
                {RAM_OPTIONS.map(r => (
                  <button key={r}
                    onClick={() => setMinRAM(minRAM === r ? '' : r)}
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
                  <button key={s}
                    onClick={() => setMinStorage(minStorage === s ? '' : s)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${minStorage === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Min Charging</label>
              <div className="flex flex-wrap gap-1.5">
                {CHARGING_OPTIONS.map(c => (
                  <button key={c}
                    onClick={() => setMinCharging(minCharging === c ? '' : c)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${minCharging === c ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-400'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
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

          <button onClick={reset}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition">
            Reset all filters
          </button>
        </aside>

        <div className="flex-1 min-w-0">
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map((f, i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full">{f}</span>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-60 text-gray-400 text-sm">Loading phones...</div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-gray-400">
              <span className="text-3xl mb-2">😕</span>
              <p className="text-sm">No phones match your filters.</p>
              <button onClick={reset} className="mt-3 text-blue-600 text-sm hover:underline">Reset filters</button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-4">{results.length} phone{results.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {results.map(phone => (
                  <Link key={phone.slug} href={`/phones/${phone.slug}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-sm transition group card-hover">
                    <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                      {phone.image_url
                        ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full" />
                        : <span className="text-4xl">📱</span>}
                    </div>
                    <p className="text-xs text-gray-400 mb-0.5">{phone.brand}</p>
                    <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-blue-600 transition line-clamp-2">{phone.name}</p>
                    {phone.price_inr && (
                      <p className="text-xs text-blue-600 font-medium mt-1">{fmt(phone.price_inr)}</p>
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
