'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = 'avsurge@admin2026'

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
  const [authed, setAuthed] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)

  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [releasedAt, setReleasedAt] = useState('')
  const [specs, setSpecs] = useState(DEFAULT_SPECS.map(s => ({ ...s })))
  const [status, setStatus] = useState<'idle'|'saving'|'success'|'error'>('idle')
  const [error, setError] = useState('')

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const updateSpec = (i: number, field: string, val: string) =>
    setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))

  const handleLogin = () => {
    if (pwInput === ADMIN_PASSWORD) { setAuthed(true); setPwError(false) }
    else { setPwError(true) }
  }

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

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">AV</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">AVSurge Admin</p>
              <p className="text-xs text-gray-400">Restricted access</p>
            </div>
          </div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
          <input
            type="password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 mb-3"
            placeholder="Enter admin password"
            value={pwInput}
            onChange={e => setPwInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          {pwError && <p className="text-xs text-red-500 mb-3">Incorrect password</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition">
            Login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900">Add a phone</h1>
        <button onClick={() => setAuthed(false)} className="text-xs text-gray-400 hover:text-red-500">Logout</button>
      </div>
      <p className="text-sm text-gray-400 mb-8">Manually enter phone details into the AVSurge database.</p>

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-6">
          ✓ Phone saved! <a href={`/phones/${slug}`} className="underline font-medium">View page →</a>
        </div>
      )}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Basic info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Phone name *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="e.g. Samsung Galaxy S26 Ultra" value={name} onChange={e => setName(e.target.value)} />
            {name && <p className="text-xs text-gray-400 mt-1">Slug: {slug}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Brand *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="e.g. Samsung" value={brand} onChange={e => setBrand(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Price (₹)</label>
            <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="129999" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Release date</label>
            <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              value={releasedAt} onChange={e => setReleasedAt(e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Specifications</h2>
        <div className="flex flex-col gap-3">
          {specs.map((spec, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <select className="col-span-3 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                value={spec.category} onChange={e => updateSpec(i, 'category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input className="col-span-4 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                placeholder="Label" value={spec.label} onChange={e => updateSpec(i, 'label', e.target.value)} />
              <input className="col-span-4 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                placeholder="Value" value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} />
              <button onClick={() => setSpecs(prev => prev.filter((_, idx) => idx !== i))}
                className="col-span-1 text-red-400 hover:text-red-600 text-lg leading-none">×</button>
            </div>
          ))}
        </div>
        <button onClick={() => setSpecs(prev => [...prev, { category: 'General', label: '', value: '' }])}
          className="mt-4 text-sm text-blue-600 hover:underline">+ Add row</button>
      </div>

      <button onClick={handleSubmit} disabled={status === 'saving'}
        className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
        {status === 'saving' ? 'Saving…' : 'Save phone'}
      </button>
    </main>
  )
}
