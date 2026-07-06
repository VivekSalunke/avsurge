'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const ICONS: Record<string, string> = {
  Display: '🖥️', Performance: '⚡', Memory: '🧠',
  Battery: '🔋', Connectivity: '📡', Build: '🏗️',
  Storage: '💾', General: '📋', Audio: '🔊', Graphics: '🎮',
}

interface Laptop { id: number; name: string; brand: string; slug: string; price_inr: number | null; image_url: string | null }

function LaptopSelector({ side, laptop, laptops, onSelect, onRemove }: {
  side: 'a' | 'b'; laptop: Laptop | null; laptops: Laptop[]
  onSelect: (l: Laptop, side: 'a' | 'b') => void; onRemove: (side: 'a' | 'b') => void
}) {
  const [search, setSearch] = useState('')
  const filtered = search.length > 0 ? laptops.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.brand.toLowerCase().includes(search.toLowerCase())).slice(0, 6) : []
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Laptop {side === 'a' ? '1' : '2'}</p>
      <div className="relative mb-3">
        <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
          style={{ color: '#111827', backgroundColor: '#ffffff' }} placeholder="Search laptop..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg z-10 overflow-hidden">
            {filtered.map(l => (
              <button key={l.id} onClick={() => { onSelect(l, side); setSearch('') }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition border-b border-gray-50 last:border-0">
                <span className="font-medium">{l.name}</span>
                <span className="text-gray-400 ml-2 text-xs">{l.brand}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {laptop ? (
        <div className="text-center">
          <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-3 overflow-hidden">
            {laptop.image_url ? <img src={laptop.image_url} alt={laptop.name} className="object-contain w-full h-full p-4" /> : <span className="text-5xl">💻</span>}
          </div>
          <p className="text-xs text-gray-400 mb-0.5">{laptop.brand}</p>
          <p className="text-sm font-semibold text-gray-900 mb-1">{laptop.name}</p>
          {laptop.price_inr && <p className="text-sm font-bold text-blue-600 mb-3">₹{laptop.price_inr.toLocaleString('en-IN')}</p>}
          <button onClick={() => onRemove(side)} className="text-xs text-red-400 hover:text-red-600 transition">Remove</button>
        </div>
      ) : (
        <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 text-5xl">💻</div>
      )}
    </div>
  )
}


function AICompareSummary({ deviceA, deviceB, specsA, specsB }: { deviceA: any, deviceB: any, specsA: any[], specsB: any[] }) {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [error, setError] = useState('')
  const getSummary = async () => {
    setLoading(true); setError(''); setSummary(null)
    try {
      const res = await fetch('/api/ai-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneA: deviceA, phoneB: deviceB, specsA, specsB }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSummary(data)
    } catch { setError('Failed to get AI summary.') }
    finally { setLoading(false) }
  }
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h3 className="font-bold text-gray-900">AI Verdict</h3>
        </div>
        {!summary && (
          <button onClick={getSummary} disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
            {loading ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing...</> : '✨ Get AI Summary'}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {summary && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <p className="text-sm font-semibold text-gray-900 mb-1">🏆 Overall Verdict</p>
            <p className="text-sm text-gray-600">{summary.verdict}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-600 rounded-xl p-4 text-white">
              <p className="text-xs font-semibold opacity-80 mb-1">Buy {deviceA.name.split(' ').slice(-2).join(' ')} if...</p>
              <p className="text-xs leading-relaxed">{summary.buy_a_if}</p>
            </div>
            <div className="bg-indigo-600 rounded-xl p-4 text-white">
              <p className="text-xs font-semibold opacity-80 mb-1">Buy {deviceB.name.split(' ').slice(-2).join(' ')} if...</p>
              <p className="text-xs leading-relaxed">{summary.buy_b_if}</p>
            </div>
          </div>
          {summary.key_differences && (
            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <p className="text-sm font-semibold text-gray-900 mb-2">Key differences</p>
              <p className="text-sm text-gray-600">{summary.key_differences}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CompareLaptopsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [laptops, setLaptops] = useState<Laptop[]>([])
  const [laptopA, setLaptopA] = useState<Laptop | null>(null)
  const [laptopB, setLaptopB] = useState<Laptop | null>(null)
  const [specsA, setSpecsA] = useState<any[]>([])
  const [specsB, setSpecsB] = useState<any[]>([])

  useEffect(() => {
    supabase.from('laptops').select('*').order('brand').then(({ data }) => {
      setLaptops(data || [])
      const slugA = searchParams.get('a')
      const slugB = searchParams.get('b')
      if (slugA) { const f = (data || []).find(l => l.slug === slugA); if (f) handleSelect(f, 'a') }
      if (slugB) { const f = (data || []).find(l => l.slug === slugB); if (f) handleSelect(f, 'b') }
    })
  }, [])

  const fetchSpecs = async (id: number) => {
    const { data } = await supabase.from('laptop_specs').select('*').eq('laptop_id', id).order('id')
    return data || []
  }

  const handleSelect = async (laptop: Laptop, side: 'a' | 'b') => {
    const specs = await fetchSpecs(laptop.id)
    if (side === 'a') { setLaptopA(laptop); setSpecsA(specs) } else { setLaptopB(laptop); setSpecsB(specs) }
    const params = new URLSearchParams(searchParams.toString())
    params.set(side, laptop.slug)
    router.replace(`/compare-laptops?${params.toString()}`)
  }

  const handleRemove = (side: 'a' | 'b') => {
    if (side === 'a') { setLaptopA(null); setSpecsA([]) } else { setLaptopB(null); setSpecsB([]) }
    const params = new URLSearchParams(searchParams.toString())
    params.delete(side)
    router.replace(`/compare-laptops?${params.toString()}`)
  }

  const allCategories = [...new Set([...specsA.map(s => s.category), ...specsB.map(s => s.category)])]
  const allLabels = (cat: string) => [...new Set([...specsA.filter(s => s.category === cat).map(s => s.label), ...specsB.filter(s => s.category === cat).map(s => s.label)])]

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link><span>&rsaquo;</span>
        <Link href="/laptops" className="hover:text-blue-600">Laptops</Link><span>&rsaquo;</span>
        <span className="text-gray-600">Compare</span>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Compare Laptops</h1>
        <p className="text-sm text-gray-400">Select two laptops to compare specs side by side</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <LaptopSelector side="a" laptop={laptopA} laptops={laptops} onSelect={handleSelect} onRemove={handleRemove} />
        <LaptopSelector side="b" laptop={laptopB} laptops={laptops} onSelect={handleSelect} onRemove={handleRemove} />
      </div>
      {laptopA && laptopB && specsA.length > 0 && specsB.length > 0 && (
        <AICompareSummary deviceA={laptopA} deviceB={laptopB} specsA={specsA} specsB={specsB} />
      )}

      {laptopA && laptopB ? (
        <div className="space-y-4">
          {allCategories.map(cat => (
            <div key={cat} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <span>{ICONS[cat] || '📋'}</span>
                <span className="text-sm font-semibold text-gray-700">{cat}</span>
              </div>
              <table className="w-full">
                <tbody>
                  {allLabels(cat).map((label, i) => {
                    const valA = specsA.find(s => s.category === cat && s.label === label)?.value || '—'
                    const valB = specsB.find(s => s.category === cat && s.label === label)?.value || '—'
                    return (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-5 py-3 text-sm text-gray-400 w-1/4">{label}</td>
                        <td className={`px-5 py-3 text-sm font-medium w-[37.5%] ${valA !== valB ? 'text-blue-600' : 'text-gray-900'}`}>{valA}</td>
                        <td className={`px-5 py-3 text-sm font-medium w-[37.5%] ${valA !== valB ? 'text-blue-600' : 'text-gray-900'}`}>{valB}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">💻</div>
          <p className="text-sm">Select two laptops above to compare</p>
        </div>
      )}
    </main>
  )
}

export default function CompareLaptopsPage() {
  return <Suspense><CompareLaptopsContent /></Suspense>
}
