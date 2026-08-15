'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatPriceINR } from '@/lib/format'

type SortKey = 'price-low' | 'price-high' | 'name-az' | 'name-za' | 'newest' | 'popular'

interface Device {
  id: number
  slug: string
  name: string
  price_inr: number | null
  image_url?: string | null
  view_count?: number | null
  created_at?: string | null
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'Most Popular' },
  { key: 'price-low', label: 'Price: Low to High' },
  { key: 'price-high', label: 'Price: High to Low' },
  { key: 'newest', label: 'Newest First' },
  { key: 'name-az', label: 'Name: A-Z' },
  { key: 'name-za', label: 'Name: Z-A' },
]

function sortDevices(devices: Device[], sortKey: SortKey): Device[] {
  const copy = [...devices]
  switch (sortKey) {
    case 'price-low':
      return copy.sort((a, b) => (a.price_inr ?? Infinity) - (b.price_inr ?? Infinity))
    case 'price-high':
      return copy.sort((a, b) => (b.price_inr ?? -Infinity) - (a.price_inr ?? -Infinity))
    case 'name-az':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-za':
      return copy.sort((a, b) => b.name.localeCompare(a.name))
    case 'newest':
      return copy.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    case 'popular':
    default:
      return copy.sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
  }
}

export default function SortableDeviceGrid({
  devices,
  basePath,
  fallbackIcon,
}: {
  devices: Device[]
  basePath: 'phones' | 'tablets' | 'laptops'
  fallbackIcon: string
}) {
  const [sortKey, setSortKey] = useState<SortKey>('popular')

  const sorted = useMemo(() => sortDevices(devices, sortKey), [devices, sortKey])

  return (
    <div className="text-[var(--text)]">
      <div className="flex justify-end mb-4">
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="text-sm border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-1.5 text-[rgba(255,255,255,0.85)] bg-[var(--card-bg)] hover:border-neon-cyan transition focus:outline-none focus:ring-2 focus:ring-[rgba(6,182,212,0.15)]"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sorted.map(device => (
          <Link key={device.id} href={`/${basePath}/${device.slug}`}
            className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 text-center hover:border-neon-cyan transition group">
            <div className="w-full aspect-square bg-[rgba(255,255,255,0.02)] rounded-lg flex items-center justify-center mb-3 overflow-hidden">
              {device.image_url
                ? <img src={device.image_url} alt={device.name} className="object-contain w-full h-full" />
                : <span className="text-4xl">{fallbackIcon}</span>}
            </div>
            <p className="text-sm font-semibold text-white leading-tight group-hover:text-neon-cyan transition line-clamp-2">{device.name}</p>
            {device.price_inr && (
              <p className="text-xs text-neon-cyan font-medium mt-1">{formatPriceINR(device.price_inr)}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
