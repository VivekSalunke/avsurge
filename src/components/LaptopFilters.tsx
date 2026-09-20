'use client'

import { useMemo, useState } from 'react'
import DeviceCard from '@/components/DeviceCard'

interface LaptopDevice {
  id: string | number
  slug: string
  name: string
  brand: string | null
  price_inr: number | null
  image_url?: string | null
  created_at?: string | null
  view_count?: number | null
  score?: number | null
  ramGB?: number | null
  storageGB?: number | null
  processorRaw?: string | null
}

type PriceFilter =
  | 'all'
  | 'under-30000'
  | '30000-50000'
  | '50000-70000'
  | '70000-100000'
  | '100000-150000'
  | 'above-150000'

type RamFilter = 'all' | '4' | '8' | '16' | '32'
type StorageFilter = 'all' | '128' | '256' | '512' | '1000'
type ProcessorFilter = 'all' | 'intel' | 'amd' | 'apple'

type SortKey =
  | 'popular'
  | 'newest'
  | 'score-high'
  | 'price-low'
  | 'price-high'
  | 'name-az'
  | 'name-za'

const PRICE_OPTIONS: { value: PriceFilter; label: string }[] = [
  { value: 'all', label: 'All prices' },
  { value: 'under-30000', label: 'Under ₹30,000' },
  { value: '30000-50000', label: '₹30,000 – ₹50,000' },
  { value: '50000-70000', label: '₹50,000 – ₹70,000' },
  { value: '70000-100000', label: '₹70,000 – ₹1L' },
  { value: '100000-150000', label: '₹1L – ₹1.5L' },
  { value: 'above-150000', label: 'Above ₹1.5L' },
]

const RAM_OPTIONS: { value: RamFilter; label: string }[] = [
  { value: 'all', label: 'All RAM' },
  { value: '4', label: '4GB+' },
  { value: '8', label: '8GB+' },
  { value: '16', label: '16GB+' },
  { value: '32', label: '32GB+' },
]

const STORAGE_OPTIONS: { value: StorageFilter; label: string }[] = [
  { value: 'all', label: 'All storage' },
  { value: '128', label: '128GB+' },
  { value: '256', label: '256GB+' },
  { value: '512', label: '512GB+' },
  { value: '1000', label: '1TB+' },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'score-high', label: 'Spec Score: High to Low' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-az', label: 'Name: A–Z' },
  { value: 'name-za', label: 'Name: Z–A' },
]

function matchesPrice(price: number | null, filter: PriceFilter): boolean {
  if (filter === 'all') return true
  if (price === null) return false
  switch (filter) {
    case 'under-30000': return price < 30000
    case '30000-50000': return price >= 30000 && price < 50000
    case '50000-70000': return price >= 50000 && price < 70000
    case '70000-100000': return price >= 70000 && price < 100000
    case '100000-150000': return price >= 100000 && price < 150000
    case 'above-150000': return price >= 150000
    default: return true
  }
}

function matchesRam(ramGB: number | null | undefined, filter: RamFilter): boolean {
  if (filter === 'all') return true
  if (ramGB === null || ramGB === undefined) return false
  return ramGB >= Number(filter)
}

function matchesStorage(storageGB: number | null | undefined, filter: StorageFilter): boolean {
  if (filter === 'all') return true
  if (storageGB === null || storageGB === undefined) return false
  return storageGB >= Number(filter)
}

function matchesProcessor(processorRaw: string | null | undefined, filter: ProcessorFilter): boolean {
  if (filter === 'all') return true
  if (!processorRaw) return false
  const p = processorRaw.toLowerCase()
  if (filter === 'intel') return p.includes('intel') || p.includes('core')
  if (filter === 'amd') return p.includes('amd') || p.includes('ryzen')
  if (filter === 'apple') return p.includes('apple') || /\bm[1-4]\b/.test(p)
  return true
}

