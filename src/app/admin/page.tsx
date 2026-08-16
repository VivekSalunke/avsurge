'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatPriceINR } from '@/lib/format'

type Counts = { phones: number; tablets: number; laptops: number; news: number; brands: number; priceHistory: number }

type RecentDevice = { type: 'phone' | 'tablet' | 'laptop'; name: string; brand: string | null; slug: string; price_inr: number | null; created_at: string }

type SearchResult = RecentDevice

const STAT_CARDS: { key: keyof Counts; label: string; icon: string; accent: string; href: string }[] = [
  { key: 'phones', label: 'Phones', icon: '📱', accent: 'from-neon-violet to-neon-cyan', href: '/admin/phones' },
  { key: 'tablets', label: 'Tablets', icon: '📟', accent: 'from-neon-cyan to-emerald-400', href: '/admin/tablets' },
  { key: 'laptops', label: 'Laptops', icon: '💻', accent: 'from-neon-violet to-blue-500', href: '/admin/laptops' },
  { key: 'news', label: 'News', icon: '📰', accent: 'from-amber-400 to-orange-500', href: '/admin/news' },
  { key: 'brands', label: 'Brands', icon: '🏷️', accent: 'from-pink-500 to-neon-violet', href: '/admin/brands' },
  { key: 'priceHistory', label: 'Price History', icon: '📈', accent: 'from-emerald-400 to-teal-500', href: '/admin/price-history' },
]

const QUICK_ACTIONS = [
  { href: '/admin/add-phone', title: 'Add Phone', desc: 'New phone + specs', icon: '📱' },
  { href: '/admin/add-tablet', title: 'Add Tablet', desc: 'New tablet + specs', icon: '📟' },
  { href: '/admin/laptops/add', title: 'Add Laptop', desc: 'New laptop + specs', icon: '💻' },
  { href: '/admin/bulk', title: 'Bulk Phones', desc: 'JSON import', icon: '📦' },
  { href: '/admin/import-tablets', title: 'Bulk Tablets', desc: 'JSON import', icon: '📦' },
  { href: '/admin/laptops/bulk-import', title: 'Bulk Laptops', desc: 'JSON import', icon: '📦' },
  { href: '/admin/news/new', title: 'New Article', desc: 'Write news', icon: '✍️' },
  { href: '/admin/images', title: 'Images', desc: 'Device images', icon: '🖼️' },
]

