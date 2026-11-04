'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CATEGORY_LABELS,
  devicePath,
  formatLaunchDate,
  monthLabel,
  type UpcomingCategory,
  type UpcomingLaunch,
} from '@/lib/upcoming'

type Tab = 'all' | UpcomingCategory

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'phone', label: 'Phones' },
  { id: 'tablet', label: 'Tablets' },
  { id: 'laptop', label: 'Laptops' },
]

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return 'source' }
}

function LaunchCard({ item, launched }: { item: UpcomingLaunch; launched: boolean }) {
  const page = devicePath(item)
  const expected = item.date_status === 'expected' && !launched
  return (
    <div className="flex gap-4 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] p-4">
      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[rgba(255,255,255,0.03)]">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill unoptimized sizes="80px" className="object-contain p-1" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-[rgba(255,255,255,0.3)]">
            {CATEGORY_LABELS[item.category]}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-[rgba(255,255,255,0.45)]">
          {item.brand} · {CATEGORY_LABELS[item.category]}
        </div>
        <h3 className="text-base font-bold text-white">
          {page ? <Link href={page} className="hover:underline">{item.name}</Link> : item.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold" style={{ color: expected ? '#fbbf24' : '#22d3ee' }}>
          <span>{launched ? 'Launched ' : expected ? 'Expected ' : 'Launching '}{formatLaunchDate(item.launch_date)}</span>
          {expected && (
            <span className="rounded-full border border-[rgba(251,191,36,0.3)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
              Date not confirmed
            </span>
          )}
        </div>
        {item.expected_price_note && (
          <div className="mt-1 text-xs text-[rgba(255,255,255,0.7)]">{item.expected_price_note}</div>
        )}
        {item.highlights.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {item.highlights.map(h => (
              <li key={h} className="rounded-full border border-[rgba(255,255,255,0.08)] px-2 py-0.5 text-[11px] text-[rgba(255,255,255,0.7)]">{h}</li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          <a href={item.source_url} target="_blank" rel="noopener nofollow" className="text-[rgba(255,255,255,0.5)] hover:text-white hover:underline">
            {expected ? 'Teased by' : 'Confirmed by'} {item.brand} ({hostOf(item.source_url)}) ↗
          </a>
          {page && (
            <Link href={page} className="font-medium hover:underline" style={{ color: '#22d3ee' }}>
              Full specs &amp; price →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UpcomingList({ upcoming, recent }: { upcoming: UpcomingLaunch[]; recent: UpcomingLaunch[] }) {
  const [tab, setTab] = useState<Tab>('all')
  const show = (list: UpcomingLaunch[]) => (tab === 'all' ? list : list.filter(i => i.category === tab))

  const filtered = show(upcoming)
  const months = new Map<string, UpcomingLaunch[]>()
  for (const item of filtered) {
    const key = monthLabel(item.launch_date)
    months.set(key, [...(months.get(key) ?? []), item])
  }
  const recentFiltered = show(recent)

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className="rounded-full border px-4 py-1.5 text-sm transition"
            style={
              tab === t.id
                ? { borderColor: '#06b6d4', background: 'rgba(6,182,212,0.12)', color: '#fff' }
                : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {months.size === 0 && (
        <p className="rounded-2xl border border-dashed border-[rgba(255,255,255,0.08)] py-12 text-center text-sm text-[rgba(255,255,255,0.45)]">
          No confirmed launches yet. Check back soon.
        </p>
      )}

      {[...months.entries()].map(([month, items]) => (
        <section key={month} className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-white">{month}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {items.map(item => <LaunchCard key={item.id} item={item} launched={false} />)}
          </div>
        </section>
      ))}

      {recentFiltered.length > 0 && (
        <section className="mt-10 border-t border-[rgba(255,255,255,0.06)] pt-6">
          <h2 className="mb-3 text-lg font-bold text-white">Recently launched</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {recentFiltered.map(item => <LaunchCard key={item.id} item={item} launched />)}
          </div>
        </section>
      )}
    </div>
  )
}
