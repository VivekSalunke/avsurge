'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPriceINR } from '@/lib/format'

interface PriceEntry {
  id: number
  price_inr: number
  tracked_at: string
}

export default function LaptopPriceHistory({ laptopId, currentPrice }: { laptopId: number, currentPrice: number | null }) {
  const [history, setHistory] = useState<PriceEntry[]>([])

  useEffect(() => { fetchHistory() }, [laptopId])

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('laptop_price_history')
      .select('*')
      .eq('laptop_id', laptopId)
      .order('tracked_at', { ascending: true })
    if (!error && data) setHistory(data)
  }

  if (history.length === 0) return null

  const minPrice = Math.min(...history.map(h => h.price_inr))
  const maxPrice = Math.max(...history.map(h => h.price_inr))
  const firstPrice = history[0]?.price_inr
  const latestPrice = history[history.length - 1]?.price_inr
  const priceChange = latestPrice - firstPrice
  const priceDrop = priceChange < 0
  const chartMax = maxPrice * 1.05
  const chartMin = minPrice * 0.95

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden neon-border">
      <div className="flex items-center justify-between px-5 py-4 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.04)]">
        <span className="text-sm font-semibold text-[rgba(255,255,255,0.85)]">Price History</span>
        {priceChange !== 0 && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priceDrop ? 'badge-green' : 'badge-red'}`}>
            {priceDrop ? 'Down' : 'Up'} {formatPriceINR(Math.abs(priceChange))} since launch
          </span>
        )}
      </div>
      <div className="px-5 py-4">
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-3 text-center">
            <p className="text-xs text-dim mb-1">Lowest</p>
            <p className="text-sm font-bold text-green-400">{formatPriceINR(minPrice)}</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-3 text-center">
            <p className="text-xs text-dim mb-1">Current</p>
            <p className="text-sm font-bold text-neon-cyan">{formatPriceINR((currentPrice || latestPrice))}</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-3 text-center">
            <p className="text-xs text-dim mb-1">Highest</p>
            <p className="text-sm font-bold text-red-400">{formatPriceINR(maxPrice)}</p>
          </div>
        </div>
        <div className="flex items-end gap-1.5 h-24 mb-2">
          {history.map((entry, i) => {
            const range = chartMax - chartMin
            const heightPct = range === 0 ? 80 : ((entry.price_inr - chartMin) / range) * 100
            const isLatest = i === history.length - 1
            return (
              <div key={entry.id} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                <div className={`w-full rounded-t-md ${isLatest ? 'bg-neon-cyan' : 'bg-[rgba(6,182,212,0.3)] group-hover:bg-[rgba(6,182,212,0.5)]'} transition-all`}
                  style={{ height: `${Math.max(heightPct, 8)}%` }} />
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[var(--panel)] border border-[rgba(255,255,255,0.06)] text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                  {formatPriceINR(entry.price_inr)}<br />
                  <span className="text-dim">{new Date(entry.tracked_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-1.5">
          {history.map((entry, i) => (
            <div key={entry.id} className="flex-1 text-center">
              {(i === 0 || i === history.length - 1) && (
                <p className="text-xs text-dim truncate">
                  {new Date(entry.tracked_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