export default function LaptopFilters({ devices }: { devices: LaptopDevice[] }) {
  const [search, setSearch] = useState('')
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [ramFilter, setRamFilter] = useState<RamFilter>('all')
  const [storageFilter, setStorageFilter] = useState<StorageFilter>('all')
  const [processorFilter, setProcessorFilter] = useState<ProcessorFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('popular')

  const filteredDevices = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()

    const result = devices.filter((laptop) => {
      const matchesSearch =
        !searchTerm ||
        laptop.name.toLowerCase().includes(searchTerm) ||
        (laptop.brand || '').toLowerCase().includes(searchTerm)

      if (!matchesSearch) return false
      if (!matchesPrice(laptop.price_inr, priceFilter)) return false
      if (!matchesRam(laptop.ramGB, ramFilter)) return false
      if (!matchesStorage(laptop.storageGB, storageFilter)) return false
      if (!matchesProcessor(laptop.processorRaw, processorFilter)) return false
      return true
    })

    return result.sort((a, b) => {
      switch (sortKey) {
        case 'score-high':
          return (b.score ?? -Infinity) - (a.score ?? -Infinity)
        case 'price-low':
          return (a.price_inr ?? Infinity) - (b.price_inr ?? Infinity)
        case 'price-high':
          return (b.price_inr ?? -Infinity) - (a.price_inr ?? -Infinity)
        case 'name-az':
          return a.name.localeCompare(b.name)
        case 'name-za':
          return b.name.localeCompare(a.name)
        case 'newest':
          return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
        case 'popular':
        default:
          return (b.view_count ?? 0) - (a.view_count ?? 0)
      }
    })
  }, [devices, search, priceFilter, ramFilter, storageFilter, processorFilter, sortKey])

  const hasFilters =
    search.trim() !== '' ||
    priceFilter !== 'all' ||
    ramFilter !== 'all' ||
    storageFilter !== 'all' ||
    processorFilter !== 'all' ||
    sortKey !== 'popular'

  function clearFilters() {
    setSearch('')
    setPriceFilter('all')
    setRamFilter('all')
    setStorageFilter('all')
    setProcessorFilter('all')
    setSortKey('popular')
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="laptop-search" className="sr-only">Search laptops</label>
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-dim">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <path d="m20 20-4-4" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <input
            id="laptop-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by laptop name or brand..."
            className="h-12 w-full rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] pl-12 pr-4 text-sm text-[var(--muted)] outline-none transition placeholder:text-[rgba(255,255,255,0.35)] focus:border-neon-cyan focus:ring-2 focus:ring-[rgba(6,182,212,0.2)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.65)]">💰 Price</label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
              className="w-full h-10 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] px-3 text-sm text-[var(--muted)] outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-[rgba(6,182,212,0.2)]"
            >
              {PRICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.65)]">🧠 RAM</label>
            <select
              value={ramFilter}
              onChange={(e) => setRamFilter(e.target.value as RamFilter)}
              className="w-full h-10 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] px-3 text-sm text-[var(--muted)] outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-[rgba(6,182,212,0.2)]"
            >
              {RAM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.65)]">💾 Storage</label>
            <select
              value={storageFilter}
              onChange={(e) => setStorageFilter(e.target.value as StorageFilter)}
              className="w-full h-10 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] px-3 text-sm text-[var(--muted)] outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-[rgba(6,182,212,0.2)]"
            >
              {STORAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.65)]">⚙️ Processor</label>
            <select
              value={processorFilter}
              onChange={(e) => setProcessorFilter(e.target.value as ProcessorFilter)}
              className="w-full h-10 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] px-3 text-sm text-[var(--muted)] outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-[rgba(6,182,212,0.2)]"
            >
              <option value="all">All processors</option>
              <option value="intel">Intel</option>
              <option value="amd">AMD</option>
              <option value="apple">Apple Silicon</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.65)]">🔢 Sort by</label>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="w-full h-10 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] px-3 text-sm text-[var(--muted)] outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-[rgba(6,182,212,0.2)]"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[rgba(255,255,255,0.6)]">
            Showing <span className="font-bold text-white">{filteredDevices.length}</span> of{' '}
            <span className="font-bold text-white">{devices.length}</span> laptops
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 text-sm font-medium text-neon-cyan transition hover:text-neon-cyan/80 hover:underline"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredDevices.map((laptop) => (
            <DeviceCard
              key={laptop.id}
              device={{
                id: laptop.id,
                slug: laptop.slug,
                name: laptop.name,
                brand: laptop.brand ?? 'Unknown',
                price_inr: laptop.price_inr,
                image_url: laptop.image_url ?? null,
              }}
              type="laptop"
              score={laptop.score ?? null}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] py-24 text-center">
          <div className="text-6xl">🔎</div>
          <p className="mt-6 text-lg font-semibold text-white">No laptops found</p>
          <p className="mt-2 text-sm text-[rgba(255,255,255,0.55)]">Try adjusting your filters or search term</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-violet px-6 py-2.5 text-sm font-medium text-black transition hover:opacity-95 active:scale-95 shadow-glow"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            Reset filters
          </button>
        </div>
      )}
    </div>
  )
}
