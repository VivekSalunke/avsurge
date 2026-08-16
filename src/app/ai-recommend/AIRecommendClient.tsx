'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import AILogo from '@/components/AILogo'
import { formatPriceINR } from '@/lib/format'

type Mode = 'phones' | 'tablets' | 'laptops'

const EXAMPLES: Record<Mode, string[]> = {
  phones: [
    'Best camera phone under ₹30,000',
    'Long battery life phone under ₹20,000',
    'Best gaming phone under ₹50,000 with 5G',
    'Compact phone with good performance under ₹40,000',
    'Best flagship phone with great display',
  ],
  tablets: [
    'Best tablet for students under ₹30,000',
    'iPad alternative under ₹20,000',
    'Best tablet for drawing and design',
    'Tablet with best display under ₹50,000',
    'Lightweight tablet for reading and browsing',
  ],
  laptops: [
    'Best laptop for college students under ₹50,000',
    'Lightweight laptop for travel under ₹80,000',
    'Best gaming laptop under ₹1,00,000',
    'MacBook alternative under ₹70,000',
    'Best laptop for video editing under ₹1,50,000',
  ],
}

const MODE_CONFIG: Record<Mode, { emoji: string; label: string; table: string; specsTable: string; idKey: string; specLabels: string[] }> = {
  phones: {
    emoji: '📱', label: 'Phone',
    table: 'phones', specsTable: 'phone_specs', idKey: 'phone_id',
    specLabels: ['Chipset', 'RAM', 'Main camera', 'Capacity', 'Charging speed', 'Screen size', '5G', 'Storage'],
  },
  tablets: {
    emoji: '📟', label: 'Tablet',
    table: 'tablets', specsTable: 'tablet_specs', idKey: 'tablet_id',
    specLabels: ['Chipset', 'RAM', 'Storage', 'Display', 'Battery', 'Screen size', 'Connectivity'],
  },
  laptops: {
    emoji: '💻', label: 'Laptop',
    table: 'laptops', specsTable: 'laptop_specs', idKey: 'laptop_id',
    specLabels: ['Processor', 'RAM', 'Storage', 'Display', 'Battery Life', 'GPU', 'Screen Size', 'Weight'],
  },
}

