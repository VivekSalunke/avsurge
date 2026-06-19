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
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-blue-600">← Admin</Link>
        <h1 className="text-2xl font-bold text-gray-900">Import Tablets</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Paste JSON array of tablets</label>
        <textarea
          value={json}
          onChange={e => setJson(e.target.value)}
          rows={16}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-400"
          style={{ color: '#111827', backgroundColor: '#ffffff' }}
          placeholder='[{"name": "iPad Air", "brand": "Apple", "slug": "apple-ipad-air", ...}]'
        />

        <button
          onClick={handleImport}
          disabled={status === 'loading' || !json}
          className="mt-4 w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
          {status === 'loading' ? 'Importing...' : 'Import tablets'}
        </button>

        {status === 'done' && result && (
          <div className="mt-4 space-y-3">
            {result.imported > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-700 font-semibold">✅ Successfully imported {result.imported} tablets!</p>
              </div>
            )}
            {result.duplicates > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-yellow-700 font-semibold mb-2">⚠ {result.duplicates} duplicates detected — {result.imported} new tablets imported</p>
                <div className="space-y-1">
                  {result.duplicateNames.map((name: string, i: number) => (
                    <p key={i} className="text-xs text-yellow-600">{name}</p>
                  ))}
                </div>
              </div>
            )}
            {result.errors?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm font-semibold mb-1">❌ {result.errors.length} errors:</p>
                {result.errors.map((e: string, i: number) => (
                  <p key={i} className="text-xs text-red-600">{e}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">Invalid JSON. Please check your input.</p>
          </div>
        )}
      </div>
    </main>
  )
}
