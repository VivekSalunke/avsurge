'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'




const ICONS: Record<string, string> = {
  Display: '🖥️', Performance: '⚡', Camera: '📷',
  Battery: '🔋', Connectivity: '📡', Build: '🏗️',
  Storage: '💾', General: '📋',
}

interface Phone {
  id: number
  name: string
  brand: string
  slug: string
  price_inr: number | null
  image_url: string | null
}

interface PhoneSelectorProps {
  side: 'a' | 'b'
  phone: Phone | null
  phones: Phone[]
  onSelect: (phone: Phone, side: 'a' | 'b') => void
  onRemove: (side: 'a' | 'b') => void
}

function PhoneSelector({ side, phone, phones, onSelect, onRemove }: PhoneSelectorProps) {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = search.length > 0
    ? phones.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 6)
    : []

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Phone {side === 'a' ? '1' : '2'}
      </p>

      <div className="relative mb-3">
        <input
          ref={inputRef}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
          placeholder="Search phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoComplete="off"
        />
        {search && filtered.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
            {filtered.map((p) => (
              <button key={p.id}
                onMouseDown={e => {
                  e.preventDefault()
                  onSelect(p, side)
                  setSearch('')
                }}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 transition border-b border-gray-50 last:border-0 flex items-center gap-2">
                <div className="w-7 h-7 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="object-contain w-full h-full" />
                    : <span className="text-xs">📱</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-xs">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.brand}</p>
                </div>
                {p.price_inr && (
                  <p className="text-xs text-blue-600 flex-shrink-0">
                    ₹{p.price_inr.toLocaleString('en-IN')}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {phone ? (
        <div className="text-center">
          <div className="w-28 h-28 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
            {phone.image_url
              ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full p-2" />
              : <span className="text-5xl">📱</span>}
          </div>
          <p className="font-semibold text-gray-900 text-sm">{phone.name}</p>
          <p className="text-xs text-gray-400 mb-1">{phone.brand}</p>
          {phone.price_inr && (
            <p className="text-blue-600 text-sm font-bold">₹{phone.price_inr.toLocaleString('en-IN')}</p>
          )}
          <button onClick={() => onRemove(side)}
            className="text-xs text-gray-400 hover:text-red-500 mt-2 transition">
            × Remove
          </button>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-300">
          <p className="text-3xl mb-2">📱</p>
          <p className="text-xs">Search and select a phone</p>
        </div>
      )}
    </div>
  )
}

function CompareContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phones, setPhones] = useState<Phone[]>([])
  const [phoneA, setPhoneA] = useState<Phone | null>(null)
  const [phoneB, setPhoneB] = useState<Phone | null>(null)
  const [specsA, setSpecsA] = useState<any[]>([])
  const [specsB, setSpecsB] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.from('phones').select('*').order('name').then(({ data }) => {
      const list = data || []
      setPhones(list)
      const slugA = searchParams.get('a')
      const slugB = searchParams.get('b')
      if (slugA) {
        const p = list.find((p: Phone) => p.slug === slugA)
        if (p) { setPhoneA(p); loadSpecs(p.id, 'a') }
      }
      if (slugB) {
        const p = list.find((p: Phone) => p.slug === slugB)
        if (p) { setPhoneB(p); loadSpecs(p.id, 'b') }
      }
    })
  }, [])

  useEffect(() => {
    if (phoneA || phoneB) {
      const params = new URLSearchParams()
      if (phoneA) params.set('a', phoneA.slug)
      if (phoneB) params.set('b', phoneB.slug)
      router.replace(`/compare?${params.toString()}`, { scroll: false })
    }
  }, [phoneA, phoneB])

  const loadSpecs = async (phoneId: number, side: 'a' | 'b') => {
    const { data } = await supabase.from('phone_specs').select('*').eq('phone_id', phoneId).order('id')
    if (side === 'a') setSpecsA(data || [])
    else setSpecsB(data || [])
  }

  const handleSelect = async (phone: Phone, side: 'a' | 'b') => {
    setLoading(true)
    if (side === 'a') setPhoneA(phone)
    else setPhoneB(phone)
    await loadSpecs(phone.id, side)
    setLoading(false)
  }

  const handleRemove = (side: 'a' | 'b') => {
    if (side === 'a') { setPhoneA(null); setSpecsA([]) }
    else { setPhoneB(null); setSpecsB([]) }
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
          <h1 className="text-2xl font-bold text-gray-900">Compare phones</h1>
          <p className="text-sm text-gray-400">Search and select two phones to compare</p>
        </div>
        {phoneA && phoneB && (
          <button onClick={copyShareLink}
            className={`text-xs px-4 py-2 rounded-xl border transition font-medium ${copied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}>
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <PhoneSelector side="a" phone={phoneA} phones={phones} onSelect={handleSelect} onRemove={handleRemove} />
        <PhoneSelector side="b" phone={phoneB} phones={phones} onSelect={handleSelect} onRemove={handleRemove} />
      </div>

      {phoneA && phoneB && !loading && (
        <div className="flex flex-col gap-5">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-blue-400 mb-0.5">Comparing</p>
              <p className="text-sm font-semibold text-blue-800">{phoneA.name} vs {phoneB.name}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
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

          <AICompareSummary phoneA={phoneA} phoneB={phoneB} specsA={specsA} specsB={specsB} />

          {allCategories.map(cat => (
            <div key={cat} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <span>{ICONS[cat] || '📋'}</span>
                <span className="text-sm font-semibold text-gray-700">{cat}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-100">
                <div className="px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50/50 truncate">{phoneA.name}</div>
                <div className="px-4 py-2 text-xs font-medium text-gray-400 text-center">Spec</div>
                <div className="px-4 py-2 text-xs font-medium text-purple-600 bg-purple-50/50 text-right truncate">{phoneB.name}</div>
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

      {(!phoneA || !phoneB) && (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center">
          <p className="text-4xl mb-3">📱 vs 📱</p>
          <p className="text-gray-400 text-sm">Search and select two phones above to start comparing</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-400 text-sm">Loading specs…</div>
      )}
    </main>
  )
}

export default function ComparePage() {
  return (
    <Suspense>
      <CompareContent />
    </Suspense>
  )
}

function AICompareSummary({ phoneA, phoneB, specsA, specsB }: { phoneA: any, phoneB: any, specsA: any[], specsB: any[] }) {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [error, setError] = useState('')

  const getSummary = async () => {
    setLoading(true)
    setError('')
    setSummary(null)
    try {
      const res = await fetch('/api/ai-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneA, phoneB, specsA, specsB }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSummary(data)
    } catch (e: any) {
      setError('Failed to get AI summary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h3 className="font-bold text-gray-900">AI Verdict</h3>
        </div>
        {!summary && (
          <button
            onClick={getSummary}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
            {loading ? (
              <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing...</>
            ) : '✨ Get AI Summary'}
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
              <p className="text-xs font-semibold opacity-80 mb-1">Buy {phoneA.name.split(' ').slice(-2).join(' ')} if...</p>
              <p className="text-xs leading-relaxed">{summary.buy_a_if}</p>
            </div>
            <div className="bg-purple-600 rounded-xl p-4 text-white">
              <p className="text-xs font-semibold opacity-80 mb-1">Buy {phoneB.name.split(' ').slice(-2).join(' ')} if...</p>
              <p className="text-xs leading-relaxed">{summary.buy_b_if}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: '📷 Camera', winner: summary.winner_camera },
              { label: '🔋 Battery', winner: summary.winner_battery },
              { label: '⚡ Performance', winner: summary.winner_performance },
              { label: '💰 Value', winner: summary.winner_value },
            ].map(({ label, winner }) => {
              const isA = winner?.includes(phoneA.name.split(' ')[0])
              return (
                <div key={label} className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className={`text-xs font-bold ${isA ? 'text-blue-600' : 'text-purple-600'}`}>
                    {winner?.split(' ').slice(0, 2).join(' ')}
                  </p>
                </div>
              )
            })}
          </div>

          <button onClick={getSummary} className="text-xs text-blue-500 hover:underline">Regenerate</button>
        </div>
      )}
    </div>
  )
}
