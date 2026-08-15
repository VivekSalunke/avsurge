'use client'

import { useMemo, useState } from 'react'
import DeviceCard from '@/components/DeviceCard'

interface PhoneDevice {
  id: string | number
  slug: string
  name: string
  brand: string | null
  price_inr: number | null
  image_url?: string | null
  created_at?: string | null
  view_count?: number | null
  spec_score_override?: number | null
  score?: number | null
  ramGB?: number | null
  storageGB?: number | null
  supports5G?: boolean
  supports4G?: boolean
}

type PriceFilter =
  | 'all'
  | 'under-15000'
  | '15000-25000'
  | '25000-40000'
  | '40000-60000'
  | 'above-60000'

type RamFilter =
  | 'all'
  | '4'
  | '6'
  | '8'
  | '12'
  | '16'

type StorageFilter =
  | 'all'
  | '64'
  | '128'
  | '256'
  | '512'

type NetworkFilter = 'all' | '5g' | '4g'

type SortKey =
  | 'popular'
  | 'newest'
  | 'score-high'
  | 'price-low'
  | 'price-high'
  | 'name-az'
  | 'name-za'

const PRICE_OPTIONS: {
  value: PriceFilter
  label: string
}[] = [
  { value: 'all', label: 'All prices' },
  { value: 'under-15000', label: 'Under ₹15,000' },
  { value: '15000-25000', label: '₹15,000 – ₹25,000' },
  { value: '25000-40000', label: '₹25,000 – ₹40,000' },
  { value: '40000-60000', label: '₹40,000 – ₹60,000' },
  { value: 'above-60000', label: 'Above ₹60,000' },
]

const RAM_OPTIONS: {
  value: RamFilter
  label: string
}[] = [
  { value: 'all', label: 'All RAM' },
  { value: '4', label: '4GB+' },
  { value: '6', label: '6GB+' },
  { value: '8', label: '8GB+' },
  { value: '12', label: '12GB+' },
  { value: '16', label: '16GB+' },
]

const STORAGE_OPTIONS: {
  value: StorageFilter
  label: string
}[] = [
  { value: 'all', label: 'All storage' },
  { value: '64', label: '64GB+' },
  { value: '128', label: '128GB+' },
  { value: '256', label: '256GB+' },
  { value: '512', label: '512GB+' },
]

const SORT_OPTIONS: {
  value: SortKey
  label: string
}[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'score-high', label: 'Spec Score: High to Low' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-az', label: 'Name: A–Z' },
  { value: 'name-za', label: 'Name: Z–A' },
]

function matchesPrice(
  price: number | null,
  filter: PriceFilter
): boolean {
  if (filter === 'all') return true
  if (price === null) return false

  switch (filter) {
    case 'under-15000':
      return price < 15000

    case '15000-25000':
      return price >= 15000 && price < 25000

    case '25000-40000':
      return price >= 25000 && price < 40000

    case '40000-60000':
      return price >= 40000 && price < 60000

    case 'above-60000':
      return price >= 60000

    default:
      return true
  }
}

function matchesRam(
  ramGB: number | null | undefined,
  filter: RamFilter
): boolean {
  if (filter === 'all') return true
  if (ramGB === null || ramGB === undefined) return false

  return ramGB >= Number(filter)
}

function matchesStorage(
  storageGB: number | null | undefined,
  filter: StorageFilter
): boolean {
  if (filter === 'all') return true
  if (storageGB === null || storageGB === undefined) return false

  return storageGB >= Number(filter)
}

function matchesNetwork(
  phone: PhoneDevice,
  filter: NetworkFilter
): boolean {
  if (filter === 'all') return true

  if (filter === '5g') {
    return phone.supports5G === true
  }

  if (filter === '4g') {
    return phone.supports4G === true
  }

  return true
}

