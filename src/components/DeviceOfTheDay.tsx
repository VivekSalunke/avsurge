'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DeviceCard {
  type: string
  emoji: string
  label: string
  color: string
  bgClass: string
  device: any
  specMap: Record<string, string>
}

export default function DeviceOfTheDay({ cards }: { cards: DeviceCard[] }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % cards.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [cards.length])

  if (!cards || cards.length === 0) return null

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900">⭐ Featured today</h2>
        <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>

      <div className="relative h-96">
        {cards.map(({ type, emoji, label, color, bgClass, device, specMap }, i) => {
          const specs = Object.entries(specMap).slice(0, 3)
          const total = cards.length
          const offset = (i - active + total) % total

          // Stack positioning
          let style: React.CSSProperties = {}
          let zIndex = 0
          let isActive = offset === 0

          if (offset === 0) {
            // Active card - front
            style = { transform: 'translateX(0) scale(1)', opacity: 1 }
            zIndex = 30
          } else if (offset === 1) {
            // Next card - slightly behind right
            style = { transform: 'translateX(12px) scale(0.97)', opacity: 0.85 }
            zIndex = 20
          } else {
            // Further cards - more behind
            style = { transform: 'translateX(22px) scale(0.94)', opacity: 0.6 }
            zIndex = 10
          }

          return (
            <div
              key={type}
              onClick={() => !isActive && setActive(i)}
              className={`absolute inset-0 bg-gradient-to-br ${color} rounded-2xl text-white transition-all duration-500 ${!isActive ? 'cursor-pointer' : ''}`}
              style={{ ...style, zIndex }}
            >
              {isActive ? (
                /* Active card - full content */
                <div className="flex gap-5 items-center h-full px-6 py-5">
                  <div className={`w-48 h-48 ${bgClass} rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                    {device.image_url
                      ? <img src={device.image_url} alt={device.name} className="object-contain w-full h-full p-2" />
                      : <span className="text-6xl">{emoji}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">{emoji} {label} of the day</p>
                    <p className="text-white/70 text-xs mb-0.5">{device.brand}</p>
                    <p className="font-bold text-xl leading-tight mb-1">{device.name}</p>
                    {device.price_inr && (
                      <p className="text-white font-bold text-lg mb-3">₹{device.price_inr.toLocaleString('en-IN')}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {specs.map(([, value]) => (
                        <span key={value} className="text-xs bg-white/20 px-2.5 py-1 rounded-full">{value}</span>
                      ))}
                    </div>
                    <Link href={`/${type}/${device.slug}`}
                      className="inline-block bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
                      View specs →
                    </Link>
                  </div>
                </div>
              ) : (
                /* Stacked card - show label and device name at bottom corner */
                <div className="h-full w-full relative rounded-2xl overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-black/20">
                    <p className="text-white/60 text-xs">{emoji} {label} of the day</p>
                    <p className="text-white font-semibold text-sm truncate">{device.name}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {cards.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-300 ${i === active ? 'w-6 h-2 bg-blue-600' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`} />
        ))}
      </div>
    </div>
  )
}
