'use client'
import { useState, useEffect } from 'react'
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
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  if (!phone) return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">Phone not found.</main>
  )

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/phones" className="text-sm text-gray-400 hover:text-blue-600">← Phones</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">Edit — {phone.name}</h1>
      </div>

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-6">
          ✓ Saved! Redirecting…
        </div>
      )}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Basic info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Phone name *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Brand *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              value={brand} onChange={e => setBrand(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Price (₹)</label>
            <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              value={price} onChange={e => setPrice(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Current: ₹{phone.price_inr?.toLocaleString('en-IN') || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Release date</label>
            <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              value={releasedAt} onChange={e => setReleasedAt(e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            {imageUrl && (
              <img src={imageUrl} alt="preview" className="mt-2 h-20 object-contain rounded-lg border border-gray-100" />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Specifications</h2>
        <div className="flex flex-col gap-3">
          {specs.map((spec, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <select className="col-span-3 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                value={spec.category} onChange={e => updateSpec(i, 'category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input className="col-span-4 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                value={spec.label} onChange={e => updateSpec(i, 'label', e.target.value)} placeholder="Label" />
              <input className="col-span-4 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} placeholder="Value" />
              <button onClick={() => setSpecs(prev => prev.filter((_, idx) => idx !== i))}
                className="col-span-1 text-red-400 hover:text-red-600 text-lg leading-none">×</button>
            </div>
          ))}
        </div>
        <button onClick={() => setSpecs(prev => [...prev, { category: 'General', label: '', value: '' }])}
          className="mt-4 text-sm text-blue-600 hover:underline">+ Add row</button>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={status === 'saving'}
          className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
        <Link href="/admin/phones"
          className="px-6 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50 transition text-center">
          Cancel
        </Link>
      </div>
    </main>
  )
}
