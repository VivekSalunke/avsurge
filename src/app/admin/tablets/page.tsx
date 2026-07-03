'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ManageTabletsPage() {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()
  const [tablets, setTablets] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) router.push('/login')
    else if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading, profileLoading])

  useEffect(() => {
    if (isAdmin) fetchTablets()
  }, [isAdmin])

  const fetchTablets = async () => {
    const { data } = await supabase.from('tablets').select('*').order('created_at', { ascending: false })
    setTablets(data || [])
    setFetching(false)
  }

  const deleteTablet = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    setDeleting(id)
    await supabase.from('tablet_specs').delete().eq('tablet_id', id)
    await supabase.from('tablets').delete().eq('id', id)
    setTablets(prev => prev.filter(t => t.id !== id))
    setDeleting(null)
  }

  const filtered = tablets.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.brand.toLowerCase().includes(search.toLowerCase())
  )

  if (loading || profileLoading || fetching) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  if (!user || !isAdmin) return null

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Manage Tablets</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
          <Link href="/admin/add-tablet"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
            + Add Tablet
          </Link>
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-6">{tablets.length} tablets in database</p>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search tablets..."
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-6 focus:outline-none focus:border-blue-400"
        style={{ color: '#111827', backgroundColor: '#ffffff' }}
      />

      <div className="flex flex-col gap-2">
        {filtered.map(tablet => (
          <div key={tablet.id}
            className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-4 hover:border-blue-200 transition">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {tablet.image_url
                ? <img src={tablet.image_url} alt={tablet.name} className="object-contain w-full h-full p-1" />
                : <span className="text-2xl">📟</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{tablet.name}</p>
              <p className="text-xs text-gray-400">{tablet.brand} · {tablet.price_inr ? `₹${tablet.price_inr.toLocaleString('en-IN')}` : 'No price'}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href={`/tablets/${tablet.slug}`}
                className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-blue-400 hover:text-blue-600 transition">
                View
              </Link>
              <Link href={`/admin/edit-tablet/${tablet.slug}`}
                className="text-xs border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                Edit
              </Link>
              <button
                onClick={() => deleteTablet(tablet.id, tablet.name)}
                disabled={deleting === tablet.id}
                className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition disabled:opacity-50">
                {deleting === tablet.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">No tablets found</div>
        )}
      </div>
    </main>
  )
}
