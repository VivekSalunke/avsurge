'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AddLaptopPage() {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', brand: '', slug: '', price_inr: '', image_url: '', released_at: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const inputStyle = { color: '#111827', backgroundColor: '#ffffff' }

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) router.push('/login')
    else if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading, profileLoading])

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSave = async () => {
    if (!form.name || !form.brand || !form.slug) { setMsg('Name, brand and slug are required'); return }
    setSaving(true)
    const { data, error } = await supabase.from('laptops').insert({
      name: form.name, brand: form.brand, slug: form.slug,
      price_inr: form.price_inr ? parseInt(form.price_inr) : null,
      image_url: form.image_url || null,
      released_at: form.released_at || null,
    }).select().single()
    if (error) { setMsg('Error: ' + error.message); setSaving(false); return }
    router.push(`/admin/edit-laptop/${data.slug}`)
  }

  if (loading || profileLoading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Add Laptop</h1>
        <Link href="/admin/laptops" className="text-sm text-blue-600 hover:underline">← Back</Link>
      </div>

      {msg && <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${msg.startsWith('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{msg}</div>}

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))}
              placeholder="Apple MacBook Air 13 M3"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Brand *</label>
            <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
              placeholder="Apple"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Slug *</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="apple-macbook-air-13-m3"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Price (INR)</label>
            <input type="number" value={form.price_inr} onChange={e => setForm(f => ({ ...f, price_inr: e.target.value }))}
              placeholder="114900"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Released At</label>
            <input value={form.released_at} onChange={e => setForm(f => ({ ...f, released_at: e.target.value }))}
              placeholder="2024-03-08"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" style={inputStyle} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Image URL</label>
            <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" style={inputStyle} />
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-4">After adding, you'll be taken to the edit page to add specs.</p>
        <button onClick={handleSave} disabled={saving}
          className="bg-blue-600 text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
          {saving ? 'Adding...' : 'Add Laptop'}
        </button>
      </div>
    </main>
  )
}
