'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface PriceEntry {
  id: number
  price_inr: number
  tracked_at: string
  store: string
}

export default function PriceHistory({ phoneId, currentPrice }: { phoneId: number, currentPrice: number | null }) {
  const [history, setHistory] = useState<PriceEntry[]>([])

  useEffect(() => { fetchHistory() }, [phoneId])

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('phone_id', phoneId)
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
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">Price History</span>
        {priceChange !== 0 && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priceDrop ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {priceDrop ? 'Down' : 'Up'} ₹{Math.abs(priceChange).toLocaleString('en-IN')} since launch
          </span>
        )}
      </div>

      <div className="px-5 py-4">
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Lowest</p>
            <p className="text-sm font-bold text-green-600">₹{minPrice.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Current</p>
            <p className="text-sm font-bold text-blue-600">₹{(currentPrice || latestPrice).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Highest</p>
            <p className="text-sm font-bold text-red-500">₹{maxPrice.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="flex items-end gap-1.5 h-24 mb-2">
          {history.map((entry, i) => {
            const range = chartMax - chartMin
            const heightPct = range === 0 ? 80 : ((entry.price_inr - chartMin) / range) * 100
            const isLatest = i === history.length - 1
            return (
              <div key={entry.id} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                <div
                  className={`w-full rounded-t-md ${isLatest ? 'bg-blue-500' : 'bg-blue-200 group-hover:bg-blue-300'} transition-all`}
                  style={{ height: `${Math.max(heightPct, 8)}%` }}
                />
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                  ₹{entry.price_inr.toLocaleString('en-IN')}
                  <br />
                  <span className="text-gray-400">{new Date(entry.tracked_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-1.5">
          {history.map((entry, i) => (
            <div key={entry.id} className="flex-1 text-center">
              {(i === 0 || i === history.length - 1) && (
                <p className="text-xs text-gray-400 truncate">
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
