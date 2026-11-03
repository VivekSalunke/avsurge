'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
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
  store: VariantStore
  store_url: string
}

const EMPTY_ROW: Row = { id: null, ram_gb: '', storage_gb: '', price_inr: '', store: 'amazon', store_url: '' }

const toRow = (v: DeviceVariant): Row => ({
  id: v.id,
  ram_gb: String(v.ram_gb),
  storage_gb: String(v.storage_gb),
  price_inr: String(v.price_inr),
  store: v.store,
  store_url: v.store_url || '',
})

const inputClass =
  'w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-neon-cyan'

export default function VariantsEditor({
  kind,
  deviceId,
  onChange,
}: {
  kind: DeviceKind
  deviceId: number | string
  onChange?: (variants: DeviceVariant[]) => void
}) {
  const { table, deviceColumn } = VARIANT_TABLES[kind]
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
    store: r.store,
    store_url: r.store_url.trim() || null,
  })

  const friendlyError = (msg: string) =>
    msg.includes('duplicate key') ? `This ${kind} already has a variant with that RAM and storage` : msg

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
    if (!window.confirm(`Delete the ${formatVariantLabel(parseInt(r.ram_gb), parseInt(r.storage_gb))} variant?`)) return
    await run(
      async () => await supabase.from(table).delete().eq('id', r.id!),
      'Variant deleted'
    )
  }

  const updateRow = (i: number, field: keyof Row, value: string) =>
    setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))

  const storeOptions = (Object.keys(STORE_LABELS) as VariantStore[]).map(s => (
    <option key={s} value={s} style={{ backgroundColor: '#152030', color: '#e6eef8' }}>{STORE_LABELS[s]}</option>
  ))

  const header = (
    <div className="grid grid-cols-12 gap-2 text-[10px] uppercase tracking-wide text-[rgba(255,255,255,0.4)] mb-1">
      <div className="col-span-2">RAM (GB)</div>
      <div className="col-span-2">Storage (GB)</div>
      <div className="col-span-2">Price (₹)</div>
      <div className="col-span-2">Store</div>
      <div className="col-span-2">Link (optional)</div>
      <div className="col-span-2" />
    </div>
  )

  return (
    <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 mb-6 neon-border">
      <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-1">Variants</h2>
      <p className="text-xs text-[rgba(255,255,255,0.4)] mb-4">
        Each RAM + storage combination sold in India. The {kind}&apos;s starting price is set automatically to the
        cheapest variant. Changes here save immediately. 1 TB = 1024. Pick the store that sells it; the link is
        optional (without one, the Buy button searches that store).
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

      {header}
      <div className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <div key={r.id} className="grid grid-cols-12 gap-2 items-center">
            <input type="number" min="1" className={`col-span-2 ${inputClass}`} value={r.ram_gb}
              onChange={e => updateRow(i, 'ram_gb', e.target.value)} />
            <input type="number" min="1" className={`col-span-2 ${inputClass}`} value={r.storage_gb}
              onChange={e => updateRow(i, 'storage_gb', e.target.value)} />
            <input type="number" min="1" className={`col-span-2 ${inputClass}`} value={r.price_inr}
              onChange={e => updateRow(i, 'price_inr', e.target.value)} />
            <select className={`col-span-2 ${inputClass}`} value={r.store}
              onChange={e => updateRow(i, 'store', e.target.value)}>
              {storeOptions}
            </select>
            <input className={`col-span-2 ${inputClass}`} value={r.store_url} placeholder="https://…"
              onChange={e => updateRow(i, 'store_url', e.target.value)} />
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" disabled={busy} onClick={() => saveVariant(r)}
                className="text-xs text-neon-cyan hover:underline disabled:opacity-40">Save</button>
              <button type="button" disabled={busy} onClick={() => deleteVariant(r)}
                className="text-xs text-red-400 hover:underline disabled:opacity-40">Delete</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-xs text-[rgba(255,255,255,0.4)] py-2">No variants yet. The manual price above is used.</p>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.06)]">
        <div className="text-xs font-medium text-dim mb-2">Add a variant</div>
        <div className="grid grid-cols-12 gap-2 items-center">
          <input type="number" min="1" placeholder="8" className={`col-span-2 ${inputClass}`} value={newRow.ram_gb}
            onChange={e => setNewRow({ ...newRow, ram_gb: e.target.value })} />
          <input type="number" min="1" placeholder="128" className={`col-span-2 ${inputClass}`} value={newRow.storage_gb}
            onChange={e => setNewRow({ ...newRow, storage_gb: e.target.value })} />
          <input type="number" min="1" placeholder="24999" className={`col-span-2 ${inputClass}`} value={newRow.price_inr}
            onChange={e => setNewRow({ ...newRow, price_inr: e.target.value })} />
          <select className={`col-span-2 ${inputClass}`} value={newRow.store}
            onChange={e => setNewRow({ ...newRow, store: e.target.value as VariantStore })}>
            {storeOptions}
          </select>
          <input placeholder="https://…" className={`col-span-2 ${inputClass}`} value={newRow.store_url}
            onChange={e => setNewRow({ ...newRow, store_url: e.target.value })} />
          <div className="col-span-2 flex justify-end">
            <button type="button" disabled={busy} onClick={addVariant}
              className="text-xs font-semibold text-black bg-[#06b6d4] hover:bg-[#22d3ee] rounded-lg px-3 py-1.5 disabled:opacity-40">+ Add</button>
          </div>
        </div>
      </div>
    </div>
  )
}
