'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatPriceINR } from '@/lib/format'

type Type = 'all' | 'phone' | 'tablet' | 'laptop'

type Entry = {
  id: number
  type: 'phone' | 'tablet' | 'laptop'
  price_inr: number
  store: string
  tracked_at: string
  name: string
  slug: string
}

const TYPE_ICON: Record<string, string> = { phone: '📱', tablet: '📟', laptop: '💻' }
const VIEW_PATH: Record<string, string> = { phone: '/phones/', tablet: '/tablets/', laptop: '/laptops/' }

const LIMIT = 100

export default function AdminPriceHistory() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState<Type>('all')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchEntries()
  }, [type])

  const fetchEntries = async () => {
    setLoading(true)
    const fetchFor = async (table: string, deviceType: 'phone' | 'tablet' | 'laptop', deviceTable: string) => {
      const { data } = await supabase
        .from(table)
        .select(`id, price_inr, store, tracked_at, ${deviceTable}(name, slug)`)
        .order('tracked_at', { ascending: false })
        .limit(LIMIT)
      return (data || []).map((row: any) => ({
        id: row.id,
        type: deviceType,
        price_inr: row.price_inr,
        store: row.store || 'Amazon',
        tracked_at: row.tracked_at,
        name: row[deviceTable]?.name || 'Unknown device',
        slug: row[deviceTable]?.slug || '',
      }))
    }

    const jobs: Promise<Entry[]>[] = []
    if (type !== 'tablet') jobs.push(fetchFor('price_history', 'phone', 'phones'))
    if (type !== 'laptop') jobs.push(fetchFor('tablet_price_history', 'tablet', 'tablets'))
    if (type !== 'phone') jobs.push(fetchFor('laptop_price_history', 'laptop', 'laptops'))

    const all = (await Promise.all(jobs)).flat().sort((a, b) => b.tracked_at.localeCompare(a.tracked_at)).slice(0, LIMIT)
    setEntries(all)
    setLoading(false)
  }

  const remove = async (entry: Entry) => {
    if (!confirm(`Delete this ${entry.type} price record for ${entry.name}?`)) return
    setDeleting(`${entry.type}-${entry.id}`)
    const table = entry.type === 'phone' ? 'price_history' : entry.type === 'tablet' ? 'tablet_price_history' : 'laptop_price_history'
    await supabase.from(table).delete().eq('id', entry.id)
    setEntries(prev => prev.filter(e => !(e.type === entry.type && e.id === entry.id)))
    setDeleting(null)
  }

  const filtered = entries.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))

  const TABS: { id: Type; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'phone', label: '📱 Phones' },
    { id: 'tablet', label: '📟 Tablets' },
    { id: 'laptop', label: '💻 Laptops' },
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-[var(--text)]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Price History</h1>
          <p className="text-sm text-[rgba(255,255,255,0.4)]">Latest tracked prices across all devices</p>
        </div>
        <Link href="/admin" className="text-sm text-dim hover:text-white px-3 py-2">← Admin</Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--panel)] p-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setType(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${type === tab.id ? 'bg-gradient-to-r from-neon-cyan to-neon-violet text-black' : 'text-dim hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by device name..."
          className="flex-1 min-w-56 rounded-xl border border-[rgba(255,255,255,0.06)] px-4 py-2 text-sm outline-none transition focus:border-neon-violet"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] py-16 text-center">
          <p className="text-sm text-[rgba(255,255,255,0.4)]">No price records found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)]">
          {filtered.map((e, i) => (
            <div key={`${e.type}-${e.id}`} className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 ${i !== filtered.length - 1 ? 'border-b border-[rgba(255,255,255,0.04)]' : ''}`}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-lg">{TYPE_ICON[e.type]}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{e.name}</p>
                  <p className="text-xs text-dim">
                    {new Date(e.tracked_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {e.store}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-neon-cyan">{formatPriceINR(e.price_inr)}</span>
                <Link href={VIEW_PATH[e.type] + e.slug} target="_blank"
                  className="text-xs text-dim border border-[rgba(255,255,255,0.06)] px-3 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition">
                  View
                </Link>
                <button onClick={() => remove(e)} disabled={deleting === `${e.type}-${e.id}`}
                  className="text-xs text-red-400 border border-[rgba(239,68,68,0.3)] px-3 py-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.08)] transition disabled:opacity-50">
                  {deleting === `${e.type}-${e.id}` ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-[rgba(255,255,255,0.35)]">Showing up to {LIMIT} latest records. Use the type tabs to filter.</p>
    </main>
  )
}
