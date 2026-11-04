'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  CATEGORY_LABELS,
  formatLaunchDate,
  todayIST,
  type UpcomingCategory,
  type UpcomingLaunch,
} from '@/lib/upcoming'

interface Form {
  id: number | null
  name: string
  brand: string
  category: UpcomingCategory
  launch_date: string
  source_url: string
  expected_price_note: string
  image_url: string
  highlights: string
  device_slug: string
}

const EMPTY: Form = {
  id: null, name: '', brand: '', category: 'phone', launch_date: '', source_url: '',
  expected_price_note: '', image_url: '', highlights: '', device_slug: '',
}

const inputClass =
  'w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan'
const labelClass = 'block text-xs font-medium text-dim mb-1'
const optionStyle = { backgroundColor: '#152030', color: '#e6eef8' }

const toForm = (i: UpcomingLaunch): Form => ({
  id: i.id,
  name: i.name,
  brand: i.brand,
  category: i.category,
  launch_date: i.launch_date,
  source_url: i.source_url,
  expected_price_note: i.expected_price_note ?? '',
  image_url: i.image_url ?? '',
  highlights: i.highlights.join(', '),
  device_slug: i.device_slug ?? '',
})

export default function AdminUpcomingPage() {
  const [items, setItems] = useState<UpcomingLaunch[]>([])
  const [form, setForm] = useState<Form>(EMPTY)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('upcoming_launches')
      .select('*')
      .order('launch_date', { ascending: false })
    if (error) { setMessage({ type: 'error', text: `Could not load: ${error.message}` }); return }
    setItems((data || []) as UpcomingLaunch[])
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => { if (!cancelled) await load() })()
    return () => { cancelled = true }
  }, [load])

  const set = (field: keyof Form, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const validate = (): string | null => {
    if (!form.name.trim() || !form.brand.trim()) return 'Name and brand are required'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.launch_date)) return 'Launch date is required'
    if (!/^https:\/\//.test(form.source_url.trim())) {
      return 'Source link is required and must start with https:// (official teaser, press release or event page)'
    }
    if (form.image_url.trim() && !/^https:\/\//.test(form.image_url.trim())) return 'Image URL must start with https://'
    if (form.device_slug.trim() && !/^[a-z0-9-]+$/.test(form.device_slug.trim())) {
      return 'Device slug may only contain lowercase letters, numbers and hyphens'
    }
    return null
  }

  const save = async () => {
    const problem = validate()
    if (problem) { setMessage({ type: 'error', text: problem }); return }
    setBusy(true)
    setMessage(null)
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      launch_date: form.launch_date,
      source_url: form.source_url.trim(),
      expected_price_note: form.expected_price_note.trim() || null,
      image_url: form.image_url.trim() || null,
      highlights: form.highlights.split(',').map(h => h.trim()).filter(Boolean).slice(0, 5),
      device_slug: form.device_slug.trim() || null,
    }
    const { error } = form.id
      ? await supabase.from('upcoming_launches').update(payload).eq('id', form.id)
      : await supabase.from('upcoming_launches').insert(payload)
    setBusy(false)
    if (error) { setMessage({ type: 'error', text: error.message }); return }
    setMessage({ type: 'ok', text: form.id ? 'Launch updated' : 'Launch added' })
    setForm(EMPTY)
    await load()
  }

  const remove = async (item: UpcomingLaunch) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return
    setBusy(true)
    const { error } = await supabase.from('upcoming_launches').delete().eq('id', item.id)
    setBusy(false)
    if (error) { setMessage({ type: 'error', text: error.message }); return }
    setMessage({ type: 'ok', text: 'Launch deleted' })
    if (form.id === item.id) setForm(EMPTY)
    await load()
  }

  const today = todayIST()

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-[var(--text)]">
      <h1 className="text-xl font-bold text-white mb-1">Upcoming launches</h1>
      <p className="text-xs text-[rgba(255,255,255,0.45)] mb-6">
        Only add devices whose Indian launch date the brand has confirmed, and link to that announcement.
        Entries show on /upcoming until 14 days after launch. Once the device is on AVSurge, add its slug so the entry links to it.
      </p>

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm mb-6 border ${
            message.type === 'ok'
              ? 'bg-[rgba(16,185,129,0.06)] border-[rgba(16,185,129,0.2)] text-[#34d399]'
              : 'bg-[rgba(239,68,68,0.06)] border-[rgba(239,68,68,0.2)] text-[#f87171]'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 mb-6 neon-border">
        <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-4">
          {form.id ? `Edit — ${form.name}` : 'Add a launch'}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className={labelClass}>Device name *</label>
            <input className={inputClass} value={form.name} placeholder="e.g. OnePlus 15R" onChange={e => set('name', e.target.value)} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className={labelClass}>Brand *</label>
            <input className={inputClass} value={form.brand} placeholder="e.g. OnePlus" onChange={e => set('brand', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select className={inputClass} value={form.category} onChange={e => set('category', e.target.value)}>
              {(Object.keys(CATEGORY_LABELS) as UpcomingCategory[]).map(c => (
                <option key={c} value={c} style={optionStyle}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>India launch date *</label>
            <input type="date" className={inputClass} style={{ colorScheme: 'dark' }} value={form.launch_date}
              onChange={e => set('launch_date', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Official source link * (brand teaser, press release or event page)</label>
            <input className={inputClass} value={form.source_url} placeholder="https://…" onChange={e => set('source_url', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Price note (only what the brand has said)</label>
            <input className={inputClass} value={form.expected_price_note} placeholder="e.g. Brand says under ₹30,000"
              onChange={e => set('expected_price_note', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Confirmed highlights (comma-separated, up to 5)</label>
            <input className={inputClass} value={form.highlights} placeholder="e.g. Snapdragon 8 Elite, 7000mAh battery"
              onChange={e => set('highlights', e.target.value)} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className={labelClass}>Official image URL</label>
            <input className={inputClass} value={form.image_url} placeholder="https://…" onChange={e => set('image_url', e.target.value)} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className={labelClass}>AVSurge slug (after launch)</label>
            <input className={inputClass} value={form.device_slug} placeholder="e.g. oneplus-15r" onChange={e => set('device_slug', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" disabled={busy} onClick={save}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-black disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }}>
            {busy ? 'Saving…' : form.id ? 'Save changes' : 'Add launch'}
          </button>
          {form.id && (
            <button type="button" onClick={() => setForm(EMPTY)}
              className="px-5 rounded-xl border border-[rgba(255,255,255,0.1)] text-sm text-dim hover:text-white">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {items.length === 0 && <p className="text-sm text-[rgba(255,255,255,0.45)]">No launches yet.</p>}
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{item.name}</div>
              <div className="text-xs text-[rgba(255,255,255,0.45)]">
                {CATEGORY_LABELS[item.category]} · {formatLaunchDate(item.launch_date)}
                {item.launch_date < today ? ' · launched' : ''}
                {item.device_slug ? ` · linked to ${item.device_slug}` : ''}
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button type="button" onClick={() => { setForm(toForm(item)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="text-xs text-[#22d3ee] hover:underline">Edit</button>
              <button type="button" disabled={busy} onClick={() => remove(item)}
                className="text-xs text-red-400 hover:underline disabled:opacity-40">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
