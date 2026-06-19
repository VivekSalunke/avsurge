'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const CATEGORIES = ['General', 'Display', 'Performance', 'Storage', 'Camera', 'Battery', 'Connectivity', 'Audio', 'Build']

export default function AddTabletPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', brand: '', slug: '', price_inr: '', image_url: '', released_at: ''
  })
  const [specs, setSpecs] = useState([{ category: 'General', label: '', value: '' }])

  const updateForm = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const addSpec = () => setSpecs(s => [...s, { category: 'General', label: '', value: '' }])
  const removeSpec = (i: number) => setSpecs(s => s.filter((_, idx) => idx !== i))
  const updateSpec = (i: number, k: string, v: string) => setSpecs(s => s.map((sp, idx) => idx === i ? { ...sp, [k]: v } : sp))

  const handleSave = async () => {
    if (!form.name || !form.brand || !form.slug) return
    setSaving(true)

    const { data: tablet, error } = await supabase.from('tablets').insert({
      name: form.name, brand: form.brand, slug: form.slug,
      price_inr: form.price_inr ? parseInt(form.price_inr) : null,
      image_url: form.image_url || null,
      released_at: form.released_at || null,
    }).select().single()

    if (error || !tablet) { setSaving(false); alert('Error: ' + error?.message); return }

    const validSpecs = specs.filter(s => s.label && s.value)
    if (validSpecs.length > 0) {
      await supabase.from('tablet_specs').insert(validSpecs.map(s => ({ tablet_id: tablet.id, ...s })))
    }

    router.push(`/tablets/${tablet.slug}`)
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-blue-600">← Admin</Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Tablet</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Basic Info</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { k: 'name', label: 'Tablet Name', placeholder: 'Samsung Galaxy Tab S10' },
            { k: 'brand', label: 'Brand', placeholder: 'Samsung' },
            { k: 'price_inr', label: 'Price (₹)', placeholder: '74999' },
            { k: 'released_at', label: 'Release Date', placeholder: '2024-08-01' },
          ].map(({ k, label, placeholder }) => (
            <div key={k}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input
                value={form[k as keyof typeof form]}
                onChange={e => {
                  updateForm(k, e.target.value)
                  if (k === 'name') updateForm('slug', autoSlug(e.target.value))
                }}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
              />
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Slug</label>
            <input
              value={form.slug}
              onChange={e => updateForm('slug', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Image URL</label>
            <input
              value={form.image_url}
              onChange={e => updateForm('image_url', e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Specs</h2>
          <button onClick={addSpec} className="text-xs text-blue-600 font-medium hover:underline">+ Add spec</button>
        </div>
        <div className="space-y-3">
          {specs.map((spec, i) => (
            <div key={i} className="grid grid-cols-7 gap-2 items-center">
              <select
                value={spec.category}
                onChange={e => updateSpec(i, 'category', e.target.value)}
                className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input
                value={spec.label}
                onChange={e => updateSpec(i, 'label', e.target.value)}
                placeholder="Label"
                className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
              />
              <input
                value={spec.value}
                onChange={e => updateSpec(i, 'value', e.target.value)}
                placeholder="Value"
                className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
              />
              <button onClick={() => removeSpec(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !form.name || !form.brand || !form.slug}
        className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Tablet'}
      </button>
    </main>
  )
}
