'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ManagePhonesPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [phones, setPhones] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (!loading && user && !isAdmin) router.push('/')
  }, [user, isAdmin, loading])

  useEffect(() => {
    if (isAdmin) fetchPhones()
  }, [isAdmin])

  const fetchPhones = async () => {
    const { data } = await supabase.from('phones').select('*').order('created_at', { ascending: false })
    setPhones(data || [])
    setFetching(false)
  }

  const deletePhone = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    setDeleting(id)
    await supabase.from('phone_specs').delete().eq('phone_id', id)
    await supabase.from('phones').delete().eq('id', id)
    setPhones(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const filtered = phones.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

  if (loading || fetching) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Phones</h1>
          <p className="text-sm text-gray-400">{phones.length} phones in database</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">← Admin</Link>
          <Link href="/admin/add-phone" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">+ Add phone</Link>
        </div>
      </div>

      <input
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 mb-6"
        placeholder="Search phones..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center">
          <p className="text-gray-400 text-sm">No phones found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {filtered.map((phone, i) => (
            <div key={phone.id} className={`flex items-center justify-between px-5 py-4 ${i !== filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                  {phone.image_url
                    ? <img src={phone.image_url} alt={phone.name} className="w-full h-full object-contain" />
                    : <span className="text-lg">📱</span>
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{phone.name}</p>
                  <p className="text-xs text-gray-400">{phone.brand} · {phone.price_inr ? `₹${phone.price_inr.toLocaleString()}` : 'No price'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/edit-phone/${phone.slug}`}
                  className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                  Edit
                </Link>
                <Link href={`/phones/${phone.slug}`} target="_blank"
                  className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                  View
                </Link>
                <button
                  onClick={() => deletePhone(phone.id, phone.name)}
                  disabled={deleting === phone.id}
                  className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition disabled:opacity-50">
                  {deleting === phone.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
