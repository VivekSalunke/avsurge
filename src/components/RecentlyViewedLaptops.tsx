'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatPriceINR } from '@/lib/format'

interface LaptopRow {
  id: number
  slug: string
  name: string
  brand: string
  image_url: string | null
  price_inr: number | null
}

export default function RecentlyViewedLaptops({ currentSlug }: { currentSlug: string }) {
  const [laptops, setLaptops] = useState<LaptopRow[]>([])
  useEffect(() => {
    let cancelled = false
    const raw = localStorage.getItem('recently_viewed_laptops')
    const slugs: string[] = raw ? JSON.parse(raw) : []
    const filtered = slugs.filter(s => s !== currentSlug).slice(0, 4)
    if (filtered.length === 0) return

    supabase
      .from('laptops')
      .select('*')
      .in('slug', filtered)
      .then(({ data }) => {
        if (cancelled) return
        const sorted = filtered.map(slug => ((data || []) as LaptopRow[]).find(l => l.slug === slug)).filter((l): l is LaptopRow => Boolean(l))
        setLaptops(sorted)
      })

    return () => { cancelled = true }
  }, [currentSlug])
  if (laptops.length === 0) return null
  return (
    <div className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden neon-border text-[var(--text)]">
      <div className="px-5 py-4 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.04)]">
        <span className="text-sm font-semibold text-[rgba(255,255,255,0.85)]">Recently viewed</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[rgba(255,255,255,0.06)]">
        {laptops.map(laptop => (
          <Link key={laptop.id} href={`/laptops/${laptop.slug}`}
            className="p-4 text-center hover:bg-[rgba(6,182,212,0.06)] transition group">
            <div className="w-full aspect-square bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mb-3 overflow-hidden relative">
              {laptop.image_url
                ? <Image src={laptop.image_url} alt={laptop.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain w-full h-full p-2" />
                : <span className="text-3xl">💻</span>}
            </div>
            <p className="text-xs text-[rgba(255,255,255,0.4)] mb-0.5">{laptop.brand}</p>
            <p className="text-xs font-semibold text-white group-hover:text-neon-cyan transition line-clamp-2 leading-tight mb-1">{laptop.name}</p>
            {laptop.price_inr && (
              <p className="text-xs text-neon-cyan font-medium">{formatPriceINR(laptop.price_inr)}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
