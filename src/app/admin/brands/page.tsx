'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface BrandLogo {
  id: number
  brand: string
  logo_url: string | null
  description: string | null
}

export default function AdminBrandsPage() {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()
  const [brands, setBrands] = useState<BrandLogo[]>([])
  const [allBrands, setAllBrands] = useState<string[]>([])
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) router.push('/login')
    else if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading, profileLoading, router])

  const loadBrandData = useCallback(async () => {
    const [{ data: logos }, { data: phones }, { data: tablets }, { data: laptops }] = await Promise.all([
      supabase.from('brand_logos').select('*').order('brand'),
      supabase.from('phones').select('brand'),
      supabase.from('tablets').select('brand'),
      supabase.from('laptops').select('brand'),
    ])
    const all = [...new Set([
      ...((phones || []) as { brand: string }[]).map(p => p.brand),
      ...((tablets || []) as { brand: string }[]).map(t => t.brand),
      ...((laptops || []) as { brand: string }[]).map(l => l.brand),
    ])].sort()
    return { logos: (logos || []) as BrandLogo[], all }
  }, [])

  useEffect(() => {
    if (!user || !isAdmin) return
    let cancelled = false
    loadBrandData().then(({ logos, all }) => {
      if (cancelled) return
      setBrands(logos)
      setAllBrands(all)
      setFetching(false)
    })
    return () => { cancelled = true }
  }, [user, isAdmin, loadBrandData])

  const handleDelete = async (id: number, brandName: string) => {
    if (!confirm(`Delete the logo/description for ${brandName}?`)) return
    await supabase.from('brand_logos').delete().eq('id', id)
    setFetching(true)
    const { logos, all } = await loadBrandData()
    setBrands(logos)
    setAllBrands(all)
    setFetching(false)
  }

  const missingBrands = allBrands.filter(b => !brands.find(bl => bl.brand === b))
  const filteredBrands = allBrands.filter(b => b.toLowerCase().includes(search.toLowerCase()))

  if (loading || fetching) return <div className="flex items-center justify-center min-h-screen text-[var(--text)]"><div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 text-[var(--text)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Brands</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const name = window.prompt('New brand name:')
              if (name?.trim()) router.push(`/admin/brands/${encodeURIComponent(name.trim())}`)
            }}
            className="bg-gradient-to-r from-neon-violet to-neon-cyan text-black font-semibold rounded-xl px-4 py-2 text-sm transition">
            + Add New Brand
          </button>
          <Link href="/admin" className="text-sm text-neon-cyan hover:underline">← Admin</Link>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search brands..."
          className="w-full max-w-xs border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
          style={{ color: '#111827', backgroundColor: '#ffffff' }}
        />
        <div className="flex gap-4 text-xs">
          <span className="text-[#34d399]">● With Logo ({brands.filter(b => b.logo_url).length})</span>
          <span className="text-[#fbbf24]">● Without Logo ({missingBrands.length})</span>
        </div>
      </div>

      {filteredBrands.length === 0 ? (
        <p className="p-5 text-sm text-[rgba(255,255,255,0.4)]">No brands found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrands.map((brandName) => {
            const brandLogo = brands.find(b => b.brand === brandName)
            const hasLogo = !!brandLogo?.logo_url

            return (
              <div key={brandName} className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 neon-border flex flex-col">
                <div className="flex items-center justify-center h-24 mb-4 bg-[rgba(255,255,255,0.02)] rounded-xl">
                  {hasLogo ? (
                    <Image src={brandLogo.logo_url || ''} alt={brandName} unoptimized width={200} height={80} className="max-h-20 w-auto object-contain" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                  ) : (
                    <span className="w-12 h-12 rounded-lg bg-[rgba(251,191,36,0.1)] flex items-center justify-center text-lg text-[#fbbf24]">?</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">{brandName}</span>
                  {hasLogo ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(52,211,153,0.1)] text-[#34d399]">Logo</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(251,191,36,0.1)] text-[#fbbf24]">No Logo</span>
                  )}
                </div>
                {brandLogo?.description && (
                  <p className="text-xs text-[rgba(255,255,255,0.5)] line-clamp-2 mb-3">{brandLogo.description}</p>
                )}
                <div className="mt-auto pt-3 flex gap-3 border-t border-[rgba(255,255,255,0.04)]">
                  <Link href={`/admin/brands/${encodeURIComponent(brandName)}`}
                    className="text-xs text-neon-cyan hover:underline">
                    {hasLogo || brandLogo?.description ? 'Edit' : 'Add Details'}
                  </Link>
                  {brandLogo && (
                    <button onClick={() => handleDelete(brandLogo.id, brandName)}
                      className="text-xs text-red-400 hover:text-red-600 hover:underline">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
