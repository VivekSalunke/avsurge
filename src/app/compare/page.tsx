'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const ICONS: Record<string, string> = {
  Display: '🖥️', Performance: '⚡', Camera: '📷',
  Battery: '🔋', Connectivity: '📡', Build: '🏗️',
  Storage: '💾', General: '📋',
}

export default function ComparePage() {
  const [phones, setPhones] = useState<any[]>([])
  const [phoneA, setPhoneA] = useState<any>(null)
  const [phoneB, setPhoneB] = useState<any>(null)
  const [specsA, setSpecsA] = useState<any[]>([])
  const [specsB, setSpecsB] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('phones').select('*').order('name').then(({ data }) => setPhones(data || []))
  }, [])

  const loadSpecs = async (phoneId: number, side: 'a' | 'b') => {
    const { data } = await supabase.from('phone_specs').select('*').eq('phone_id', phoneId).order('id')
    if (side === 'a') setSpecsA(data || [])
    else setSpecsB(data || [])
  }

  const selectPhone = async (slug: string, side: 'a' | 'b') => {
    setLoading(true)
    const phone = phones.find(p => p.slug === slug)
    if (!phone) { setLoading(false); return }
    if (side === 'a') setPhoneA(phone)
    else setPhoneB(phone)
    await loadSpecs(phone.id, side)
    setLoading(false)
  }

  // Get all categories from both phones
  const allCategories = [...new Set([...specsA, ...specsB].map(s => s.category))]

  // Get all labels within a category from both phones
  const getLabels = (cat: string) => {
    const labels = new Set([
      ...specsA.filter(s => s.category === cat).map(s => s.label),
      ...specsB.filter(s => s.category === cat).map(s => s.label),
    ])
    return [...labels]
  }

  const getVal = (specs: any[], cat: string, label: string) =>
    specs.find(s => s.category === cat && s.label === label)?.value || '—'

  const isBetter = (valA: string, valB: string) => {
    // Simple numeric comparison — higher = better
    const numA = parseFloat(valA.replace(/[^0-9.]/g, ''))
    const numB = parseFloat(valB.replace(/[^0-9.]/g, ''))
    if (isNaN(numA) || isNaN(numB)) return null
    return numA > numB ? 'a' : numB > numA ? 'b' : null
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Compare phones</h1>
        <p className="text-sm text-gray-400">Select two phones to compare specs side by side</p>
      </div>

      {/* Phone selectors */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Phone A */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Phone 1</p>
          <select
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-400 mb-4"
            onChange={e => selectPhone(e.target.value, 'a')}
            defaultValue=""
          >
            <option value="" disabled>Select a phone…</option>
            {phones.map(p => (
              <option key={p.id} value={p.slug}>{p.name}</option>
            ))}
          </select>
          {phoneA && (
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center text-5xl mx-auto mb-3">
                {phoneA.image_url
                  ? <img src={phoneA.image_url} alt={phoneA.name} className="object-contain w-full h-full" />
                  : '📱'}
              </div>
              <p className="font-semibold text-gray-900 text-sm">{phoneA.name}</p>
              <p className="text-xs text-gray-400">{phoneA.brand}</p>
              {phoneA.price_inr && (
                <p className="text-blue-600 text-sm font-medium mt-1">₹{phoneA.price_inr.toLocaleString('en-IN')}</p>
              )}
            </div>
          )}
        </div>

        {/* Phone B */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Phone 2</p>
          <select
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-400 mb-4"
            onChange={e => selectPhone(e.target.value, 'b')}
            defaultValue=""
          >
            <option value="" disabled>Select a phone…</option>
            {phones.map(p => (
              <option key={p.id} value={p.slug}>{p.name}</option>
            ))}
          </select>
          {phoneB && (
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center text-5xl mx-auto mb-3">
                {phoneB.image_url
                  ? <img src={phoneB.image_url} alt={phoneB.name} className="object-contain w-full h-full" />
                  : '📱'}
              </div>
              <p className="font-semibold text-gray-900 text-sm">{phoneB.name}</p>
              <p className="text-xs text-gray-400">{phoneB.brand}</p>
              {phoneB.price_inr && (
                <p className="text-blue-600 text-sm font-medium mt-1">₹{phoneB.price_inr.toLocaleString('en-IN')}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comparison table */}
      {phoneA && phoneB && !loading && (
        <div className="flex flex-col gap-5">
          {/* Winner banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-400 mb-0.5">Comparing</p>
              <p className="text-sm font-semibold text-blue-800">{phoneA.name} vs {phoneB.name}</p>
            </div>
            <div className="flex gap-3">
              <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(phoneA.name)}`} target="_blank"
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                Buy {phoneA.name.split(' ').slice(-1)} →
              </a>
              <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(phoneB.name)}`} target="_blank"
                className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                Buy {phoneB.name.split(' ').slice(-1)} →
              </a>
            </div>
          </div>

          {allCategories.map(cat => (
            <div key={cat} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Category header */}
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <span>{ICONS[cat] || '📋'}</span>
                <span className="text-sm font-semibold text-gray-700">{cat}</span>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-3 border-b border-gray-100">
                <div className="px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50/50">{phoneA.name}</div>
                <div className="px-4 py-2 text-xs font-medium text-gray-400 text-center">Spec</div>
                <div className="px-4 py-2 text-xs font-medium text-purple-600 bg-purple-50/50 text-right">{phoneB.name}</div>
              </div>

              {/* Spec rows */}
              {getLabels(cat).map((label, i) => {
                const valA = getVal(specsA, cat, label)
                const valB = getVal(specsB, cat, label)
                const winner = isBetter(valA, valB)
                return (
                  <div key={label} className={`grid grid-cols-3 items-center ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                    <div className={`px-4 py-3 text-sm font-medium ${winner === 'a' ? 'text-blue-700 bg-blue-50/60' : 'text-gray-700'}`}>
                      {valA}
                      {winner === 'a' && <span className="ml-1.5 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">✓</span>}
                    </div>
                    <div className="px-4 py-3 text-xs text-gray-400 text-center">{label}</div>
                    <div className={`px-4 py-3 text-sm font-medium text-right ${winner === 'b' ? 'text-purple-700 bg-purple-50/60' : 'text-gray-700'}`}>
                      {winner === 'b' && <span className="mr-1.5 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">✓</span>}
                      {valB}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          {/* View full spec links */}
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/phones/${phoneA.slug}`}
              className="bg-white border border-gray-200 rounded-xl py-3 text-center text-sm text-blue-600 hover:border-blue-300 transition">
              Full specs: {phoneA.name} →
            </Link>
            <Link href={`/phones/${phoneB.slug}`}
              className="bg-white border border-gray-200 rounded-xl py-3 text-center text-sm text-purple-600 hover:border-purple-300 transition">
              Full specs: {phoneB.name} →
            </Link>
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!phoneA || !phoneB) && (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center">
          <p className="text-4xl mb-3">📱 vs 📱</p>
          <p className="text-gray-400 text-sm">Select two phones above to start comparing</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-400 text-sm">Loading specs…</div>
      )}
    </main>
  )
}
