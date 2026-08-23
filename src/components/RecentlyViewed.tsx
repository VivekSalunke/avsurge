'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatPriceINR } from '@/lib/format'

interface PhoneRow {
  id: number
  slug: string
  name: string
  brand: string
  image_url: string | null
  price_inr: number | null
}

export default function RecentlyViewed({ currentSlug }: { currentSlug: string }) {
  const [phones, setPhones] = useState<PhoneRow[]>([])

  useEffect(() => {
    let cancelled = false
    const raw = localStorage.getItem('recently_viewed')
    const slugs: string[] = raw ? JSON.parse(raw) : []
    const filtered = slugs.filter(s => s !== currentSlug).slice(0, 4)
    if (filtered.length === 0) return

    supabase
      .from('phones')
      .select('*')
      .in('slug', filtered)
      .then(({ data }) => {
        if (cancelled) return
        // Sort by order in localStorage
        const sorted = filtered
          .map(slug => ((data || []) as PhoneRow[]).find(p => p.slug === slug))
          .filter((p): p is PhoneRow => Boolean(p))
        setPhones(sorted)
      })

    return () => { cancelled = true }
  }, [currentSlug])

  if (phones.length === 0) return null

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden neon-border text-[var(--text)]">
      <div className="px-5 py-4 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.04)]">
        <span className="text-sm font-semibold text-[rgba(255,255,255,0.85)]">Recently viewed</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[rgba(255,255,255,0.06)]">
        {phones.map(phone => (
          <Link key={phone.id} href={`/phones/${phone.slug}`}
            className="p-4 text-center hover:bg-[rgba(6,182,212,0.06)] transition group">
            <div className="w-full aspect-square bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mb-3 overflow-hidden relative">
              {phone.image_url
                ? <Image src={phone.image_url} alt={phone.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain w-full h-full p-2" />
                : <span className="text-3xl">📱</span>}
            </div>
            <p className="text-xs text-[rgba(255,255,255,0.4)] mb-0.5">{phone.brand}</p>
            <p className="text-xs font-semibold text-white group-hover:text-neon-cyan transition line-clamp-2 leading-tight mb-1">{phone.name}</p>
            {phone.price_inr && (
              <p className="text-xs text-neon-cyan font-medium">{formatPriceINR(phone.price_inr)}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
