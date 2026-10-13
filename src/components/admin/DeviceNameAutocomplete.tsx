'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Match = { id: number; name: string; brand: string | null; price_inr: number | null }

type Props = {
  value: string
  onChange: (v: string) => void
  table?: 'phones' | 'tablets' | 'laptops'
  placeholder?: string
  className?: string
  style?: React.CSSProperties
}

export default function DeviceNameAutocomplete({
  value,
  onChange,
  table = 'phones',
  placeholder,
  className,
  style,
}: Props) {
  const [matches, setMatches] = useState<Match[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  // Debounced search: waits 250ms after the last keystroke
  useEffect(() => {
    const q = value.trim()
    if (q.length < 2) {
      setMatches([])
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      // Every word must appear in the name, so "s26 ultra" matches "Samsung Galaxy S26 Ultra"
      let query = supabase.from(table).select('id, name, brand, price_inr').limit(8)
      for (const word of q.split(/\s+/)) {
        const safe = word.replace(/[%_,()]/g, '')
        if (safe) query = query.ilike('name', `%${safe}%`)
      }
      const { data, error } = await query
      if (!error) setMatches((data as Match[]) || [])
      setLoading(false)
    }, 250)
    return () => clearTimeout(t)
  }, [value, table])

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const exact = matches.find(
    (m) => m.name.trim().toLowerCase() === value.trim().toLowerCase()
  )

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={className}
        style={style}
        autoComplete="off"
      />

      {exact && (
        <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>
          ⚠ &quot;{exact.name}&quot; already exists. Don&apos;t add it again.
        </p>
      )}

      {open && value.trim().length >= 2 && (matches.length > 0 || loading) && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            marginTop: 4,
            background: '#152030',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            maxHeight: 280,
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ padding: '6px 12px', fontSize: 11, color: '#94a3b8' }}>
            {loading ? 'Searching…' : 'Already in database:'}
          </div>
          {matches.map((m) => (
            <div
              key={m.id}
              style={{
                padding: '8px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                fontSize: 14,
                color: '#e5e7eb',
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span>
                {m.name}
                {m.brand ? <span style={{ color: '#94a3b8' }}> · {m.brand}</span> : null}
              </span>
              {m.price_inr ? (
                <span style={{ color: '#94a3b8' }}>₹{m.price_inr.toLocaleString('en-IN')}</span>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
