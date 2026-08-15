'use client'
import { useState, useEffect } from 'react'
import { computeSpecScore } from '@/lib/specScore'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const CATEGORIES = ['General','Display','Performance','Camera','Battery','Connectivity','Storage','Build']

export default function EditPhonePage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [phone, setPhone] = useState<any>(null)
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [releasedAt, setReleasedAt] = useState('')
  const [specScoreOverride, setSpecScoreOverride] = useState('')
  const [specs, setSpecs] = useState<any[]>([])
  const [status, setStatus] = useState<'idle'|'saving'|'success'|'error'>('idle')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (!authLoading && user && !isAdmin) router.push('/')
  }, [user, isAdmin, authLoading])

  useEffect(() => {
    const load = async () => {
      const slug = params?.slug as string
      const { data: p } = await supabase.from('phones').select('*').eq('slug', slug).single()
      if (!p) { setLoading(false); return }
      setPhone(p)
      setName(p.name)
      setBrand(p.brand)
      setPrice(p.price_inr?.toString() || '')
      setImageUrl(p.image_url || '')
      setReleasedAt(p.released_at || '')
      setSpecScoreOverride(p.spec_score_override?.toString() ?? '')
      const { data: s } = await supabase.from('phone_specs').select('*').eq('phone_id', p.id).order('id')
      setSpecs(s || [])
      setLoading(false)
    }
    if (!authLoading && isAdmin) load()
  }, [params?.slug, authLoading, isAdmin])

  const updateSpec = (i: number, field: string, val: string) =>
    setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))

  const handleSave = async () => {
    if (!name.trim() || !brand.trim()) { setError('Name and brand required'); setStatus('error'); return }
    setStatus('saving'); setError('')

    const newPrice = price ? parseInt(price) : null

    // Log price change if price changed
    if (newPrice && newPrice !== phone.price_inr) {
      await supabase.from('price_history').insert({
        phone_id: phone.id,
        store: 'Amazon',
        price_inr: newPrice,
      })
    }

    const { error: e1 } = await supabase.from('phones').update({
      name, brand,
      price_inr: newPrice,
      image_url: imageUrl || null,
      released_at: releasedAt || null,
      spec_score_override: specScoreOverride ? parseInt(specScoreOverride) : null,
    }).eq('id', phone.id)

    if (e1) { setError(e1.message); setStatus('error'); return }

    await supabase.from('phone_specs').delete().eq('phone_id', phone.id)
    const validSpecs = specs.filter(s => s.label?.trim() && s.value?.trim())
    if (validSpecs.length > 0) {
      const { error: e2 } = await supabase.from('phone_specs').insert(
        validSpecs.map(s => ({ phone_id: phone.id,
        store: 'Amazon', category: s.category, label: s.label, value: s.value }))
      )
      if (e2) { setError(e2.message); setStatus('error'); return }
    }

    setStatus('success')
    setTimeout(() => router.push('/admin/phones'), 1500)
  }

  if (authLoading || loading) return (
    <main className="min-h-screen flex items-center justify-center text-[var(--text)]">
      <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </main>
  )

  if (!phone) return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center text-[rgba(255,255,255,0.4)]">Phone not found.</main>
  )

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 text-[var(--text)]">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/phones" className="text-sm text-[rgba(255,255,255,0.4)] hover:text-neon-cyan">← Phones</Link>
        <span className="text-[rgba(255,255,255,0.3)]">/</span>
        <h1 className="text-xl font-bold text-white">Edit — {phone.name}</h1>
      </div>

      {status === 'success' && (
        <div className="bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.2)] text-[#34d399] rounded-xl px-4 py-3 text-sm mb-6">
          ✓ Saved! Redirecting…
        </div>
      )}
      {status === 'error' && (
        <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)] text-[#f87171] rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
      )}

      <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 mb-6 neon-border">
        <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-4">Basic info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-dim mb-1">Phone name *</label>
            <input className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-dim mb-1">Brand *</label>
            <input className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              value={brand} onChange={e => setBrand(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1">Price (₹)</label>
            <input type="number" className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              value={price} onChange={e => setPrice(e.target.value)} />
            <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">Current: ₹{phone.price_inr?.toLocaleString('en-IN') || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1">Release date</label>
            <input type="date" className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              value={releasedAt} onChange={e => setReleasedAt(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1">Spec Score Override</label>
            <input type="number" min="0" max="100" className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              value={specScoreOverride} onChange={e => setSpecScoreOverride(e.target.value)} placeholder="Auto-computed" />
            <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">Computed: {computeSpecScore(specs)}/100 · Leave blank to use computed score</p>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-dim mb-1">Image URL</label>
            <input className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            {imageUrl && (
              <img src={imageUrl} alt="preview" className="mt-2 h-20 object-contain rounded-lg border border-[rgba(255,255,255,0.04)]" />
            )}
          </div>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 mb-6 neon-border">
        <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-4">Specifications</h2>
        <div className="flex flex-col gap-3">
          {specs.map((spec, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <select className="col-span-3 border border-[rgba(255,255,255,0.06)] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
                value={spec.category} onChange={e => updateSpec(i, 'category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input className="col-span-4 border border-[rgba(255,255,255,0.06)] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
                value={spec.label} onChange={e => updateSpec(i, 'label', e.target.value)} placeholder="Label" />
              <input className="col-span-4 border border-[rgba(255,255,255,0.06)] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
                value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} placeholder="Value" />
              <button onClick={() => setSpecs(prev => prev.filter((_, idx) => idx !== i))}
                className="col-span-1 text-red-400 hover:text-red-600 text-lg leading-none">×</button>
            </div>
          ))}
        </div>
        <button onClick={() => setSpecs(prev => [...prev, { category: 'General', label: '', value: '' }])}
          className="mt-4 text-sm text-neon-cyan hover:underline">+ Add row</button>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={status === 'saving'}
          className="flex-1 bg-gradient-to-r from-neon-violet to-neon-cyan text-black font-semibold rounded-xl py-3 text-sm transition disabled:opacity-50">
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
        <Link href="/admin/phones"
          className="px-6 py-3 border border-[rgba(255,255,255,0.1)] text-dim rounded-xl text-sm font-medium hover:bg-[rgba(255,255,255,0.02)] hover:text-white transition text-center">
          Cancel
        </Link>
      </div>
    </main>
  )
}
