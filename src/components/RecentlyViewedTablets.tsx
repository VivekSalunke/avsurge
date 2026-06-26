'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
export default function RecentlyViewedTablets({ currentSlug }: { currentSlug: string }) {
  const [tablets, setTablets] = useState<any[]>([])
  useEffect(() => {
    loadTablets()
  }, [currentSlug])
  const loadTablets = async () => {
    const raw = localStorage.getItem('recently_viewed_tablets')
    const slugs: string[] = raw ? JSON.parse(raw) : []
    const filtered = slugs.filter(s => s !== currentSlug).slice(0, 4)
    if (filtered.length === 0) return
    const { data } = await supabase
      .from('tablets')
      .select('*')
      .in('slug', filtered)
    const sorted = filtered
      .map(slug => (data || []).find(t => t.slug === slug))
      .filter(Boolean)
    setTablets(sorted)
  }
  if (tablets.length === 0) return null
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">Recently viewed</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
        {tablets.map((tablet: any) => (
          <Link key={tablet.id} href={`/tablets/${tablet.slug}`}
            className="p-4 text-center hover:bg-blue-50 transition group">
            <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-3 overflow-hidden">
              {tablet.image_url
                ? <img src={tablet.image_url} alt={tablet.name} className="object-contain w-full h-full p-2" />
                : <span className="text-3xl">📟</span>}
            </div>
            <p className="text-xs text-gray-400 mb-0.5">{tablet.brand}</p>
            <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2 leading-tight mb-1">{tablet.name}</p>
            {tablet.price_inr && (
              <p className="text-xs text-blue-600 font-medium">₹{tablet.price_inr.toLocaleString('en-IN')}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
