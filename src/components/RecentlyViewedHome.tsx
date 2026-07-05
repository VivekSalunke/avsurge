'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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
    loadDevices()
  }, [])

  const loadDevices = async () => {
    const phoneSlugs: string[] = JSON.parse(localStorage.getItem('recently_viewed') || '[]')
    const tabletSlugs: string[] = JSON.parse(localStorage.getItem('recently_viewed_tablets') || '[]')
    const laptopSlugs: string[] = JSON.parse(localStorage.getItem('recently_viewed_laptops') || '[]')

    const all: Device[] = []

    if (phoneSlugs.length > 0) {
      const { data } = await supabase.from('phones').select('id, name, brand, slug, price_inr, image_url').in('slug', phoneSlugs.slice(0, 4))
      const sorted = phoneSlugs.slice(0, 4).map(slug => (data || []).find(p => p.slug === slug)).filter(Boolean)
      all.push(...sorted.map(d => ({ ...d!, type: 'phone' as const })))
    }

    if (tabletSlugs.length > 0) {
      const { data } = await supabase.from('tablets').select('id, name, brand, slug, price_inr, image_url').in('slug', tabletSlugs.slice(0, 2))
      const sorted = tabletSlugs.slice(0, 2).map(slug => (data || []).find(t => t.slug === slug)).filter(Boolean)
      all.push(...sorted.map(d => ({ ...d!, type: 'tablet' as const })))
    }

    if (laptopSlugs.length > 0) {
      const { data } = await supabase.from('laptops').select('id, name, brand, slug, price_inr, image_url').in('slug', laptopSlugs.slice(0, 2))
      const sorted = laptopSlugs.slice(0, 2).map(slug => (data || []).find(l => l.slug === slug)).filter(Boolean)
      all.push(...sorted.map(d => ({ ...d!, type: 'laptop' as const })))
    }

    if (all.length > 0) setDevices(all.slice(0, 6))
  }

  if (devices.length === 0) return null

  const emoji = (type: string) => type === 'phone' ? '📱' : type === 'tablet' ? '📟' : '💻'
  const path = (type: string) => type === 'phone' ? 'phones' : type === 'tablet' ? 'tablets' : 'laptops'

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900">🕐 Recently viewed</h2>
        <button onClick={() => {
          localStorage.removeItem('recently_viewed')
          localStorage.removeItem('recently_viewed_tablets')
          localStorage.removeItem('recently_viewed_laptops')
          setDevices([])
        }} className="text-xs text-gray-400 hover:text-red-500 transition">Clear</button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {devices.map(device => (
          <Link key={`${device.type}-${device.id}`} href={`/${path(device.type)}/${device.slug}`}
            className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:border-blue-400 hover:shadow-sm transition group">
            <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
              {device.image_url
                ? <img src={device.image_url} alt={device.name} className="object-contain w-full h-full" />
                : <span className="text-3xl">{emoji(device.type)}</span>}
            </div>
            <p className="text-xs text-gray-400 mb-0.5">{device.brand}</p>
            <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2 leading-tight">{device.name}</p>
            {device.price_inr && (
              <p className="text-xs text-blue-600 font-medium mt-1">₹{device.price_inr.toLocaleString('en-IN')}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