export default function PhoneFilters({
  devices,
}: {
  devices: PhoneDevice[]
}) {
  const [search, setSearch] = useState('')
  const [priceFilter, setPriceFilter] =
    useState<PriceFilter>('all')
  const [ramFilter, setRamFilter] =
    useState<RamFilter>('all')
  const [storageFilter, setStorageFilter] =
    useState<StorageFilter>('all')
  const [networkFilter, setNetworkFilter] =
    useState<NetworkFilter>('all')
  const [sortKey, setSortKey] =
    useState<SortKey>('popular')

  const filteredDevices = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()

    const result = devices.filter((phone) => {
      const matchesSearch =
        !searchTerm ||
        phone.name.toLowerCase().includes(searchTerm) ||
        (phone.brand || '')
          .toLowerCase()
          .includes(searchTerm)

      if (!matchesSearch) return false

      if (!matchesPrice(phone.price_inr, priceFilter)) {
        return false
      }

      if (!matchesRam(phone.ramGB, ramFilter)) {
        return false
      }

      if (
        !matchesStorage(
          phone.storageGB,
          storageFilter
        )
      ) {
        return false
      }

      if (!matchesNetwork(phone, networkFilter)) {
        return false
      }

      return true
    })

    return result.sort((a, b) => {
      switch (sortKey) {
        case 'score-high':
          return (
            (b.score ?? -Infinity) -
            (a.score ?? -Infinity)
          )

        case 'price-low':
          return (
            (a.price_inr ?? Infinity) -
            (b.price_inr ?? Infinity)
          )

        case 'price-high':
          return (
            (b.price_inr ?? -Infinity) -
            (a.price_inr ?? -Infinity)
          )

        case 'name-az':
          return a.name.localeCompare(b.name)

        case 'name-za':
          return b.name.localeCompare(a.name)

        case 'newest':
          return (
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
          )

        case 'popular':
        default:
          return (
            (b.view_count ?? 0) -
            (a.view_count ?? 0)
          )
      }
    })
  }, [
    devices,
    search,
    priceFilter,
    ramFilter,
    storageFilter,
    networkFilter,
    sortKey,
  ])

  const hasFilters =
    search.trim() !== '' ||
    priceFilter !== 'all' ||
    ramFilter !== 'all' ||
    storageFilter !== 'all' ||
    networkFilter !== 'all' ||
    sortKey !== 'popular'

  function clearFilters() {
    setSearch('')
    setPriceFilter('all')
    setRamFilter('all')
    setStorageFilter('all')
    setNetworkFilter('all')
    setSortKey('popular')
  }

  return (
    <div className="space-y-8">
      {/* FILTER SECTION */}
      <div className="space-y-4">
        {/* SEARCH */}
        <div className="relative">
          <label
            htmlFor="phone-search"
            className="sr-only"
          >
            Search phones
          </label>

          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                strokeWidth="2"
              />
              <path
                d="m20 20-4-4"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <input
            id="phone-search"
            type="search"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by phone name or brand..."
            className="h-12 w-full rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] pl-12 pr-4 text-sm text-[var(--muted)] outline-none transition placeholder:text-[rgba(255,255,255,0.35)] focus:border-neon-cyan focus:ring-2 focus:ring-[rgba(6,182,212,0.2)]"
          />
        </div>

        {/* FILTER GRID */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {/* PRICE */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.65)]">
              💰 Price
            </label>
            <select
              value={priceFilter}
              onChange={(e) =>
                setPriceFilter(
                  e.target.value as PriceFilter
                )
              }
              className="w-full h-10 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] px-3 text-sm text-[var(--muted)] outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-[rgba(6,182,212,0.2)]"
            >
              {PRICE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* RAM */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.65)]">
              🧠 RAM
            </label>
            <select
              value={ramFilter}
              onChange={(e) =>
                setRamFilter(
                  e.target.value as RamFilter
                )
              }
              className="w-full h-10 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] px-3 text-sm text-[var(--muted)] outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-[rgba(6,182,212,0.2)]"
            >
              {RAM_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* STORAGE */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.65)]">
              💾 Storage
            </label>
            <select
              value={storageFilter}
              onChange={(e) =>
                setStorageFilter(
                  e.target.value as StorageFilter
                )
              }
              className="w-full h-10 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] px-3 text-sm text-[var(--muted)] outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-[rgba(6,182,212,0.2)]"
            >
              {STORAGE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* NETWORK */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.65)]">
              📡 Network
            </label>
            <select
              value={networkFilter}
              onChange={(e) =>
                setNetworkFilter(
                  e.target.value as NetworkFilter
                )
              }
              className="w-full h-10 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] px-3 text-sm text-[var(--muted)] outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-[rgba(6,182,212,0.2)]"
            >
              <option value="all">
                All networks
              </option>
              <option value="5g">
                5G phones
              </option>
              <option value="4g">
                4G phones
              </option>
            </select>
          </div>

          {/* SORT */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.65)]">
              🔢 Sort by
            </label>
            <select
              value={sortKey}
              onChange={(e) =>
                setSortKey(
                  e.target.value as SortKey
                )
              }
              className="w-full h-10 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] px-3 text-sm text-[var(--muted)] outline-none transition focus:border-neon-cyan focus:ring-2 focus:ring-[rgba(6,182,212,0.2)]"
            >
              {SORT_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RESULTS INFO & ACTIONS */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[rgba(255,255,255,0.6)]">
            Showing{' '}
            <span className="font-bold text-white">
              {filteredDevices.length}
            </span>{' '}
            of{' '}
            <span className="font-bold text-white">
              {devices.length}
            </span>{' '}
            phones
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 text-sm font-medium text-neon-cyan transition hover:text-neon-cyan/80 hover:underline"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* RESULTS GRID */}
      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredDevices.map((phone) => (
            <DeviceCard
              key={phone.id}
              device={{
                id: phone.id,
                slug: phone.slug,
                name: phone.name,
                brand: phone.brand ?? 'Unknown',
                price_inr: phone.price_inr,
                image_url: phone.image_url ?? null,
              }}
              type="phone"
              score={phone.score ?? null}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] py-24 text-center">
          <div className="text-6xl">
            🔎
          </div>

          <p className="mt-6 text-lg font-semibold text-white">
            No phones found
          </p>

          <p className="mt-2 text-sm text-[rgba(255,255,255,0.55)]">
            Try adjusting your filters or search term
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-violet px-6 py-2.5 text-sm font-medium text-black transition hover:opacity-95 active:scale-95 shadow-glow"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            Reset filters
          </button>
        </div>
      )}
    </div>
  )
}
