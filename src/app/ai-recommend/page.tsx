'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AIRecommendPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [error, setError] = useState('')
  const [explanation, setExplanation] = useState('')

  const examples = [
    'Best camera phone under ₹30,000',
    'Long battery life phone under ₹20,000',
    'Best gaming phone under ₹50,000 with 5G',
    'Compact phone with good performance under ₹40,000',
    'Best flagship phone with great display',
  ]

  const handleRecommend = async () => {
    if (!query.trim()) return
    setLoading(true)
    setRecommendations([])
    setExplanation('')
    setError('')

    try {
      const { data: phones } = await supabase
        .from('phones')
        .select('id, name, brand, slug, price_inr, image_url')
        .not('price_inr', 'is', null)
        .order('price_inr', { ascending: true })

      const { data: specs } = await supabase
        .from('phone_specs')
        .select('phone_id, label, value')
        .in('label', ['Chipset', 'RAM', 'Main camera', 'Capacity', 'Charging speed', 'Screen size', '5G', 'Storage'])

      if (!phones) throw new Error('Failed to fetch phones')

      const specMap: Record<number, Record<string, string>> = {}
      for (const s of specs || []) {
        if (!specMap[s.phone_id]) specMap[s.phone_id] = {}
        specMap[s.phone_id][s.label] = s.value
      }

      const phoneList = phones.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        slug: p.slug,
        price_inr: p.price_inr,
        image_url: p.image_url,
        specs: specMap[p.id] || {},
      }))

      const res = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, phones: phoneList }),
      })

      const parsed = await res.json()
      if (!res.ok) throw new Error(parsed.error)

      setExplanation(parsed.explanation)

      const matched = parsed.recommendations.map((rec: any) => {
        const phone = phoneList.find(p =>
          p.name.toLowerCase() === rec.name.toLowerCase() ||
          p.name.toLowerCase().includes(rec.name.toLowerCase())
        )
        return { ...rec, phone }
      }).filter((r: any) => r.phone)

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
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🤖</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Phone Recommender</h1>
        <p className="text-gray-400 text-sm">Describe what you need and AI will find the best phones for you</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">What are you looking for?</label>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          rows={3}
          placeholder="e.g. Best camera phone under ₹30,000 with good battery life and 5G..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
          style={{ color: '#111827', backgroundColor: '#ffffff' }}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleRecommend())}
        />

        <div className="flex flex-wrap gap-2 mt-3 mb-4">
          {examples.map(ex => (
            <button key={ex}
              onClick={() => setQuery(ex)}
              className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-100 transition">
              {ex}
            </button>
          ))}
        </div>

        <button
          onClick={handleRecommend}
          disabled={loading || !query.trim()}
          className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Finding best phones...
            </>
          ) : (
            <>🤖 Get AI Recommendations</>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-600 text-sm">
          {error}
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          {explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-700"><span className="font-semibold">🤖 AI:</span> {explanation}</p>
            </div>
          )}

          <h2 className="text-base font-bold text-gray-900 mb-4">Top recommendations for you</h2>
          <div className="flex flex-col gap-4">
            {recommendations.map((rec: any, i: number) => (
              <Link key={i} href={`/phones/${rec.phone.slug}`}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group flex gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {rec.phone.image_url
                    ? <img src={rec.phone.image_url} alt={rec.phone.name} className="object-contain w-full h-full p-1" />
                    : <span className="text-3xl">📱</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium mr-2">#{i + 1}</span>
                      <span className="text-xs text-gray-400">{rec.phone.brand}</span>
                    </div>
                    {rec.phone.price_inr && (
                      <span className="text-sm font-bold text-blue-600 flex-shrink-0">
                        ₹{rec.phone.price_inr.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition mb-1">{rec.phone.name}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{rec.reason}</p>
                </div>
              </Link>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            Powered by Gemini AI · Based on AVSurge's database of 250+ phones
          </p>
        </div>
      )}
    </main>
  )
}
