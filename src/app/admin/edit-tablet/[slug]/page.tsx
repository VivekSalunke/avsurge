'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const CATEGORIES = ['General', 'Display', 'Performance', 'Camera', 'Battery', 'Connectivity', 'Storage', 'Audio', 'Build']

export default function EditTabletPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAdmin, loading: authLoading, profileLoading } = useAuth()
  const [tablet, setTablet] = useState<any>(null)
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [releasedAt, setReleasedAt] = useState('')
  const [specs, setSpecs] = useState<any[]>([])
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (!authLoading && user && !isAdmin) router.push('/')
  }, [user, isAdmin, authLoading])

  useEffect(() => {
    const load = async () => {
      const slug = params?.slug as string
      const { data: t } = await supabase.from('tablets').select('*').eq('slug', slug).single()
      if (!t) { setLoading(false); return }
      setTablet(t)
      setName(t.name)
      setBrand(t.brand)
      setPrice(t.price_inr?.toString() || '')
      setImageUrl(t.image_url || '')
      setReleasedAt(t.released_at || '')
      const { data: s } = await supabase.from('tablet_specs').select('*').eq('tablet_id', t.id).order('id')
      setSpecs(s || [])
      setLoading(false)
    }
    if (!authLoading && isAdmin) load()
  }, [params?.slug, authLoading, isAdmin])

  const updateSpec = (i: number, field: string, val: string) =>
    setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))

  const addSpec = () => setSpecs(prev => [...prev, { category: 'General', label: '', value: '', isNew: true }])

  const removeSpec = (i: number) => setSpecs(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    if (!tablet) return
    setStatus('saving')
    setError('')

    const { error: updateError } = await supabase.from('tablets').update({
      name, brand,
      price_inr: price ? parseInt(price) : null,
      image_url: imageUrl || null,
      released_at: releasedAt || null,
    }).eq('id', tablet.id)

    if (updateError) { setStatus('error'); setError(updateError.message); return }

    // Update existing specs
    for (const spec of specs.filter(s => !s.isNew && s.id)) {
      await supabase.from('tablet_specs').update({
        category: spec.category, label: spec.label, value: spec.value,
      }).eq('id', spec.id)
    }

    // Insert new specs
    const newSpecs = specs.filter(s => s.isNew && s.label && s.value)
    if (newSpecs.length > 0) {
      await supabase.from('tablet_specs').insert(
        newSpecs.map(s => ({ tablet_id: tablet.id, category: s.category, label: s.label, value: s.value }))
      )
    }

    setStatus('success')
    setTimeout(() => router.push(`/tablets/${tablet.slug}`), 1000)
  }

  const inputStyle = { color: '#111827', backgroundColor: '#ffffff' }

  if (authLoading || profileLoading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  if (!tablet) return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-gray-400">Tablet not found.</p>
    </main>
  )

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/tablets" className="text-sm text-gray-400 hover:text-blue-600">← Manage Tablets</Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Tablet</h1>
      </div>

      {/* Basic info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Basic Info</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Tablet Name', value: name, set: setName },
            { label: 'Brand', value: brand, set: setBrand },
            { label: 'Price (₹)', value: price, set: setPrice },
            { label: 'Release Date', value: releasedAt, set: setReleasedAt },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input
                value={value}
                onChange={e => set(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                style={inputStyle}
              />
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Image URL</label>
            <input
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              style={inputStyle}
            />
          </div>
        </div>
        {imageUrl && (
          <div className="mt-4 flex justify-center">
            <img src={imageUrl} alt={name} className="h-32 object-contain rounded-xl border border-gray-100" />
          </div>
        )}
      </div>

      {/* Specs */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Specs ({specs.length})</h2>
          <button onClick={addSpec} className="text-xs text-blue-600 font-medium hover:underline">+ Add spec</button>
        </div>
        <div className="space-y-2">
          {specs.map((spec, i) => (
            <div key={i} className="grid grid-cols-7 gap-2 items-center">
              <select
                value={spec.category}
                onChange={e => updateSpec(i, 'category', e.target.value)}
                className="col-span-2 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                style={inputStyle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input
                value={spec.label}
                onChange={e => updateSpec(i, 'label', e.target.value)}
                placeholder="Label"
                className="col-span-2 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                style={inputStyle}
              />
              <input
                value={spec.value}
                onChange={e => updateSpec(i, 'value', e.target.value)}
                placeholder="Value"
                className="col-span-2 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                style={inputStyle}
              />
              <button onClick={() => removeSpec(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">
          ✅ Tablet updated! Redirecting...
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={status === 'saving'}
        className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-50">
        {status === 'saving' ? 'Saving...' : 'Save Changes'}
      </button>
    </main>
  )
}
