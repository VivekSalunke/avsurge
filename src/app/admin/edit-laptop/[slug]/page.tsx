'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function EditLaptopPage() {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string

  const [laptop, setLaptop] = useState<any>(null)
  const [specs, setSpecs] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', brand: '', slug: '', price_inr: '', image_url: '', released_at: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const inputStyle = { color: '#111827', backgroundColor: '#ffffff' }

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) router.push('/login')
    else if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading, profileLoading])

  useEffect(() => {
    if (isAdmin && slug) fetchLaptop()
  }, [isAdmin, slug])

  const fetchLaptop = async () => {
    const { data: l } = await supabase.from('laptops').select('*').eq('slug', slug).single()
    if (!l) return
    setLaptop(l)
    setForm({
      name: l.name || '', brand: l.brand || '', slug: l.slug || '',
      price_inr: l.price_inr?.toString() || '', image_url: l.image_url || '',
      released_at: l.released_at || ''
    })
    const { data: s } = await supabase.from('laptop_specs').select('*').eq('laptop_id', l.id).order('id')
    setSpecs(s || [])
  }

  const handleSave = async () => {
    if (!laptop) return
    setSaving(true)
    const { error } = await supabase.from('laptops').update({
      name: form.name, brand: form.brand, slug: form.slug,
      price_inr: form.price_inr ? parseInt(form.price_inr) : null,
      image_url: form.image_url || null,
      released_at: form.released_at || null,
    }).eq('id', laptop.id)
    if (error) setMsg('Error: ' + error.message)
    else { setMsg('Saved!'); if (form.slug !== slug) router.push(`/admin/edit-laptop/${form.slug}`) }
    setSaving(false)
  }

  const updateSpec = (id: number, value: string) =>
    setSpecs(prev => prev.map(s => s.id === id ? { ...s, value } : s))

  const saveSpec = async (spec: any) => {
    await supabase.from('laptop_specs').update({ value: spec.value }).eq('id', spec.id)
  }

  const addSpec = async () => {
    const { data } = await supabase.from('laptop_specs').insert({
      laptop_id: laptop.id, category: 'General', label: 'New spec', value: ''
    }).select().single()
    if (data) setSpecs(prev => [...prev, data])
  }

  const deleteSpec = async (id: number) => {
    await supabase.from('laptop_specs').delete().eq('id', id)
    setSpecs(prev => prev.filter(s => s.id !== id))
  }

  if (loading || profileLoading || !laptop) return (
    <main className="min-h-screen flex items-center justify-center text-[var(--text)]">
      <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </main>
  )

  const categories = [...new Set(specs.map(s => s.category))]

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 text-[var(--text)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Edit Laptop</h1>
        <div className="flex gap-3">
          <Link href={`/laptops/${slug}`} className="text-sm text-neon-cyan hover:underline">View page</Link>
          <Link href="/admin/laptops" className="text-sm text-neon-cyan hover:underline">← Back</Link>
        </div>
      </div>

      {msg && <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${msg.startsWith('Error') ? 'bg-[rgba(239,68,68,0.06)] text-[#f87171]' : 'bg-[rgba(16,185,129,0.06)] text-[#34d399]'}`}>{msg}</div>}

      {/* Basic info */}
      <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 mb-6 neon-border">
        <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-4">Basic Info</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-dim mb-1 block">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs text-dim mb-1 block">Brand</label>
            <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
              className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs text-dim mb-1 block">Slug</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs text-dim mb-1 block">Price (INR)</label>
            <input type="number" value={form.price_inr} onChange={e => setForm(f => ({ ...f, price_inr: e.target.value }))}
              className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs text-dim mb-1 block">Released At</label>
            <input value={form.released_at} onChange={e => setForm(f => ({ ...f, released_at: e.target.value }))}
              placeholder="YYYY-MM-DD"
              className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan" style={inputStyle} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-dim mb-1 block">Image URL</label>
            <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan" style={inputStyle} />
          </div>
        </div>
        {form.image_url && (
          <div className="mb-3 bg-[rgba(255,255,255,0.02)] rounded-xl p-3 flex items-center gap-3">
            <img src={form.image_url} alt="Preview" className="h-16 object-contain" />
            <span className="text-xs text-[rgba(255,255,255,0.4)]">Image preview</span>
          </div>
        )}
        <button onClick={handleSave} disabled={saving}
          className="bg-gradient-to-r from-neon-violet to-neon-cyan text-black font-semibold rounded-xl px-5 py-2 text-sm transition disabled:opacity-50">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      {/* Specs */}
      <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 neon-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-dim uppercase tracking-wide">Specs ({specs.length})</h2>
          <button onClick={addSpec} className="text-xs text-neon-cyan border border-[rgba(6,182,212,0.2)] px-3 py-1.5 rounded-lg hover:bg-[rgba(6,182,212,0.06)] transition">
            + Add spec
          </button>
        </div>
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-xs font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-widest mb-2">{cat}</p>
              <div className="space-y-2">
                {specs.filter(s => s.category === cat).map(spec => (
                  <div key={spec.id} className="flex items-center gap-2">
                    <input value={spec.category} onChange={e => updateSpec(spec.id, e.target.value)}
                      onBlur={() => supabase.from('laptop_specs').update({ category: spec.category }).eq('id', spec.id)}
                      className="border border-[rgba(255,255,255,0.06)] rounded-lg px-2 py-1.5 text-xs w-28 focus:outline-none focus:border-neon-cyan" style={inputStyle} />
                    <input value={spec.label} onChange={e => setSpecs(prev => prev.map(s => s.id === spec.id ? { ...s, label: e.target.value } : s))}
                      onBlur={() => supabase.from('laptop_specs').update({ label: spec.label }).eq('id', spec.id)}
                      className="border border-[rgba(255,255,255,0.06)] rounded-lg px-2 py-1.5 text-xs w-32 focus:outline-none focus:border-neon-cyan" style={inputStyle} />
                    <input value={spec.value} onChange={e => updateSpec(spec.id, e.target.value)}
                      onBlur={() => saveSpec(spec)}
                      className="border border-[rgba(255,255,255,0.06)] rounded-lg px-2 py-1.5 text-xs flex-1 focus:outline-none focus:border-neon-cyan" style={inputStyle} />
                    <button onClick={() => deleteSpec(spec.id)} className="text-red-400 hover:text-red-600 text-xs px-2">✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
