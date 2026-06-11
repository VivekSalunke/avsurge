'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const BUDGETS = [
  { label: 'Under ₹10,000', min: 0, max: 10000 },
  { label: '₹10,000 – ₹20,000', min: 10000, max: 20000 },
  { label: '₹20,000 – ₹40,000', min: 20000, max: 40000 },
  { label: '₹40,000 – ₹80,000', min: 40000, max: 80000 },
  { label: 'Above ₹80,000', min: 80000, max: 999999 },
]

const PRIORITIES = [
  { label: '📷 Camera', value: 'Camera' },
  { label: '🔋 Battery', value: 'Battery' },
  { label: '⚡ Performance', value: 'Performance' },
  { label: '🖥️ Display', value: 'Display' },
  { label: '💾 Storage', value: 'Storage' },
]

export default function FinderPage() {
  const [allPhones, setAllPhones] = useState<any[]>([])
  const [allSpecs, setAllSpecs] = useState<any[]>([])
  const [brands, setBrands] = useState<string[]>([])

  const [budget, setBudget] = useState<typeof BUDGETS[0] | null>(null)
  const [priority, setPriority] = useState<string | null>(null)
  const [brand, setBrand] = useState<string | null>(null)
  const [results, setResults] = useState<any[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('phones').select('*').then(({ data }) => {
      setAllPhones(data || [])
      const b = [...new Set((data || []).map((p: any) => p.brand))].sort()
      setBrands(b as string[])
    })
    supabase.from('phone_specs').select('*').then(({ data }) => setAllSpecs(data || []))
  }, [])

  const findPhones = () => {
    setLoading(true)
    setSearched(true)

    let filtered = [...allPhones]

    // Budget filter
    if (budget) {
      filtered = filtered.filter(p =>
        p.price_inr && p.price_inr >= budget.min && p.price_inr <= budget.max
      )
    }

    // Brand filter
    if (brand) {
      filtered = filtered.filter(p => p.brand === brand)
    }

    // Priority filter — sort by phones that have the priority spec
    if (priority) {
      filtered = filtered.sort((a, b) => {
        const aHas = allSpecs.some(s => s.phone_id === a.id && s.category === priority)
        const bHas = allSpecs.some(s => s.phone_id === b.id && s.category === priority)
        return (bHas ? 1 : 0) - (aHas ? 1 : 0)
      })
    }

    setResults(filtered)
    setLoading(false)
  }

  const reset = () => {
    setBudget(null)
    setPriority(null)
    setBrand(null)
    setResults([])
    setSearched(false)
  }

  const getTopSpec = (phoneId: number, category: string) => {
    const spec = allSpecs.find(s => s.phone_id === phoneId && s.category === category)
    return spec?.value || null
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Phone finder</h1>
        <p className="text-sm text-gray-400">Answer a few questions and we'll find the right phone for you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Filters panel */}
        <div className="lg:col-span-1 flex flex-col gap-5">

          {/* Budget */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              💰 Your budget
            </h2>
            <div className="flex flex-col gap-2">
              {BUDGETS.map(b => (
                <button key={b.label} onClick={() => setBudget(budget?.label === b.label ? null : b)}
                  className={`text-left px-3 py-2.5 rounded-xl text-sm border transition ${budget?.label === b.label ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">What matters most?</h2>
            <div className="flex flex-col gap-2">
              {PRIORITIES.map(p => (
                <button key={p.value} onClick={() => setPriority(priority === p.value ? null : p.value)}
                  className={`text-left px-3 py-2.5 rounded-xl text-sm border transition ${priority === p.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">🏷️ Preferred brand</h2>
            <div className="flex flex-wrap gap-2">
              {brands.map(b => (
                <button key={b} onClick={() => setBrand(brand === b ? null : b)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition ${brand === b ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <button onClick={findPhones}
            className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition">
            Find phones →
          </button>
          {searched && (
            <button onClick={reset}
              className="w-full bg-white border border-gray-200 text-gray-500 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">
              Reset filters
            </button>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {!searched && (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-24 text-center h-full flex flex-col items-center justify-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-400 text-sm">Set your filters and tap Find phones</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-20 text-gray-400 text-sm">Finding phones…</div>
          )}

          {searched && !loading && results.length === 0 && (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center">
              <p className="text-3xl mb-3">😕</p>
              <p className="text-gray-500 text-sm font-medium mb-1">No phones match your filters</p>
              <p className="text-gray-400 text-xs">Try relaxing your budget or brand preference</p>
            </div>
          )}

          {searched && !loading && results.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{results.length} phone{results.length !== 1 ? 's' : ''} found</p>
                {budget && <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">{budget.label}</span>}
              </div>

              {results.map((phone, i) => (
                <Link key={phone.id} href={`/phones/${phone.slug}`}
                  className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-4 hover:border-blue-300 hover:shadow-sm transition group">

                  {/* Rank */}
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0 mt-1">
                    {i + 1}
                  </div>

                  {/* Image */}
                  <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                    {phone.image_url
                      ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full" />
                      : '📱'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">{phone.brand}</p>
                    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition text-sm mb-2">{phone.name}</p>

                    {/* Key specs */}
                    <div className="flex flex-wrap gap-2">
                      {priority && getTopSpec(phone.id, priority) && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg font-medium">
                          {PRIORITIES.find(p => p.value === priority)?.label.split(' ')[0]} {getTopSpec(phone.id, priority)}
                        </span>
                      )}
                      {getTopSpec(phone.id, 'Performance') && (
                        <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-lg">
                          ⚡ {getTopSpec(phone.id, 'Performance')}
                        </span>
                      )}
                      {getTopSpec(phone.id, 'Battery') && (
                        <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-lg">
                          🔋 {getTopSpec(phone.id, 'Battery')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    {phone.price_inr ? (
                      <p className="text-blue-600 font-semibold text-sm">₹{phone.price_inr.toLocaleString('en-IN')}</p>
                    ) : (
                      <p className="text-gray-400 text-xs">Price N/A</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">View specs →</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
