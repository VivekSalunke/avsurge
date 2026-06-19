'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ManageTabletsPage() {
  const [tablets, setTablets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadTablets() }, [])

  const loadTablets = async () => {
    const { data } = await supabase.from('tablets').select('*').order('created_at', { ascending: false })
    setTablets(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete ${name}?`)) return
    await supabase.from('tablets').delete().eq('id', id)
    setTablets(t => t.filter(tab => tab.id !== id))
  }

  const filtered = tablets.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.brand.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-blue-600">← Admin</Link>
          <h1 className="text-2xl font-bold text-gray-900">Manage Tablets</h1>
        </div>
        <Link href="/admin/add-tablet" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          + Add Tablet
        </Link>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search tablets..."
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-6 focus:outline-none focus:border-blue-400"
        style={{ color: '#111827', backgroundColor: '#ffffff' }}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Tablet</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Brand</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Price</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tablet, i) => (
                <tr key={tablet.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {tablet.image_url
                        ? <img src={tablet.image_url} alt={tablet.name} className="w-8 h-8 object-contain rounded" />
                        : <span className="text-xl">📟</span>}
                      <span className="text-sm font-medium text-gray-900">{tablet.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{tablet.brand}</td>
                  <td className="px-5 py-3 text-sm text-blue-600 font-medium">
                    {tablet.price_inr ? `₹${tablet.price_inr.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      <Link href={`/tablets/${tablet.slug}`} className="text-xs text-blue-600 hover:underline">View</Link>
                      <button onClick={() => handleDelete(tablet.id, tablet.name)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">No tablets found</div>
          )}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-4">{filtered.length} tablets</p>
    </main>
  )
}
