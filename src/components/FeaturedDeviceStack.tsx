'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatPriceINR } from '@/lib/format'

export interface FeaturedDevice {
  id: number
  name: string
  brand: string
  slug: string
  price_inr: number | null
  image_url: string | null
  type: 'phones' | 'tablets' | 'laptops'
}

const TYPE_EMOJI: Record<string, string> = {
  phones: '📱',
  tablets: '📟',
  laptops: '💻',
}

export default function FeaturedDeviceStack({ devices }: { devices: FeaturedDevice[] }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (devices.length < 2) return
    const timer = setInterval(() => setActive(prev => (prev + 1) % devices.length), 4000)
    return () => clearInterval(timer)
  }, [devices.length])

  if (!devices || devices.length === 0) return null

  const total = devices.length

  return (
    <div>
      <div className="relative h-96 sm:h-[28rem]">
        {devices.map((device, i) => {
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
              key={device.id}
              onClick={() => !isActive && setActive(i)}
              className={`absolute inset-0 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0d0d10] shadow-2xl shadow-black/50 transition-all duration-500 ${!isActive ? 'cursor-pointer' : ''}`}
              style={{ ...style, zIndex }}
            >
              {isActive ? (
                <div className="relative h-full w-full">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(139,92,246,0.1),transparent_60%)]" />
                  <div className="flex h-full w-full items-center justify-center p-6">
                    {device.image_url
                      ? <img src={device.image_url} alt={device.name} className="h-full w-full object-contain drop-shadow-xl" />
                      : <span className="text-8xl opacity-70">{TYPE_EMOJI[device.type]}</span>}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-[75%]">
                    <div className="rounded-xl border border-[rgba(255,255,255,0.09)] bg-[rgba(10,10,12,0.82)] p-3.5 shadow-2xl shadow-black/40 backdrop-blur-md">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neon-cyan">{device.brand}</p>
                      <h3 className="mt-0.5 line-clamp-1 text-sm font-bold text-white">{device.name}</h3>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        {device.price_inr ? (
                          <p className="text-sm font-bold text-white">{formatPriceINR(device.price_inr)}</p>
                        ) : (
                          <p className="text-xs text-dim">Price on request</p>
                        )}
                        <Link href={`/${device.type}/${device.slug}`}
                          className="flex-shrink-0 rounded-lg bg-gradient-to-r from-neon-violet to-neon-cyan px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all duration-200 hover:brightness-110">
                          View specs
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-full w-full">
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-5 py-4">
                    <p className="text-xs text-white/60">{device.brand}</p>
                    <p className="truncate text-sm font-semibold text-white">{device.name}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {devices.map((device, i) => (
          <button key={device.id} onClick={() => setActive(i)} aria-label={`Show ${device.name}`}
            className={`rounded-full transition-all duration-300 ${i === active ? 'h-2 w-6 bg-neon-cyan' : 'h-2 w-2 bg-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.5)]'}`} />
        ))}
      </div>
    </div>
  )
}
