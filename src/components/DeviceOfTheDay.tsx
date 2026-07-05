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

      <div className="relative h-96 sm:h-64">
        {cards.map(({ type, emoji, label, color, bgClass, device, specMap }, i) => {
          const specs = Object.entries(specMap).slice(0, 3)
          const total = cards.length
          const offset = (i - active + total) % total
          const isActive = offset === 0

          let style: React.CSSProperties = {}
          let zIndex = 0

          if (offset === 0) {
            style = { transform: 'translateX(0) translateY(0) scale(1)', opacity: 1 }
            zIndex = 30
          } else if (offset === 1) {
            style = { transform: 'translateX(10px) translateY(6px) scale(0.97)', opacity: 0.7 }
            zIndex = 20
          } else {
            style = { transform: 'translateX(18px) translateY(12px) scale(0.94)', opacity: 0.4 }
            zIndex = 10
          }

          return (
            <div
              key={type}
              onClick={() => !isActive && setActive(i)}
              className={`absolute inset-0 bg-gradient-to-br ${color} rounded-2xl text-white transition-all duration-500 overflow-hidden ${!isActive ? 'cursor-pointer' : ''}`}
              style={{ ...style, zIndex }}
            >
              {isActive ? (
                <div className="flex flex-col sm:flex-row h-full">
                  {/* Left - Image */}
                  <div className={`h-40 sm:h-full sm:w-56 flex-shrink-0 flex items-center justify-center ${bgClass} p-4`}>
                    {device.image_url
                      ? <img src={device.image_url} alt={device.name} className="object-contain w-full h-full drop-shadow-xl" />
                      : <span className="text-8xl">{emoji}</span>}
                  </div>
                  {/* Right - Info */}
                  <div className="flex-1 flex flex-col justify-center px-5 py-4 sm:px-8 sm:py-6">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">{emoji} {label} of the day</p>
                    <p className="text-white/70 text-sm mb-0.5">{device.brand}</p>
                    <h3 className="font-bold text-lg sm:text-2xl leading-tight mb-2">{device.name}</h3>
                    {device.price_inr && (
                      <p className="text-white font-bold text-lg sm:text-xl mb-3">₹{device.price_inr.toLocaleString('en-IN')}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {specs.map(([, value]) => (
                        <span key={value} className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">{value}</span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Link href={`/${type}/${device.slug}`}
                        className="inline-block bg-white text-gray-800 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-white/90 transition">
                        View specs →
                      </Link>
                      <Link href={`/${type}`}
                        className="inline-block bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition">
                        Browse {label}s
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* Stacked - show name at bottom */
                <div className="h-full w-full relative">
                  <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-gradient-to-t from-black/40 to-transparent">
                    <p className="text-white/60 text-xs">{emoji} {label} of the day</p>
                    <p className="text-white font-semibold truncate">{device.name}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {cards.map((c, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-300 ${i === active ? 'w-6 h-2 bg-blue-600' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`} />
        ))}
      </div>
    </div>
  )
}
