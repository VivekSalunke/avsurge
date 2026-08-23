'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatPriceINR } from '@/lib/format'

interface TabletRow {
  id: number
  slug: string
  name: string
  brand: string
  image_url: string | null
  price_inr: number | null
}

export default function RecentlyViewedTablets({ currentSlug }: { currentSlug: string }) {
  const [tablets, setTablets] = useState<TabletRow[]>([])
  useEffect(() => {
    let cancelled = false
    const raw = localStorage.getItem('recently_viewed_tablets')
    const slugs: string[] = raw ? JSON.parse(raw) : []
    const filtered = slugs.filter(s => s !== currentSlug).slice(0, 4)
    if (filtered.length === 0) return

    supabase
      .from('tablets')
      .select('*')
      .in('slug', filtered)
      .then(({ data }) => {
        if (cancelled) return
        const sorted = filtered
          .map(slug => ((data || []) as TabletRow[]).find(t => t.slug === slug))
          .filter((t): t is TabletRow => Boolean(t))
        setTablets(sorted)
      })

    return () => { cancelled = true }
  }, [currentSlug])
  if (tablets.length === 0) return null
  return (
    <div className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden neon-border text-[var(--text)]">
      <div className="px-5 py-4 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.04)]">
        <span className="text-sm font-semibold text-[rgba(255,255,255,0.85)]">Recently viewed</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[rgba(255,255,255,0.06)]">
        {tablets.map(tablet => (
          <Link key={tablet.id} href={`/tablets/${tablet.slug}`}
            className="p-4 text-center hover:bg-[rgba(6,182,212,0.06)] transition group">
            <div className="w-full aspect-square bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mb-3 overflow-hidden relative">
              {tablet.image_url
                ? <Image src={tablet.image_url} alt={tablet.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain w-full h-full p-2" />
                : <span className="text-3xl">📟</span>}
            </div>
            <p className="text-xs text-[rgba(255,255,255,0.4)] mb-0.5">{tablet.brand}</p>
            <p className="text-xs font-semibold text-white group-hover:text-neon-cyan transition line-clamp-2 leading-tight mb-1">{tablet.name}</p>
            {tablet.price_inr && (
              <p className="text-xs text-neon-cyan font-medium">{formatPriceINR(tablet.price_inr)}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
