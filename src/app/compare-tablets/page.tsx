'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const ICONS: Record<string, string> = {
  Display: '🖥️', Performance: '⚡', Camera: '📷',
  Battery: '🔋', Connectivity: '📡', Build: '🏗️',
  Storage: '💾', General: '📋', Audio: '🔊',
}

interface Tablet {
  id: number
  name: string
  brand: string
  slug: string
  price_inr: number | null
  image_url: string | null
}

interface TabletSelectorProps {
  side: 'a' | 'b'
  tablet: Tablet | null
  tablets: Tablet[]
  onSelect: (tablet: Tablet, side: 'a' | 'b') => void
  onRemove: (side: 'a' | 'b') => void
}

function TabletSelector({ side, tablet, tablets, onSelect, onRemove }: TabletSelectorProps) {
  const [search, setSearch] = useState('')

  const filtered = search.length > 0
    ? tablets.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.brand.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 6)
    : []

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Tablet {side === 'a' ? '1' : '2'}
      </p>

      <div className="relative mb-3">
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
          style={{ color: '#111827', backgroundColor: '#ffffff' }}
          placeholder="Search tablet..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoComplete="off"
        />
        {search && filtered.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
            {filtered.map((t) => (
              <button key={t.id}
                onMouseDown={e => {
                  e.preventDefault()
                  onSelect(t, side)
                  setSearch('')
                }}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 transition border-b border-gray-50 last:border-0 flex items-center gap-2">
                <div className="w-7 h-7 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {t.image_url
                    ? <img src={t.image_url} alt={t.name} className="object-contain w-full h-full" />
                    : <span className="text-xs">📟</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-xs">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.brand}</p>
                </div>
                {t.price_inr && (
                  <p className="text-xs text-blue-600 flex-shrink-0">
                    ₹{t.price_inr.toLocaleString('en-IN')}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {tablet ? (
        <div className="text-center">
          <div className="w-28 h-28 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
            {tablet.image_url
              ? <img src={tablet.image_url} alt={tablet.name} className="object-contain w-full h-full p-2" />
              : <span className="text-5xl">📟</span>}
          </div>
          <p className="font-semibold text-gray-900 text-sm">{tablet.name}</p>
          <p className="text-xs text-gray-400 mb-1">{tablet.brand}</p>
          {tablet.price_inr && (
            <p className="text-blue-600 text-sm font-bold">₹{tablet.price_inr.toLocaleString('en-IN')}</p>
          )}
          <button onClick={() => onRemove(side)}
            className="text-xs text-gray-400 hover:text-red-500 mt-2 transition">
            × Remove
          </button>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-300">
          <p className="text-3xl mb-2">📟</p>
          <p className="text-xs">Search and select a tablet</p>
        </div>
      )}
    </div>
  )
}

function CompareTabletsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tablets, setTablets] = useState<Tablet[]>([])
  const [tabletA, setTabletA] = useState<Tablet | null>(null)
  const [tabletB, setTabletB] = useState<Tablet | null>(null)
  const [specsA, setSpecsA] = useState<any[]>([])
  const [specsB, setSpecsB] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.from('tablets').select('*').order('name').then(({ data }) => {
      const list = data || []
      setTablets(list)
      const slugA = searchParams.get('a')
      const slugB = searchParams.get('b')
      if (slugA) {
        const t = list.find((t: Tablet) => t.slug === slugA)
        if (t) { setTabletA(t); loadSpecs(t.id, 'a') }
      }
      if (slugB) {
        const t = list.find((t: Tablet) => t.slug === slugB)
        if (t) { setTabletB(t); loadSpecs(t.id, 'b') }
      }
    })
  }, [])

  useEffect(() => {
    if (tabletA || tabletB) {
      const params = new URLSearchParams()
      if (tabletA) params.set('a', tabletA.slug)
      if (tabletB) params.set('b', tabletB.slug)
      router.replace(`/compare-tablets?${params.toString()}`, { scroll: false })
    }
  }, [tabletA, tabletB])

  const loadSpecs = async (tabletId: number, side: 'a' | 'b') => {
    const { data } = await supabase.from('tablet_specs').select('*').eq('tablet_id', tabletId).order('id')
    if (side === 'a') setSpecsA(data || [])
    else setSpecsB(data || [])
  }

  const handleSelect = async (tablet: Tablet, side: 'a' | 'b') => {
    setLoading(true)
    if (side === 'a') setTabletA(tablet)
    else setTabletB(tablet)
    await loadSpecs(tablet.id, side)
    setLoading(false)
  }

  const handleRemove = (side: 'a' | 'b') => {
    if (side === 'a') { setTabletA(null); setSpecsA([]) }
    else { setTabletB(null); setSpecsB([]) }
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const allCategories = [...new Set([...specsA, ...specsB].map(s => s.category))]

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
    const numA = parseFloat(valA.replace(/[^0-9.]/g, ''))
    const numB = parseFloat(valB.replace(/[^0-9.]/g, ''))
    if (isNaN(numA) || isNaN(numB)) return null
    return numA > numB ? 'a' : numB > numA ? 'b' : null
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compare tablets</h1>
          <p className="text-sm text-gray-400">Search and select two tablets to compare</p>
        </div>
        {tabletA && tabletB && (
          <button onClick={copyShareLink}
            className={`text-xs px-4 py-2 rounded-xl border transition font-medium ${copied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}>
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <TabletSelector side="a" tablet={tabletA} tablets={tablets} onSelect={handleSelect} onRemove={handleRemove} />
        <TabletSelector side="b" tablet={tabletB} tablets={tablets} onSelect={handleSelect} onRemove={handleRemove} />
      </div>

      {tabletA && tabletB && !loading && (
        <div className="flex flex-col gap-5">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-blue-400 mb-0.5">Comparing</p>
              <p className="text-sm font-semibold text-blue-800">{tabletA.name} vs {tabletB.name}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(tabletA.name)}`} target="_blank"
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                Buy {tabletA.name.split(' ').slice(-1)} →
              </a>
              <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(tabletB.name)}`} target="_blank"
                className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                Buy {tabletB.name.split(' ').slice(-1)} →
              </a>
            </div>
          </div>

          {allCategories.map(cat => (
            <div key={cat} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <span>{ICONS[cat] || '📋'}</span>
                <span className="text-sm font-semibold text-gray-700">{cat}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-100">
                <div className="px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50/50 truncate">{tabletA.name}</div>
                <div className="px-4 py-2 text-xs font-medium text-gray-400 text-center">Spec</div>
                <div className="px-4 py-2 text-xs font-medium text-purple-600 bg-purple-50/50 text-right truncate">{tabletB.name}</div>
              </div>
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

          <div className="grid grid-cols-2 gap-4">
            <Link href={`/tablets/${tabletA.slug}`}
              className="bg-white border border-gray-200 rounded-xl py-3 text-center text-sm text-blue-600 hover:border-blue-300 transition">
              Full specs: {tabletA.name} →
            </Link>
            <Link href={`/tablets/${tabletB.slug}`}
              className="bg-white border border-gray-200 rounded-xl py-3 text-center text-sm text-purple-600 hover:border-purple-300 transition">
              Full specs: {tabletB.name} →
            </Link>
          </div>
        </div>
      )}

      {(!tabletA || !tabletB) && (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center">
          <p className="text-4xl mb-3">📟 vs 📟</p>
          <p className="text-gray-400 text-sm">Search and select two tablets above to start comparing</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-400 text-sm">Loading specs…</div>
      )}
    </main>
  )
}

export default function CompareTabletsPage() {
  return (
    <Suspense>
      <CompareTabletsContent />
    </Suspense>
  )
}
