'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatPriceINR } from '@/lib/format'




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
    <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 neon-border">
      <p className="text-xs font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wide mb-3">Laptop {side === 'a' ? '1' : '2'}</p>
      <div className="relative mb-3">
        <input className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan"
          style={{ color: '#111827', backgroundColor: '#ffffff' }} placeholder="Search laptop..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-[var(--panel)] border border-[rgba(255,255,255,0.06)] rounded-xl mt-1 shadow-lg z-10 overflow-hidden">
            {filtered.map(l => (
              <button key={l.id} onClick={() => { onSelect(l, side); setSearch('') }}
                className="w-full text-left px-4 py-2.5 text-sm text-[rgba(255,255,255,0.85)] hover:bg-[rgba(6,182,212,0.06)] transition border-b border-[rgba(255,255,255,0.04)] last:border-0">
                <span className="font-medium">{l.name}</span>
                <span className="text-[rgba(255,255,255,0.4)] ml-2 text-xs">{l.brand}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {laptop ? (
        <div className="text-center">
          <div className="w-full aspect-square bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mb-3 overflow-hidden">
            {laptop.image_url ? <img src={laptop.image_url} alt={laptop.name} className="object-contain w-full h-full p-4" /> : <span className="text-5xl">💻</span>}
          </div>
          <p className="text-xs text-[rgba(255,255,255,0.4)] mb-0.5">{laptop.brand}</p>
          <p className="text-sm font-semibold text-white mb-1">{laptop.name}</p>
          {laptop.price_inr && <p className="text-sm font-bold text-neon-cyan mb-3">{formatPriceINR(laptop.price_inr)}</p>}
          <button onClick={() => onRemove(side)} className="text-xs text-red-400 hover:text-red-600 transition">Remove</button>
        </div>
      ) : (
        <div className="aspect-square bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center text-[rgba(255,255,255,0.5)] text-5xl">💻</div>
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
    <div className="bg-[var(--panel)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 neon-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h3 className="font-bold text-white">AI Verdict</h3>
        </div>
        {!summary && (
          <button onClick={getSummary} disabled={loading}
            className="bg-gradient-to-r from-neon-violet to-neon-cyan text-black px-4 py-2 rounded-xl text-sm font-medium hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2">
            {loading ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing...</> : '✨ Get AI Summary'}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {summary && (
        <div className="space-y-4">
          <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
            <p className="text-sm font-semibold text-white mb-1">🏆 Overall Verdict</p>
            <p className="text-sm text-[rgba(255,255,255,0.65)]">{summary.verdict}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[rgba(6,182,212,0.1)] rounded-xl p-4 text-white border border-[rgba(6,182,212,0.2)]">
              <p className="text-xs font-semibold opacity-80 mb-1">Buy {deviceA.name.split(' ').slice(-2).join(' ')} if...</p>
              <p className="text-xs leading-relaxed">{summary.buy_a_if}</p>
            </div>
            <div className="bg-[rgba(139,92,246,0.12)] rounded-xl p-4 text-white border border-[rgba(139,92,246,0.25)]">
              <p className="text-xs font-semibold opacity-80 mb-1">Buy {deviceB.name.split(' ').slice(-2).join(' ')} if...</p>
              <p className="text-xs leading-relaxed">{summary.buy_b_if}</p>
            </div>
          </div>
          {summary.key_differences && (
            <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
              <p className="text-sm font-semibold text-white mb-2">Key differences</p>
              <p className="text-sm text-[rgba(255,255,255,0.65)]">{summary.key_differences}</p>
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
    <main className="max-w-5xl mx-auto px-4 py-8 text-[var(--text)]">
      <div className="text-sm text-[rgba(255,255,255,0.4)] mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neon-cyan">Home</Link><span>&rsaquo;</span>
        <Link href="/laptops" className="hover:text-neon-cyan">Laptops</Link><span>&rsaquo;</span>
        <span className="text-[rgba(255,255,255,0.65)]">Compare</span>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Compare Laptops</h1>
        <p className="text-sm text-[rgba(255,255,255,0.4)]">Select two laptops to compare specs side by side</p>
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
            <div key={cat} className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden neon-border">
              <div className="flex items-center gap-2 px-5 py-3 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.04)]">
                <span>{ICONS[cat] || '📋'}</span>
                <span className="text-sm font-semibold text-[rgba(255,255,255,0.85)]">{cat}</span>
              </div>
              <table className="w-full">
                <tbody>
                  {allLabels(cat).map((label, i) => {
                    const valA = specsA.find(s => s.category === cat && s.label === label)?.value || '—'
                    const valB = specsB.find(s => s.category === cat && s.label === label)?.value || '—'
                    return (
                      <tr key={i} className={i % 2 === 0 ? 'bg-transparent' : 'bg-[rgba(255,255,255,0.02)]'}>
                        <td className="px-5 py-3 text-sm text-[rgba(255,255,255,0.4)] w-1/4">{label}</td>
                        <td className={`px-5 py-3 text-sm font-medium w-[37.5%] ${valA !== valB ? 'text-neon-cyan' : 'text-white'}`}>{valA}</td>
                        <td className={`px-5 py-3 text-sm font-medium w-[37.5%] ${valA !== valB ? 'text-neon-cyan' : 'text-white'}`}>{valB}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--card-bg)] border border-dashed border-[rgba(255,255,255,0.06)] rounded-2xl py-16 text-center text-[rgba(255,255,255,0.4)]">
          <div className="text-4xl mb-3">💻</div>
          <p className="text-sm">Select two laptops above to compare</p>
        </div>
      )}
    </main>
  )
}

export default function CompareLaptopsClient() {
  return <Suspense><CompareLaptopsContent /></Suspense>
}
