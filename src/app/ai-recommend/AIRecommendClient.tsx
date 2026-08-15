'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
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
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 text-[var(--text)]">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-neon-violet to-neon-cyan rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🤖</div>
        <h1 className="text-2xl font-bold text-white mb-2">AI Device Recommender</h1>
        <p className="text-[rgba(255,255,255,0.4)] text-sm">Describe what you need and AI will find the best devices for you</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6 bg-[var(--panel)] border border-[rgba(255,255,255,0.06)] rounded-xl p-1 w-fit mx-auto">
        {(['phones', 'tablets', 'laptops'] as Mode[]).map(m => (
          <button key={m} onClick={() => switchMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${mode === m ? 'bg-gradient-to-r from-neon-cyan to-neon-violet text-black shadow-sm' : 'text-dim hover:text-[rgba(255,255,255,0.85)]'}`}>
            {MODE_CONFIG[m].emoji} {MODE_CONFIG[m].label}s
          </button>
        ))}
      </div>

      <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 mb-6 neon-border">
        <label className="block text-sm font-medium text-[rgba(255,255,255,0.85)] mb-2">What are you looking for?</label>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          rows={3}
          placeholder={`e.g. ${EXAMPLES[mode][0]}...`}
          className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-violet resize-none"
          style={{ color: '#111827', backgroundColor: '#ffffff' }}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleRecommend())}
        />

        <div className="flex flex-wrap gap-2 mt-3 mb-4">
          {EXAMPLES[mode].map(ex => (
            <button key={ex} onClick={() => setQuery(ex)}
              className="text-xs px-3 py-1.5 neon-badge border border-[rgba(139,92,246,0.2)] rounded-full hover:border-neon-violet transition">
              {ex}
            </button>
          ))}
        </div>

        <button onClick={handleRecommend} disabled={loading || !query.trim()}
          className="w-full bg-gradient-to-r from-neon-violet to-neon-cyan text-black rounded-xl py-3 text-sm font-semibold hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Finding best {config.label.toLowerCase()}s...
            </>
          ) : (
            <>🤖 Get AI Recommendations</>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)] rounded-xl p-4 mb-6 text-red-400 text-sm">{error}</div>
      )}

      {recommendations.length > 0 && (
        <div>
          {explanation && (
            <div className="bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.2)] rounded-xl p-4 mb-6">
              <p className="text-sm text-[#a78bfa]"><span className="font-semibold">🤖 AI:</span> {explanation}</p>
            </div>
          )}

          <h2 className="text-base font-bold text-white mb-4">Top recommendations for you</h2>
          <div className="flex flex-col gap-4">
            {recommendations.map((rec: any, i: number) => (
              <Link key={i} href={`/${config.table}/${rec.item.slug}`}
                className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 hover:border-neon-violet hover:glow transition group flex gap-4">
                <div className="w-20 h-20 bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {rec.item.image_url
                    ? <img src={rec.item.image_url} alt={rec.item.name} className="object-contain w-full h-full p-1" />
                    : <span className="text-3xl">{config.emoji}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="text-xs neon-badge px-2 py-0.5 rounded-full font-medium mr-2">#{i + 1}</span>
                      <span className="text-xs text-[rgba(255,255,255,0.4)]">{rec.item.brand}</span>
                    </div>
                    {rec.item.price_inr && (
                      <span className="text-sm font-bold text-neon-cyan flex-shrink-0">
                        {formatPriceINR(rec.item.price_inr)}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-white group-hover:text-neon-violet transition mb-1">{rec.item.name}</p>
                  <p className="text-xs text-dim leading-relaxed">{rec.reason}</p>
                </div>
              </Link>
            ))}
          </div>

          <p className="text-xs text-[rgba(255,255,255,0.4)] text-center mt-6">
            Powered by AI · Based on AVSurge's device database
          </p>
        </div>
      )}
    </main>
  )
}
