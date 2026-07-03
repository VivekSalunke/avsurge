'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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

export default function AIRecommendPage() {
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

      const { data: specs } = await supabase
        .from(config.specsTable)
        .select(`${config.idKey}, label, value`)
        .in('label', config.specLabels)

      if (!items) throw new Error('Failed to fetch data')

      const specMap: Record<number, Record<string, string>> = {}
      for (const s of specs || []) {
        const id = s[config.idKey]
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
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🤖</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Device Recommender</h1>
        <p className="text-gray-400 text-sm">Describe what you need and AI will find the best devices for you</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit mx-auto">
        {(['phones', 'tablets', 'laptops'] as Mode[]).map(m => (
          <button key={m} onClick={() => switchMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${mode === m ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            {MODE_CONFIG[m].emoji} {MODE_CONFIG[m].label}s
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">What are you looking for?</label>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          rows={3}
          placeholder={`e.g. ${EXAMPLES[mode][0]}...`}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 resize-none"
          style={{ color: '#111827', backgroundColor: '#ffffff' }}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleRecommend())}
        />

        <div className="flex flex-wrap gap-2 mt-3 mb-4">
          {EXAMPLES[mode].map(ex => (
            <button key={ex} onClick={() => setQuery(ex)}
              className="text-xs px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-full hover:bg-purple-100 transition">
              {ex}
            </button>
          ))}
        </div>

        <button onClick={handleRecommend} disabled={loading || !query.trim()}
          className="w-full bg-purple-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
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
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-600 text-sm">{error}</div>
      )}

      {recommendations.length > 0 && (
        <div>
          {explanation && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-purple-700"><span className="font-semibold">🤖 AI:</span> {explanation}</p>
            </div>
          )}

          <h2 className="text-base font-bold text-gray-900 mb-4">Top recommendations for you</h2>
          <div className="flex flex-col gap-4">
            {recommendations.map((rec: any, i: number) => (
              <Link key={i} href={`/${config.table}/${rec.item.slug}`}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-sm transition group flex gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {rec.item.image_url
                    ? <img src={rec.item.image_url} alt={rec.item.name} className="object-contain w-full h-full p-1" />
                    : <span className="text-3xl">{config.emoji}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium mr-2">#{i + 1}</span>
                      <span className="text-xs text-gray-400">{rec.item.brand}</span>
                    </div>
                    {rec.item.price_inr && (
                      <span className="text-sm font-bold text-blue-600 flex-shrink-0">
                        ₹{rec.item.price_inr.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition mb-1">{rec.item.name}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{rec.reason}</p>
                </div>
              </Link>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            Powered by AI · Based on AVSurge's device database
          </p>
        </div>
      )}
    </main>
  )
}
