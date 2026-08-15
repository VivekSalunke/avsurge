'use client'
import { useState } from 'react'
import { formatPriceINR } from '@/lib/format'
export default function LaptopPriceAlertButton({ laptopId, laptopName, currentPrice }: {
  laptopId: number
  laptopName: string
  currentPrice: number | null
}) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [targetPrice, setTargetPrice] = useState(currentPrice ? Math.floor(currentPrice * 0.9) : '')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const handleSubmit = async () => {
    if (!email || !targetPrice) return
    setStatus('loading')
    const res = await fetch('/api/alerts/laptop-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, laptop_id: laptopId, target_price: Number(targetPrice) }),
    })
    const data = await res.json()
    if (res.ok) {
      setStatus('success')
      setMessage(`We'll email you when ${laptopName} drops to ₹${Number(targetPrice).toLocaleString('en-IN')}`)
    } else {
      setStatus('error')
      setMessage(data.error || 'Something went wrong')
    }
  }
  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-1.5 border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.85)] text-sm font-medium px-4 py-2.5 rounded-xl hover:border-neon-cyan hover:text-neon-cyan transition">
        🔔 Notify me on price drop
      </button>
    )
  }
  return (
    <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 mt-2 neon-border">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-white">🔔 Price drop alert</h4>
        <button onClick={() => setOpen(false)} className="text-dim hover:text-white text-lg">×</button>
      </div>
      {status === 'success' ? (
        <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] text-green-400 rounded-xl px-4 py-3 text-sm">
          ✅ {message}
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs text-dim mb-1 block">Your email</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan price-alert-input" />
            </div>
            <div>
              <label className="text-xs text-dim mb-1 block">
                Notify me when price drops to (₹)
                {currentPrice && <span className="text-[rgba(255,255,255,0.4)] ml-1">· Current: {formatPriceINR(currentPrice)}</span>}
              </label>
              <input type="number" placeholder="e.g. 80000" value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
                className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan price-alert-input" />
            </div>
          </div>
          {status === 'error' && <p className="text-red-400 text-xs mb-3">{message}</p>}
          <button onClick={handleSubmit}
            disabled={status === 'loading' || !email || !targetPrice}
            className="w-full bg-gradient-to-r from-neon-violet to-neon-cyan text-black rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50">
            {status === 'loading' ? 'Setting alert...' : 'Set alert'}
          </button>
        </>
      )}
    </div>
  )
}
