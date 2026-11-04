'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Connectivity,
  CONNECTIVITY_LABELS,
  DeviceKind,
  DeviceVariant,
  VARIANT_TABLES,
  VariantStore,
  STORE_LABELS,
  STORE_URL_PATTERNS,
  formatVariantLabel,
  sortVariants,
} from '@/lib/variants'

interface Row {
  id: number | null
  ram_gb: string
  storage_gb: string
  price_inr: string
  released_at: string
  connectivity: Connectivity
  store: VariantStore
  store_url: string
}

const EMPTY_ROW: Row = {
  id: null, ram_gb: '', storage_gb: '', price_inr: '', released_at: '', connectivity: 'wifi', store: 'amazon', store_url: '',
}

const toRow = (v: DeviceVariant): Row => ({
  id: v.id,
  ram_gb: String(v.ram_gb),
  storage_gb: String(v.storage_gb),
  price_inr: String(v.price_inr),
  released_at: v.released_at ?? '',
  connectivity: v.connectivity ?? 'wifi',
  store: v.store,
  store_url: v.store_url || '',
})

const inputClass =
  'w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-neon-cyan'
const labelClass = 'block text-[10px] uppercase tracking-wide text-[rgba(255,255,255,0.4)] mb-1'
const optionStyle = { backgroundColor: '#152030', color: '#e6eef8' }
const dateStyle = { colorScheme: 'dark' as const }

