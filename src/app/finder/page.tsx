"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const BRANDS = [
  'Samsung','Apple','OnePlus','Google','Xiaomi',
  'Realme','OPPO','Vivo','Nothing','iQOO','Motorola',
]

const PRIORITIES = [
  { key: 'camera',      label: '📷 Camera',      specKey: 'Rear Camera' },
  { key: 'battery',     label: '🔋 Battery',      specKey: 'Battery Capacity' },
  { key: 'performance', label: '⚡ Performance',  specKey: 'RAM' },
  { key: 'display',     label: '🖥️ Display',      specKey: 'Refresh Rate' },
]

type Phone = {
  id: string
  slug: string
  name: string
  brand: string
  price_inr: number
  image_url: string
  specs: Record<string, string>
}

export default function FinderPage() {
  const [allPhones, setAllPhones]           = useState<Phone[]>([])
  const [loading, setLoading]               = useState(true)
  const [minBudget, setMinBudget]           = useState(5000)
  const [maxBudget, setMaxBudget]           = useState(150000)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priority, setPriority]             = useState('')
  const [results, setResults]               = useState<Phone[]>([])

  useEffect(() => {
    async function load() {
      const { data: phones } = await supabase
        .from('phones')
        .select('id, slug, name, brand, price_inr, image_url')

      const { data: specs } = await supabase
        .from('phone_specs')
        .select('phone_id, spec_key, spec_value')

      const specMap: Record<string, Record<string, string>> = {}
      for (const s of specs || []) {
        if (!specMap[s.phone_id]) specMap[s.phone_id] = {}
        specMap[s.phone_id][s.spec_key] = s.spec_value
      }

      setAllPhones(
        (phones || []).map(p => ({ ...p, specs: specMap[p.id] || {} }))
      )
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let filtered = allPhones.filter(p => {
      const inBudget =
        (!p.price_inr || (p.price_inr >= minBudget && p.price_inr <= maxBudget))
      const inBrand =
        selectedBrands.length === 0 || selectedBrands.includes(p.brand)
      return inBudget && inBrand
    })

    if (priority) {
      const specKey = PRIORITIES.find(p => p.key === priority)?.specKey || ''
      filtered = [...filtered].sort((a, b) => {
        const aVal = parseFloat((a.specs[specKey] || '0').replace(/[^\d.]/g, ''))
        const bVal = parseFloat((b.specs[specKey] || '0').replace(/[^\d.]/g, ''))
        return bVal - aVal
      })
    }

    setResults(filtered)
  }, [allPhones, minBudget, maxBudget, selectedBrands, priority])

  function toggleBrand(brand: string) {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
  }

  function fmt(n: number) {
    return '₹' + n.toLocaleString('en-IN')
  }

  const activePriority = PRIORITIES.find(p => p.key === priority)

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Phone Finder</h1>
        <p className="text-sm text-gray-400 mt-1">Filter by budget, brand, and what matters most to you</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        <aside className="w-full lg:w-64 shrink-0 space-y-4">

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">💰 Budget</h2>
            <div className="flex justify-between text-xs text-blue-600 font-medium mb-2">
              <span>{fmt(minBudget)}</span>
              <span>{fmt(maxBudget)}</span>
            </div>
            <div className="space-y-2">
              <input type="range" min={5000} max={150000} step={1000}
                value={minBudget}
                onChange={e => setMinBudget(Math.min(+e.target.value, maxBudget - 1000))}
                className="w-full accent-blue-600" />
              <input type="range" min={5000} max={150000} step={1000}
                value={maxBudget}
                onChange={e => setMaxBudget(Math.max(+e.target.value, minBudget + 1000))}
                className="w-full accent-blue-600" />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {([[5000,15000,'Under 15k'],[15000,30000,'15-30k'],[30000,60000,'30-60k'],[60000,150000,'60k+']] as [number,number,string][]).map(([mn,mx,label]) => (
                <button key={label}
                  onClick={() => { setMinBudget(mn); setMaxBudget(mx) }}
                  className={`text-xs px-2 py-1 rounded-full border transition ${minBudget===mn && maxBudget===mx ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-400'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">🎯 Priority</h2>
            <div className="space-y-1.5">
              {PRIORITIES.map(p => (
                <button key={p.key}
                  onClick={() => setPriority(priority === p.key ? '' : p.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${priority === p.key ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">🏷️ Brand</h2>
            <div className="space-y-2">
              {BRANDS.map(brand => (
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

          <button
            onClick={() => { setMinBudget(5000); setMaxBudget(150000); setSelectedBrands([]); setPriority('') }}
            className="w-full py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition">
            Reset filters
          </button>
        </aside>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center h-60 text-gray-400 text-sm">Loading phones...</div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-gray-400">
              <span className="text-3xl mb-2">😕</span>
              <p className="text-sm">No phones match your filters.</p>
              <button onClick={() => { setMinBudget(5000); setMaxBudget(150000); setSelectedBrands([]); setPriority('') }}
                className="mt-3 text-blue-600 text-sm hover:underline">Reset filters</button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-4">
                {results.length} phone{results.length !== 1 ? 's' : ''} found
                {activePriority && (
                  <span className="ml-1 text-blue-600 font-medium">· sorted by {activePriority.label}</span>
                )}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {results.map(phone => (
                  <Link key={phone.slug} href={`/phones/${phone.slug}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-sm transition group">
                    <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 text-4xl">
                      {phone.image_url
                        ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full" />
                        : '📱'}
                    </div>
                    <p className="text-xs text-gray-400 mb-0.5">{phone.brand}</p>
                    <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-blue-600 transition line-clamp-2">{phone.name}</p>
                    {phone.price_inr && (
                      <p className="text-xs text-blue-600 font-medium mt-1">{fmt(phone.price_inr)}</p>
                    )}
                    {activePriority && phone.specs[activePriority.specKey] && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {activePriority.specKey}: {phone.specs[activePriority.specKey]}
                      </p>
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