export default function AIRecommendClient() {
  const [mode, setMode] = useState<Mode>('phones')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [error, setError] = useState('')
  const [explanation, setExplanation] = useState('')

  const config = MODE_CONFIG[mode]

  const switchMode = (m: Mode) => {
    setMode(m)
    setQuery('')
    setRecommendations([])
    setExplanation('')
    setError('')
  }

  const handleRecommend = async () => {
    if (!query.trim()) return
    setLoading(true)
    setRecommendations([])
    setExplanation('')
    setError('')

    try {
      const { data: items } = await supabase
        .from(config.table)
        .select('id, name, brand, slug, price_inr, image_url')
        .not('price_inr', 'is', null)
        .order('price_inr', { ascending: true })

      const { data: specsRaw } = await supabase
        .from(config.specsTable)
        .select('*')
        .in('label', config.specLabels)
      const specs = specsRaw as any[]

      if (!items) throw new Error('Failed to fetch data')

      const specMap: Record<number, Record<string, string>> = {}
      for (const s of (specs || [])) {
        const id = s[config.idKey] as number
        if (!specMap[id]) specMap[id] = {}
        specMap[id][s.label] = s.value
      }

      const itemList = items.map(p => ({
        id: p.id, name: p.name, brand: p.brand,
        slug: p.slug, price_inr: p.price_inr, image_url: p.image_url,
        specs: specMap[p.id] || {},
      }))

      const res = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, phones: itemList, deviceType: config.label }),
      })

      const parsed = await res.json()
      if (!res.ok) throw new Error(parsed.error)

      setExplanation(parsed.explanation)

      const matched = parsed.recommendations.map((rec: any) => {
        const item = itemList.find(p =>
          p.name.toLowerCase() === rec.name.toLowerCase() ||
          p.name.toLowerCase().includes(rec.name.toLowerCase())
        )
        return { ...rec, item }
      }).filter((r: any) => r.item)

      setRecommendations(matched)
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative mx-auto max-w-3xl px-4 py-12 text-[var(--text)]">
      <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12),transparent_65%)] blur-2xl" />

      {/* Hero */}
      <div className="relative mb-10 text-center">
        <div className="mx-auto mb-5 w-fit">
          <AILogo size="lg" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          AI Device <span className="text-emerald-400">Recommender</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
          Describe what you need in plain English and AI will find the best phones, tablets and laptops for you.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mb-8 flex w-fit gap-1 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--panel)] p-1">
        {(['phones', 'tablets', 'laptops'] as Mode[]).map(m => (
          <button key={m} onClick={() => switchMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${mode === m ? 'bg-gradient-to-r from-neon-cyan to-neon-violet text-black shadow-sm' : 'text-dim hover:text-[rgba(255,255,255,0.85)]'}`}>
            {MODE_CONFIG[m].emoji} {MODE_CONFIG[m].label}s
          </button>
        ))}
      </div>

      {/* Input card */}
      <div className="relative mb-8 rounded-2xl border border-[rgba(139,92,246,0.22)] bg-[var(--panel)] p-6 shadow-[0_0_50px_rgba(139,92,246,0.07)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12),transparent_65%)] blur-xl" />
          <div className="absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_65%)] blur-xl" />
        </div>

        <div className="relative">
          <div className="mb-4 flex items-center gap-2.5">
            <AILogo size="xs" />
            <label className="text-sm font-semibold text-white">What are you looking for?</label>
          </div>

          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            rows={3}
            placeholder={`e.g. ${EXAMPLES[mode][0]}...`}
            className="w-full resize-none rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-sm outline-none transition placeholder:text-[rgba(255,255,255,0.4)] focus:border-neon-violet focus:ring-2 focus:ring-[rgba(139,92,246,0.15)]"
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleRecommend())}
          />

          <div className="mb-5 mt-4 flex flex-wrap gap-2">
            {EXAMPLES[mode].map(ex => (
              <button key={ex} onClick={() => setQuery(ex)}
                className="neon-badge rounded-full border border-[rgba(139,92,246,0.25)] px-3 py-1.5 text-xs transition hover:border-neon-violet">
                {ex}
              </button>
            ))}
          </div>

          <button onClick={handleRecommend} disabled={loading || !query.trim()}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-neon-violet to-neon-cyan py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50">
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                Finding best {config.label.toLowerCase()}s...
              </>
            ) : (
              <>
                <AILogo size="xs" />
                Get AI Recommendations
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.06)] p-4 text-sm text-red-400">{error}</div>
      )}

      {recommendations.length > 0 && (
        <div className="relative">
          {explanation && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.08)] p-4">
              <AILogo size="sm" />
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a78bfa]">AI analysis</p>
                <p className="text-sm leading-relaxed text-[#c4b5fd]">{explanation}</p>
              </div>
            </div>
          )}

          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
            <span className="h-4 w-1 rounded-full bg-gradient-to-b from-neon-violet to-neon-cyan" />
            Top recommendations for you
          </h2>

          <div className="flex flex-col gap-4">
            {recommendations.map((rec: any, i: number) => (
              <Link key={i} href={`/${config.table}/${rec.item.slug}`}
                className="group flex gap-4 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] p-5 transition hover:border-neon-violet hover:glow">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[rgba(255,255,255,0.02)]">
                  {rec.item.image_url
                    ? <img src={rec.item.image_url} alt={rec.item.name} className="h-full w-full object-contain p-1" />
                    : <span className="text-3xl">{config.emoji}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black' : i === 1 ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-black' : i === 2 ? 'bg-gradient-to-r from-orange-700 to-amber-800 text-white' : 'bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.7)]'}`}>
                        {i + 1}
                      </span>
                      <span className="text-xs text-[rgba(255,255,255,0.4)]">{rec.item.brand}</span>
                    </div>
                    {rec.item.price_inr && (
                      <span className="flex-shrink-0 text-sm font-bold text-neon-cyan">
                        {formatPriceINR(rec.item.price_inr)}
                      </span>
                    )}
                  </div>
                  <p className="mb-1 font-semibold text-white transition group-hover:text-neon-violet">{rec.item.name}</p>
                  <p className="text-xs leading-relaxed text-dim">{rec.reason}</p>
                </div>
              </Link>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-[rgba(255,255,255,0.4)]">
            Powered by AI · Based on AVSurge&apos;s device database
          </p>
        </div>
      )}
    </main>
  )
}
