'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatPriceINR } from '@/lib/format'

interface Device {
  id: number
  name: string
  brand: string
  slug: string
  price_inr: number | null
  image_url: string | null
  type: 'phone' | 'tablet' | 'laptop'
}

export default function RecentlyViewedHome() {
  const [devices, setDevices] = useState<Device[]>([])

  useEffect(() => {
    let cancelled = false
    const phoneSlugs: string[] = JSON.parse(localStorage.getItem('recently_viewed') || '[]')
    const tabletSlugs: string[] = JSON.parse(localStorage.getItem('recently_viewed_tablets') || '[]')
    const laptopSlugs: string[] = JSON.parse(localStorage.getItem('recently_viewed_laptops') || '[]')

    const pick = (slugs: string[], limit: number, rows: unknown) =>
      slugs.slice(0, limit)
        .map(slug => ((rows || []) as Device[]).find(d => d.slug === slug))
        .filter((d): d is Device => Boolean(d))

    const jobs: Promise<Device[]>[] = []

    if (phoneSlugs.length > 0) {
      jobs.push(
        (async () => {
          const { data } = await supabase.from('phones').select('id, name, brand, slug, price_inr, image_url').in('slug', phoneSlugs.slice(0, 4))
          return pick(phoneSlugs, 4, data).map(d => ({ ...d, type: 'phone' as const }))
        })()
      )
    }

    if (tabletSlugs.length > 0) {
      jobs.push(
        (async () => {
          const { data } = await supabase.from('tablets').select('id, name, brand, slug, price_inr, image_url').in('slug', tabletSlugs.slice(0, 2))
          return pick(tabletSlugs, 2, data).map(d => ({ ...d, type: 'tablet' as const }))
        })()
      )
    }

    if (laptopSlugs.length > 0) {
      jobs.push(
        (async () => {
          const { data } = await supabase.from('laptops').select('id, name, brand, slug, price_inr, image_url').in('slug', laptopSlugs.slice(0, 2))
          return pick(laptopSlugs, 2, data).map(d => ({ ...d, type: 'laptop' as const }))
        })()
      )
    }

    Promise.all(jobs).then(groups => {
      if (cancelled) return
      const all = groups.flat()
      if (all.length > 0) setDevices(all.slice(0, 6))
    })

    return () => { cancelled = true }
  }, [])

  if (devices.length === 0) return null

  const emoji = (type: string) => type === 'phone' ? '📱' : type === 'tablet' ? '📟' : '💻'
  const path = (type: string) => type === 'phone' ? 'phones' : type === 'tablet' ? 'tablets' : 'laptops'

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-white">🕐 Recently viewed</h2>
        <button onClick={() => {
          localStorage.removeItem('recently_viewed')
          localStorage.removeItem('recently_viewed_tablets')
          localStorage.removeItem('recently_viewed_laptops')
          setDevices([])
        }} className="text-xs text-dim hover:text-red-400 transition">Clear</button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {devices.map(device => (
          <Link key={`${device.type}-${device.id}`} href={`/${path(device.type)}/${device.slug}`}
            className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-xl p-3 text-center hover:border-neon-cyan hover:glow transition group">
            <div className="w-full aspect-square bg-[rgba(255,255,255,0.02)] rounded-lg flex items-center justify-center mb-2 overflow-hidden relative">
              {device.image_url
                ? <Image src={device.image_url} alt={device.name} fill sizes="(max-width: 640px) 33vw, 17vw" className="object-contain w-full h-full" />
                : <span className="text-3xl">{emoji(device.type)}</span>}
            </div>
            <p className="text-xs text-dim mb-0.5">{device.brand}</p>
            <p className="text-xs font-semibold text-white group-hover:text-neon-cyan transition line-clamp-2 leading-tight">{device.name}</p>
            {device.price_inr && (
              <p className="text-xs text-neon-cyan font-medium mt-1">{formatPriceINR(device.price_inr)}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
