'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ImportTabletsPage() {
  const [json, setJson] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)

  const handleImport = async () => {
    setStatus('loading')
    try {
      const tablets = JSON.parse(json)
      const res = await fetch('/api/tablets/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tablets }),
      })
      const data = await res.json()
      setResult(data)
      setStatus('done')
    } catch (e) {
      setStatus('error')
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 text-[var(--text)]">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-sm text-[rgba(255,255,255,0.4)] hover:text-neon-cyan">← Admin</Link>
        <h1 className="text-2xl font-bold text-white">Import Tablets</h1>
      </div>

      <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 neon-border">
        <label className="block text-sm font-medium text-[rgba(255,255,255,0.85)] mb-2">Paste JSON array of tablets</label>
        <textarea
          value={json}
          onChange={e => setJson(e.target.value)}
          rows={16}
          className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-neon-cyan"
          style={{ color: '#111827', backgroundColor: '#ffffff' }}
          placeholder='[{"name": "iPad Air", "brand": "Apple", "slug": "apple-ipad-air", ...}]'
        />

        <button
          onClick={handleImport}
          disabled={status === 'loading' || !json}
          className="mt-4 w-full bg-gradient-to-r from-neon-violet to-neon-cyan text-black font-semibold rounded-xl py-2.5 text-sm transition disabled:opacity-50">
          {status === 'loading' ? 'Importing...' : 'Import tablets'}
        </button>

        {status === 'done' && result && (
          <div className="mt-4 space-y-3">
            {result.imported > 0 && (
              <div className="bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.2)] rounded-xl p-4">
                <p className="text-[#34d399] font-semibold">✅ Successfully imported {result.imported} tablets!</p>
              </div>
            )}
            {result.duplicates > 0 && (
              <div className="bg-[rgba(251,191,36,0.06)] border border-[rgba(251,191,36,0.2)] rounded-xl p-4">
                <p className="text-[#fbbf24] font-semibold mb-2">⚠ {result.duplicates} duplicates detected — {result.imported} new tablets imported</p>
                <div className="space-y-1">
                  {result.duplicateNames.map((name: string, i: number) => (
                    <p key={i} className="text-xs text-[#fbbf24]">{name}</p>
                  ))}
                </div>
              </div>
            )}
            {result.errors?.length > 0 && (
              <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)] rounded-xl p-4">
                <p className="text-[#f87171] text-sm font-semibold mb-1">❌ {result.errors.length} errors:</p>
                {result.errors.map((e: string, i: number) => (
                  <p key={i} className="text-xs text-[#f87171]">{e}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)] rounded-xl p-4">
            <p className="text-[#f87171] text-sm">Invalid JSON. Please check your input.</p>
          </div>
        )}
      </div>
    </main>
  )
}
