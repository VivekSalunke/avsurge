'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = ['General','Display','Performance','Camera','Battery','Connectivity','Storage','Build']
const DEFAULT_SPECS = [
  { category: 'Display', label: 'Screen size', value: '' },
  { category: 'Display', label: 'Resolution', value: '' },
  { category: 'Display', label: 'Refresh rate', value: '' },
  { category: 'Performance', label: 'Chipset', value: '' },
  { category: 'Performance', label: 'RAM', value: '' },
  { category: 'Storage', label: 'Storage', value: '' },
  { category: 'Camera', label: 'Main camera', value: '' },
  { category: 'Camera', label: 'Front camera', value: '' },
  { category: 'Battery', label: 'Capacity', value: '' },
  { category: 'Battery', label: 'Charging speed', value: '' },
  { category: 'Connectivity', label: '5G', value: '' },
  { category: 'Build', label: 'OS', value: '' },
  { category: 'Build', label: 'Weight', value: '' },
]

export default function AddPhonePage() {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()

  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [releasedAt, setReleasedAt] = useState('')
  const [specs, setSpecs] = useState(DEFAULT_SPECS.map(s => ({ ...s })))
  const [status, setStatus] = useState<'idle'|'saving'|'success'|'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) router.push('/login')
    else if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading, profileLoading])

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const updateSpec = (i: number, field: string, val: string) =>
    setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))

  const handleSubmit = async () => {
    if (!name.trim() || !brand.trim()) { setError('Name and brand are required'); setStatus('error'); return }
    setStatus('saving'); setError('')

    const { data: phone, error: e1 } = await supabase
      .from('phones')
      .insert({ slug, name, brand, price_inr: price ? parseInt(price) : null, image_url: imageUrl || null, released_at: releasedAt || null })
      .select().single()

    if (e1) { setError(e1.message); setStatus('error'); return }

    const validSpecs = specs.filter(s => s.label.trim() && s.value.trim())
    if (validSpecs.length > 0) {
      const { error: e2 } = await supabase.from('phone_specs').insert(validSpecs.map(s => ({ phone_id: phone.id, ...s })))
      if (e2) { setError(e2.message); setStatus('error'); return }
    }

    setStatus('success')
    setName(''); setBrand(''); setPrice(''); setImageUrl(''); setReleasedAt('')
    setSpecs(DEFAULT_SPECS.map(s => ({ ...s })))
  }

  if (loading || profileLoading) return (
    <main className="min-h-screen flex items-center justify-center text-[var(--text)]">
      <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 text-[var(--text)]">
      <h1 className="text-2xl font-bold text-white mb-1">Add a phone</h1>
      <p className="text-sm text-[rgba(255,255,255,0.4)] mb-8">Manually enter phone details into the AVSurge database.</p>

      {status === 'success' && (
        <div className="bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.2)] text-[#34d399] rounded-xl px-4 py-3 text-sm mb-6">
          ✓ Phone saved! <Link href={`/phones/${slug}`} className="underline font-medium">View page →</Link>
        </div>
      )}
      {status === 'error' && (
        <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)] text-[#f87171] rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
      )}

      <div className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(255,255,255,0.06)] p-6 mb-6 neon-border">
        <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-4">Basic info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-dim mb-1">Phone name *</label>
            <input className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              placeholder="e.g. Samsung Galaxy S26 Ultra" value={name} onChange={e => setName(e.target.value)} />
            {name && <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">Slug: {slug}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-dim mb-1">Brand *</label>
            <input className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              placeholder="e.g. Samsung" value={brand} onChange={e => setBrand(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1">Price (₹)</label>
            <input type="number" className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              placeholder="129999" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1">Release date</label>
            <input type="date" className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              value={releasedAt} onChange={e => setReleasedAt(e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-dim mb-1">Image URL</label>
            <input className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(255,255,255,0.06)] p-6 mb-6 neon-border">
        <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-4">Specifications</h2>
        <div className="flex flex-col gap-3">
          {specs.map((spec, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <select className="col-span-3 border border-[rgba(255,255,255,0.06)] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
                value={spec.category} onChange={e => updateSpec(i, 'category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input className="col-span-4 border border-[rgba(255,255,255,0.06)] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
                placeholder="Label" value={spec.label} onChange={e => updateSpec(i, 'label', e.target.value)} />
              <input className="col-span-4 border border-[rgba(255,255,255,0.06)] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
                placeholder="Value" value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} />
              <button onClick={() => setSpecs(prev => prev.filter((_, idx) => idx !== i))}
                className="col-span-1 text-red-400 hover:text-red-600 text-lg leading-none">×</button>
            </div>
          ))}
        </div>
        <button onClick={() => setSpecs(prev => [...prev, { category: 'General', label: '', value: '' }])}
          className="mt-4 text-sm text-neon-cyan hover:underline">+ Add row</button>
      </div>

      <button onClick={handleSubmit} disabled={status === 'saving'}
        className="w-full bg-gradient-to-r from-neon-violet to-neon-cyan text-black font-semibold rounded-xl py-3 text-sm transition disabled:opacity-50">
        {status === 'saving' ? 'Saving…' : 'Save phone'}
      </button>
    </main>
  )
}
