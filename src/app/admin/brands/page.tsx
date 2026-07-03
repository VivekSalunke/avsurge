'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminBrandsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [brands, setBrands] = useState<any[]>([])
  const [allBrands, setAllBrands] = useState<string[]>([])
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({ brand: '', logo_url: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [editId, setEditId] = useState<number | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user) router.push('/login')
    if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading])

  useEffect(() => {
    if (user && isAdmin) fetchData()
  }, [user, isAdmin])

  const fetchData = async () => {
    setFetching(true)
    const [{ data: logos }, { data: phones }, { data: tablets }, { data: laptops }] = await Promise.all([
      supabase.from('brand_logos').select('*').order('brand'),
      supabase.from('phones').select('brand'),
      supabase.from('tablets').select('brand'),
      supabase.from('laptops').select('brand'),
    ])
    setBrands(logos || [])
    const all = [...new Set([
      ...(phones || []).map(p => p.brand),
      ...(tablets || []).map(t => t.brand),
      ...(laptops || []).map(l => l.brand),
    ])].sort()
    setAllBrands(all)
    setFetching(false)
  }

  const handleSave = async () => {
    if (!form.brand) return
    setSaving(true)
    setMsg('')
    if (editId) {
      const { error } = await supabase.from('brand_logos').update({ logo_url: form.logo_url }).eq('id', editId)
      if (error) setMsg('Error: ' + error.message)
      else { setMsg('Updated!'); setEditId(null); setForm({ brand: '', logo_url: '' }) }
    } else {
      const { error } = await supabase.from('brand_logos').upsert({ brand: form.brand, logo_url: form.logo_url }, { onConflict: 'brand' })
      if (error) setMsg('Error: ' + error.message)
      else { setMsg('Saved!'); setForm({ brand: '', logo_url: '' }) }
    }
    setSaving(false)
    fetchData()
  }

  const handleEdit = (b: any) => {
    setEditId(b.id)
    setForm({ brand: b.brand, logo_url: b.logo_url || '' })
    setMsg('')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this brand logo?')) return
    await supabase.from('brand_logos').delete().eq('id', id)
    fetchData()
  }

  const missingBrands = allBrands.filter(b => !brands.find(bl => bl.brand === b))

  if (loading || fetching) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Brand Logos</h1>
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
      </div>

      {/* Add/Edit form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">{editId ? 'Edit Brand Logo' : 'Add Brand Logo'}</h2>
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Brand</label>
            {editId ? (
              <input value={form.brand} disabled
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50"
                style={{ color: '#111827' }} />
            ) : (
              <select value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}>
                <option value="">Select brand...</option>
                {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Logo URL</label>
            <input
              placeholder="https://example.com/logo.png"
              value={form.logo_url}
              onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>
          {form.logo_url && (
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
              <img src={form.logo_url} alt="Preview" className="h-10 object-contain" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
              <span className="text-xs text-gray-400">Logo preview</span>
            </div>
          )}
        </div>
        {msg && <p className={`text-sm mb-3 ${msg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving || !form.brand}
            className="bg-blue-600 text-white rounded-xl px-5 py-2 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {saving ? 'Saving...' : editId ? 'Update' : 'Save Logo'}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm({ brand: '', logo_url: '' }); setMsg('') }}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-500 hover:border-gray-400 transition">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Missing brands */}
      {missingBrands.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-yellow-700 mb-2">Brands without logos ({missingBrands.length}):</p>
          <div className="flex flex-wrap gap-2">
            {missingBrands.map(b => (
              <button key={b} onClick={() => setForm({ brand: b, logo_url: '' })}
                className="text-xs px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition">
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brands list */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">All Brand Logos ({brands.length})</span>
        </div>
        {brands.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">No brand logos added yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3 text-left">Logo</th>
                <th className="px-5 py-3 text-left">Brand</th>
                <th className="px-5 py-3 text-left">URL</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b, i) => (
                <tr key={b.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-5 py-3">
                    {b.logo_url
                      ? <img src={b.logo_url} alt={b.brand} className="h-8 object-contain" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                      : <span className="text-gray-300 text-xs">No logo</span>}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-800">{b.brand}</td>
                  <td className="px-5 py-3 text-xs text-gray-400 max-w-xs truncate">{b.logo_url || '—'}</td>
                  <td className="px-5 py-3 flex gap-3">
                    <button onClick={() => handleEdit(b)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(b.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
