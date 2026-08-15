'use client'
import { useState } from 'react'

const RATING_COLORS: Record<string, string> = {
  excellent: 'text-green-400 bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.2)]',
  good: 'text-neon-cyan bg-[rgba(6,182,212,0.1)] border-[rgba(6,182,212,0.2)]',
  average: 'text-yellow-400 bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.2)]',
  basic: 'text-dim bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]',
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
        className="text-xs text-neon-cyan hover:text-white hover:underline ml-1 transition"
        title="Get an AI-generated explanation of this spec">
        🤖
      </button>

      {open && (
        <div className="mt-2 bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.15)] rounded-xl p-3">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-neon-cyan">
              <div className="w-3 h-3 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
              Explaining...
            </div>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
          {data && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wide text-[rgba(6,182,212,0.7)] font-medium">AI-generated explanation</p>
              {data.rating && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${RATING_COLORS[data.rating] || RATING_COLORS.average}`}>
                  {RATING_EMOJI[data.rating]} {data.rating}
                </span>
              )}
              <p className="text-xs text-[rgba(255,255,255,0.85)] leading-relaxed">{data.explanation}</p>
              {data.tip && (
                <p className="text-xs text-neon-cyan bg-[rgba(255,255,255,0.02)] rounded-lg px-3 py-2 border border-[rgba(6,182,212,0.15)]">
                  💡 {data.tip}
                </p>
              )}
              <button onClick={() => setOpen(false)} className="text-xs text-dim hover:text-white">
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