export default function VariantsEditor({
  kind,
  deviceId,
  onChange,
}: {
  kind: DeviceKind
  deviceId: number | string
  onChange?: (variants: DeviceVariant[]) => void
}) {
  const { table, deviceColumn, hasConnectivity } = VARIANT_TABLES[kind]
  const [rows, setRows] = useState<Row[]>([])
  const [newRow, setNewRow] = useState<Row>(EMPTY_ROW)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(deviceColumn, deviceId)
    if (error) {
      setMessage({ type: 'error', text: `Could not load variants: ${error.message}` })
      return
    }
    const list = sortVariants((data || []) as DeviceVariant[])
    setRows(list.map(toRow))
    onChange?.(list)
  }, [table, deviceColumn, deviceId, onChange])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!cancelled) await reload()
    })()
    return () => { cancelled = true }
  }, [reload])

  const validate = (r: Row): string | null => {
    const ram = parseInt(r.ram_gb), storage = parseInt(r.storage_gb), price = parseInt(r.price_inr)
    if (!ram || ram <= 0) return 'RAM must be a positive number of GB'
    if (!storage || storage <= 0) return 'Storage must be a positive number of GB (1 TB = 1024)'
    if (!price || price <= 0) return 'Price must be a positive number'
    const link = r.store_url.trim()
    if (link && !STORE_URL_PATTERNS[r.store].test(link)) {
      return r.store === 'amazon'
        ? 'Amazon link must start with https://www.amazon.in/'
        : 'Flipkart link must start with https://www.flipkart.com/'
    }
    return null
  }

  const payload = (r: Row) => ({
    ram_gb: parseInt(r.ram_gb),
    storage_gb: parseInt(r.storage_gb),
    price_inr: parseInt(r.price_inr),
    released_at: r.released_at || null,
    store: r.store,
    store_url: r.store_url.trim() || null,
    // Only tablet_variants has this column
    ...(hasConnectivity ? { connectivity: r.connectivity } : {}),
  })

  const friendlyError = (msg: string) =>
    msg.includes('duplicate key')
      ? `This ${kind} already has a variant with that RAM${hasConnectivity ? ', storage and connectivity' : ' and storage'}`
      : msg

  const run = async (action: () => Promise<{ error: { message: string } | null }>, okText: string) => {
    setBusy(true)
    setMessage(null)
    const { error } = await action()
    if (error) {
      setMessage({ type: 'error', text: friendlyError(error.message) })
    } else {
      setMessage({ type: 'ok', text: okText })
      await reload()
    }
    setBusy(false)
    return !error
  }

  const addVariant = async () => {
    const problem = validate(newRow)
    if (problem) { setMessage({ type: 'error', text: problem }); return }
    const ok = await run(
      async () => await supabase.from(table).insert({ [deviceColumn]: deviceId, ...payload(newRow) }),
      'Variant added'
    )
    if (ok) setNewRow(EMPTY_ROW)
  }

  const saveVariant = async (r: Row) => {
    const problem = validate(r)
    if (problem) { setMessage({ type: 'error', text: problem }); return }
    await run(
      async () => await supabase.from(table).update(payload(r)).eq('id', r.id!),
      'Variant saved'
    )
  }

  const deleteVariant = async (r: Row) => {
    const label = formatVariantLabel(parseInt(r.ram_gb), parseInt(r.storage_gb), hasConnectivity ? r.connectivity : undefined)
    if (!window.confirm(`Delete the ${label} variant?`)) return
    await run(
      async () => await supabase.from(table).delete().eq('id', r.id!),
      'Variant deleted'
    )
  }

  const storeOptions = (Object.keys(STORE_LABELS) as VariantStore[]).map(s => (
    <option key={s} value={s} style={optionStyle}>{STORE_LABELS[s]}</option>
  ))
  const connectivityOptions = (Object.keys(CONNECTIVITY_LABELS) as Connectivity[]).map(c => (
    <option key={c} value={c} style={optionStyle}>{CONNECTIVITY_LABELS[c]}</option>
  ))

  /** One variant's fields, used for existing rows and the "add" row */
  const fields = (r: Row, set: (field: keyof Row, value: string) => void, isNew: boolean) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div>
        <label className={labelClass}>RAM (GB)</label>
        <input type="number" min="1" placeholder={isNew ? '8' : undefined} className={inputClass}
          value={r.ram_gb} onChange={e => set('ram_gb', e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Storage (GB)</label>
        <input type="number" min="1" placeholder={isNew ? '256' : undefined} className={inputClass}
          value={r.storage_gb} onChange={e => set('storage_gb', e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Price (₹)</label>
        <input type="number" min="1" placeholder={isNew ? '24999' : undefined} className={inputClass}
          value={r.price_inr} onChange={e => set('price_inr', e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Launch date</label>
        <input type="date" className={inputClass} style={dateStyle}
          value={r.released_at} onChange={e => set('released_at', e.target.value)} />
      </div>
      {hasConnectivity && (
        <div>
          <label className={labelClass}>Connectivity</label>
          <select className={inputClass} value={r.connectivity} onChange={e => set('connectivity', e.target.value)}>
            {connectivityOptions}
          </select>
        </div>
      )}
      <div>
        <label className={labelClass}>Store</label>
        <select className={inputClass} value={r.store} onChange={e => set('store', e.target.value)}>
          {storeOptions}
        </select>
      </div>
      <div className={hasConnectivity ? 'col-span-2' : 'col-span-2 sm:col-span-3'}>
        <label className={labelClass}>Link (optional)</label>
        <input placeholder="https://…" className={inputClass}
          value={r.store_url} onChange={e => set('store_url', e.target.value)} />
      </div>
    </div>
  )

  return (
    <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 mb-6 neon-border">
      <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-1">Variants</h2>
      <p className="text-xs text-[rgba(255,255,255,0.4)] mb-4">
        Add the base variant first, then later RAM/storage versions or special editions
        {hasConnectivity ? ' (Wi-Fi and Cellular versions separately)' : ''}. The {kind}&apos;s starting price is the
        cheapest variant and its release date is the earliest launch date, both set automatically. Changes here save
        immediately. 1 TB = 1024. Without a link, the Buy button searches the chosen store.
      </p>

      {message && (
        <div
          className={`rounded-lg px-3 py-2 text-xs mb-4 border ${
            message.type === 'ok'
              ? 'bg-[rgba(16,185,129,0.06)] border-[rgba(16,185,129,0.2)] text-[#34d399]'
              : 'bg-[rgba(239,68,68,0.06)] border-[rgba(239,68,68,0.2)] text-[#f87171]'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {rows.map((r, i) => (
          <div key={r.id} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.015)] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[rgba(255,255,255,0.75)]">
                {i === 0 ? 'Base variant' : `Variant ${i + 1}`}
              </span>
              <div className="flex gap-3">
                <button type="button" disabled={busy} onClick={() => saveVariant(r)}
                  className="text-xs text-[#22d3ee] hover:underline disabled:opacity-40">Save</button>
                <button type="button" disabled={busy} onClick={() => deleteVariant(r)}
                  className="text-xs text-red-400 hover:underline disabled:opacity-40">Delete</button>
              </div>
            </div>
            {fields(r, (field, value) =>
              setRows(prev => prev.map((x, idx) => (idx === i ? { ...x, [field]: value } : x))), false)}
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-xs text-[rgba(255,255,255,0.4)] py-1">No variants yet. The manual price and release date below are used.</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-dim">{rows.length === 0 ? 'Add the base variant' : 'Add a variant'}</span>
          <button type="button" disabled={busy} onClick={addVariant}
            className="text-xs font-semibold text-black bg-[#06b6d4] hover:bg-[#22d3ee] rounded-lg px-3 py-1.5 disabled:opacity-40">+ Add</button>
        </div>
        {fields(newRow, (field, value) => setNewRow(prev => ({ ...prev, [field]: value })), true)}
      </div>
    </div>
  )
}
