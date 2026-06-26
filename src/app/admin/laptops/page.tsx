'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
export default function AdminLaptops() {
  const [laptops, setLaptops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', brand: '', slug: '', price_inr: '', image_url: '', released_at: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchLaptops() }, [])

  const fetchLaptops = async () => {
    const { data } = await supabase.from('laptops').select('*').order('created_at', { ascending: false })
    setLaptops(data || [])
    setLoading(false)
  }

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async () => {
    if (!form.name || !form.brand || !form.slug) return
    setSaving(true)
    const { error } = await supabase.from('laptops').insert({
      name: form.name, brand: form.brand, slug: form.slug,
      price_inr: form.price_inr ? parseInt(form.price_inr) : null,
      image_url: form.image_url || null,
      released_at: form.released_at || null,
    })
    if (error) setMsg('Error: ' + error.message)
    else { setMsg('Laptop added!'); setForm({ name: '', brand: '', slug: '', price_inr: '', image_url: '', released_at: '' }); fetchLaptops() }
    setSaving(false)
  }

  const deleteLaptop = async (id: number) => {
    if (!confirm('Delete this laptop?')) return
    await supabase.from('laptops').delete().eq('id', id)
    fetchLaptops()
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Laptop Admin</h1>
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin home</Link>
      </div>

      {/* Add form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Add Laptop</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Brand *" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Slug *" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Price (INR)" value={form.price_inr} onChange={e => setForm(f => ({ ...f, price_inr: e.target.value }))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm" type="number" />
          <input placeholder="Image URL" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm col-span-2" />
          <input placeholder="Released at (YYYY-MM-DD)" value={form.released_at} onChange={e => setForm(f => ({ ...f, released_at: e.target.value }))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm col-span-2" />
        </div>
        {msg && <p className="text-sm text-green-600 mb-3">{msg}</p>}
        <button onClick={handleSubmit} disabled={saving}
          className="bg-blue-600 text-white rounded-xl px-5 py-2 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
          {saving ? 'Saving...' : 'Add Laptop'}
        </button>
      </div>

      {/* Laptop list */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">All Laptops ({laptops.length})</span>
        </div>
        {loading ? <p className="p-5 text-sm text-gray-400">Loading...</p> : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Brand</th>
                <th className="px-5 py-3 text-left">Price</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {laptops.map((l, i) => (
                <tr key={l.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-5 py-3 text-sm text-gray-800">{l.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{l.brand}</td>
                  <td className="px-5 py-3 text-sm text-blue-600">{l.price_inr ? `₹${l.price_inr.toLocaleString('en-IN')}` : '—'}</td>
                  <td className="px-5 py-3 flex gap-3">
                    <Link href={`/laptops/${l.slug}`} className="text-xs text-blue-600 hover:underline">View</Link>
                    <button onClick={() => deleteLaptop(l.id)} className="text-xs text-red-500 hover:underline">Delete</button>
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
