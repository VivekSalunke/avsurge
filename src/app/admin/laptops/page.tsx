'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ManageLaptopsPage() {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()
  const [laptops, setLaptops] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) router.push('/login')
    else if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading, profileLoading])

  useEffect(() => {
    if (isAdmin) fetchLaptops()
  }, [isAdmin])

  const fetchLaptops = async () => {
    const { data } = await supabase.from('laptops').select('*').order('created_at', { ascending: false })
    setLaptops(data || [])
    setFetching(false)
  }

  const deleteLaptop = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    setDeleting(id)
    await supabase.from('laptop_specs').delete().eq('laptop_id', id)
    await supabase.from('laptops').delete().eq('id', id)
    setLaptops(prev => prev.filter(l => l.id !== id))
    setDeleting(null)
  }

  const filtered = laptops.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.brand.toLowerCase().includes(search.toLowerCase())
  )

  if (loading || profileLoading || fetching) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </main>
  )

  if (!user || !isAdmin) return null

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 text-[var(--text)]">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-white">Manage Laptops</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-sm text-neon-cyan hover:underline">← Admin</Link>
          <Link href="/admin/laptops/bulk-import"
            className="border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.85)] px-4 py-2 rounded-xl text-sm font-semibold hover:border-neon-cyan hover:text-white transition">
            Bulk Import
          </Link>
        </div>
      </div>
      <p className="text-sm text-[rgba(255,255,255,0.4)] mb-6">{laptops.length} laptops in database</p>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search laptops..."
        className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-2.5 text-sm mb-6 focus:outline-none focus:border-neon-cyan"
        style={{ color: '#111827', backgroundColor: '#ffffff' }}
      />

      <div className="flex flex-col gap-2">
        {filtered.map(laptop => (
          <div key={laptop.id}
            className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl px-4 py-3 flex items-center gap-4 hover:border-neon-cyan transition">
            <div className="w-12 h-12 bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {laptop.image_url
                ? <img src={laptop.image_url} alt={laptop.name} className="object-contain w-full h-full p-1" />
                : <span className="text-2xl">💻</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{laptop.name}</p>
              <p className="text-xs text-[rgba(255,255,255,0.4)]">{laptop.brand} · {laptop.price_inr ? `₹${laptop.price_inr.toLocaleString('en-IN')}` : 'No price'}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href={`/laptops/${laptop.slug}`}
                className="text-xs border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] px-3 py-1.5 rounded-lg hover:border-neon-cyan hover:text-neon-cyan transition">
                View
              </Link>
              <Link href={`/admin/edit-laptop/${laptop.slug}`}
                className="text-xs border border-[rgba(6,182,212,0.25)] text-neon-cyan px-3 py-1.5 rounded-lg hover:bg-[rgba(6,182,212,0.06)] transition">
                Edit
              </Link>
              <button
                onClick={() => deleteLaptop(laptop.id, laptop.name)}
                disabled={deleting === laptop.id}
                className="text-xs border border-[rgba(239,68,68,0.3)] text-red-400 px-3 py-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.08)] transition disabled:opacity-50">
                {deleting === laptop.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[rgba(255,255,255,0.4)] text-sm">No laptops found</div>
        )}
      </div>
    </main>
  )
}
