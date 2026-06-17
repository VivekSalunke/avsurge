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
  const [debug, setDebug] = useState('')

  useEffect(() => { fetchHistory() }, [phoneId])

  const fetchHistory = async () => {
    setDebug(`Fetching for phoneId: ${phoneId}`)
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('phone_id', phoneId)
      .order('tracked_at', { ascending: true })
    setDebug(`phoneId: ${phoneId} | data: ${JSON.stringify(data)} | error: ${JSON.stringify(error)}`)
    if (!error && data) setHistory(data)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-xs text-gray-400 mb-2">Debug: {debug}</p>
      {history.length === 0 ? (
        <p className="text-sm text-gray-400">No price history found</p>
      ) : (
        <p className="text-sm text-green-600">{history.length} price entries found</p>
      )}
    </div>
  )
}