const EDIT_PATH: Record<string, string> = { phone: '/admin/edit-phone/', tablet: '/admin/edit-tablet/', laptop: '/admin/edit-laptop/' }

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null)
  const [recent, setRecent] = useState<RecentDevice[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    const count = async (table: string) => {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
      return count || 0
    }
    const [phones, tablets, laptops, news] = await Promise.all([
      count('phones'), count('tablets'), count('laptops'), count('news'),
    ])
    const [ph, tph, lph] = await Promise.all([
      count('price_history'), count('tablet_price_history'), count('laptop_price_history'),
    ])

    const [phoneBrands, tabletBrands, laptopBrands] = await Promise.all([
      supabase.from('phones').select('brand'),
      supabase.from('tablets').select('brand'),
      supabase.from('laptops').select('brand'),
    ])
    const brandSet = new Set<string>()
    for (const arr of [phoneBrands.data, tabletBrands.data, laptopBrands.data]) {
      for (const row of (arr || [])) if (row.brand) brandSet.add(row.brand)
    }

    setCounts({ phones, tablets, laptops, news, brands: brandSet.size, priceHistory: ph + tph + lph })

    const recentPhones = (await supabase.from('phones').select('name, brand, slug, price_inr, created_at').order('created_at', { ascending: false }).limit(5)).data || []
    const recentTablets = (await supabase.from('tablets').select('name, brand, slug, price_inr, created_at').order('created_at', { ascending: false }).limit(5)).data || []
    const recentLaptops = (await supabase.from('laptops').select('name, brand, slug, price_inr, created_at').order('created_at', { ascending: false }).limit(5)).data || []
    const merged: RecentDevice[] = [
      ...recentPhones.map((d: any) => ({ ...d, type: 'phone' as const })),
      ...recentTablets.map((d: any) => ({ ...d, type: 'tablet' as const })),
      ...recentLaptops.map((d: any) => ({ ...d, type: 'laptop' as const })),
    ].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 6)
    setRecent(merged)
  }

  const search = async (q: string) => {
    setQuery(q)
    if (q.trim().length < 2) { setResults(null); return }
    setSearching(true)
    const like = `%${q.trim()}%`
    const [p, t, l] = await Promise.all([
      supabase.from('phones').select('name, brand, slug, price_inr').ilike('name', like).limit(6),
      supabase.from('tablets').select('name, brand, slug, price_inr').ilike('name', like).limit(6),
      supabase.from('laptops').select('name, brand, slug, price_inr').ilike('name', like).limit(6),
    ])
    const merged: SearchResult[] = [
      ...(p.data || []).map((d: any) => ({ ...d, type: 'phone' as const, created_at: '' })),
      ...(t.data || []).map((d: any) => ({ ...d, type: 'tablet' as const, created_at: '' })),
      ...(l.data || []).map((d: any) => ({ ...d, type: 'laptop' as const, created_at: '' })),
    ]
    setResults(merged)
    setSearching(false)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-[var(--text)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-[rgba(255,255,255,0.4)]">Manage AVSurge content from one place</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <div className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[var(--card-bg)] px-3.5 py-2.5 transition focus-within:border-neon-violet">
          <svg className="h-4 w-4 flex-shrink-0 text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query}
            onChange={e => search(e.target.value)}
            placeholder="Search any device to edit or delete..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[rgba(255,255,255,0.35)]"
          />
          {searching && <div className="h-3.5 w-3.5 flex-shrink-0 animate-spin rounded-full border-2 border-neon-violet border-t-transparent" />}
        </div>
        {results && (
          <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.09)] bg-[var(--panel)] shadow-2xl shadow-black/50">
            {results.length === 0 && <p className="px-4 py-3 text-sm text-dim">No devices match &ldquo;{query}&rdquo;</p>}
            {results.map(r => (
              <Link key={`${r.type}-${r.slug}`} href={EDIT_PATH[r.type] + r.slug}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition hover:bg-[rgba(255,255,255,0.03)]">
                <span className="flex min-w-0 items-center gap-2">
                  <span>{r.type === 'phone' ? '📱' : r.type === 'tablet' ? '📟' : '💻'}</span>
                  <span className="truncate text-white">{r.name}</span>
                  <span className="shrink-0 text-xs text-dim">{r.brand}</span>
                </span>
                <span className="shrink-0 text-xs font-medium text-neon-cyan">{r.price_inr ? formatPriceINR(r.price_inr) : ''} →</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_CARDS.map(card => (
          <Link key={card.key} href={card.href}
            className="group relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] p-4 transition card-hover hover:border-neon-violet hover:glow">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-base ${card.accent}`}>
              {card.icon}
            </div>
            <p className="text-2xl font-extrabold text-white">{counts ? counts[card.key].toLocaleString('en-IN') : '—'}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-dim">
              {card.label}
              <svg className="h-3 w-3 opacity-0 transition group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions + Recent */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-dim">
            <span className="h-4 w-1 rounded-full bg-gradient-to-b from-neon-violet to-neon-cyan" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {QUICK_ACTIONS.map(action => (
              <Link key={action.href} href={action.href}
                className="group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] p-4 transition hover:border-neon-cyan hover:glow">
                <span className="mb-2 block text-xl">{action.icon}</span>
                <p className="text-sm font-semibold text-white transition group-hover:text-neon-cyan">{action.title}</p>
                <p className="mt-0.5 text-[11px] text-dim">{action.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-dim">
            <span className="h-4 w-1 rounded-full bg-gradient-to-b from-neon-cyan to-emerald-400" /> Recently Added
          </h2>
          <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)]">
            {recent.length === 0 && <p className="px-4 py-4 text-sm text-dim">Loading...</p>}
            {recent.map(r => (
              <Link key={`${r.type}-${r.slug}`} href={EDIT_PATH[r.type] + r.slug}
                className="flex items-center justify-between gap-2 border-b border-[rgba(255,255,255,0.04)] px-4 py-3 text-sm transition last:border-0 hover:bg-[rgba(255,255,255,0.02)]">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span>{r.type === 'phone' ? '📱' : r.type === 'tablet' ? '📟' : '💻'}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-white">{r.name}</span>
                    <span className="block text-xs text-dim">{r.brand || '—'}</span>
                  </span>
                </span>
                <span className="shrink-0 text-xs text-neon-cyan">{r.price_inr ? formatPriceINR(r.price_inr) : ''}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
