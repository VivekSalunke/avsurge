'use client'
import { useState } from 'react'

export default function PriceAlertButton({ phoneId, phoneName, currentPrice }: {
  phoneId: number
  phoneName: string
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

    const res = await fetch('/api/alerts/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone_id: phoneId, target_price: Number(targetPrice) }),
    })

    const data = await res.json()
    if (res.ok) {
      setStatus('success')
      setMessage(`We'll email you when ${phoneName} drops to Rs.${Number(targetPrice).toLocaleString('en-IN')}`)
    } else {
      setStatus('error')
      setMessage(data.error || 'Something went wrong')
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-xl hover:border-blue-300 hover:text-blue-600 transition">
        🔔 Notify me on price drop
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">🔔 Price drop alert</h4>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
      </div>

      {status === 'success' ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✅ {message}
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Your email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Notify me when price drops to (Rs.)
                {currentPrice && <span className="text-gray-400 ml-1">· Current: Rs.{currentPrice.toLocaleString('en-IN')}</span>}
              </label>
              <input
                type="number"
                placeholder="e.g. 45000"
                value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {status === 'error' && (
            <p className="text-red-500 text-xs mb-3">{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={status === 'loading' || !email || !targetPrice}
            className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {status === 'loading' ? 'Setting alert...' : 'Set alert'}
          </button>
        </>
      )}
    </div>
  )
}
