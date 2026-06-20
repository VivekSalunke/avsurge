'use client'
import { useState } from 'react'

const RATING_COLORS: Record<string, string> = {
  excellent: 'text-green-600 bg-green-50 border-green-200',
  good: 'text-blue-600 bg-blue-50 border-blue-200',
  average: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  basic: 'text-gray-600 bg-gray-50 border-gray-200',
}

const RATING_EMOJI: Record<string, string> = {
  excellent: '🌟',
  good: '✅',
  average: '⚠️',
  basic: '📌',
}

export default function SpecExplainer({ label, value, phoneName }: {
  label: string
  value: string
  phoneName: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')

  const explain = async () => {
    if (data) { setOpen(!open); return }
    setOpen(true)
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, value, phoneName }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setData(json)
    } catch {
      setError('Failed to explain. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={explain}
        className="text-xs text-blue-500 hover:text-blue-700 hover:underline ml-1 transition"
        title="Explain this spec">
        🤖
      </button>

      {open && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-blue-500">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Explaining...
            </div>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          {data && (
            <div className="space-y-2">
              {data.rating && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${RATING_COLORS[data.rating] || RATING_COLORS.average}`}>
                  {RATING_EMOJI[data.rating]} {data.rating}
                </span>
              )}
              <p className="text-xs text-gray-700 leading-relaxed">{data.explanation}</p>
              {data.tip && (
                <p className="text-xs text-blue-600 bg-white rounded-lg px-3 py-2 border border-blue-100">
                  💡 {data.tip}
                </p>
              )}
              <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
