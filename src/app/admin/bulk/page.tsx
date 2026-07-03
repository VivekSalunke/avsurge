'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const SAMPLE = JSON.stringify([
  {
    name: "Samsung Galaxy S25 Ultra",
    brand: "Samsung",
    price_inr: 134999,
    released_at: "2025-01-22",
    specs: [
      { category: "Display", label: "Screen size", value: "6.9 inch" }
    ]
  }
], null, 2)

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function isDuplicate(incoming: string, existing: string): boolean {
  const a = normalize(incoming)
  const b = normalize(existing)

  // Exact match
  if (a === b) return true

  // Only flag if strings are very similar length AND one contains the other fully
  if (a === b) return true

  // Levenshtein distance for short strings
  const maxLen = Math.max(a.length, b.length)
  if (maxLen < 5) return a === b

  // Count matching characters in sequence
  let matches = 0
  let j = 0
  for (let i = 0; i < a.length && j < b.length; i++) {
    if (a[i] === b[j]) { matches++; j++ }
  }
  const ratio = matches / maxLen

  // Only flag as duplicate if >95% match AND length difference is small
  const lenDiff = Math.abs(a.length - b.length) / maxLen
  return ratio > 0.95 && lenDiff < 0.05
}

export default function BulkImportPage() {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()
  const [json, setJson] = useState(SAMPLE)
  const [status, setStatus] = useState<'idle'|'checking'|'importing'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')
  const [imported, setImported] = useState(0)
  const [duplicates, setDuplicates] = useState<any[]>([])
  const [toImport, setToImport] = useState<any[]>([])
  const [showDuplicates, setShowDuplicates] = useState(false)

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) router.push('/login')
    else if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading, profileLoading])

  const handleImport = async (skipDupes = false, phonesToImport?: any[]) => {
    setStatus('checking'); setMessage(''); setImported(0)

    let phones = phonesToImport
    if (!phones) {
      try {
        phones = JSON.parse(json)
        if (!Array.isArray(phones)) throw new Error('Must be an array')
      } catch (e: any) {
        setMessage('Invalid JSON: ' + e.message); setStatus('error'); return
      }
    }

    const { data: existing } = await supabase.from('phones').select('id, name, slug')
    const existingPhones = existing || []

    const dupes: any[] = []
    const toImportList: any[] = []

    for (const p of phones!) {
      const slug = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const exactSlug = existingPhones.find(e => e.slug === slug)
      if (exactSlug) {
        dupes.push({ incoming: p.name, existing: exactSlug.name, type: 'exact' })
        continue
      }
      const fuzzy = existingPhones.find(e => isDuplicate(e.name, p.name))
      if (fuzzy) {
        dupes.push({ incoming: p.name, existing: fuzzy.name, type: 'similar' })
        continue
      }
      toImportList.push(p)
    }

    if (dupes.length > 0 && !skipDupes) {
      setDuplicates(dupes)
      setToImport(toImportList)
      setShowDuplicates(true)
      setStatus('idle')
      return
    }

    const finalList = skipDupes ? toImportList : phones!
    setStatus('importing')
    let count = 0
    const skipped: string[] = []

    for (const p of finalList) {
      const slug = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const { data: phone, error: e1 } = await supabase
        .from('phones')
        .insert({ slug, name: p.name, brand: p.brand, price_inr: p.price_inr || null, released_at: p.released_at || null })
        .select().single()

      if (e1) { skipped.push(`${p.name} (${e1.message})`); continue }

      if (p.specs?.length > 0) {
        await supabase.from('phone_specs').insert(p.specs.map((s: any) => ({ phone_id: phone.id, ...s })))
      }
      count++
      setImported(count)
    }

    setStatus('success')
    setMessage(`Successfully imported ${count} phones!${skipped.length > 0 ? ` (${skipped.length} errors)` : ''}`)
    setShowDuplicates(false)
    setDuplicates([])
  }

  if (loading || profileLoading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Import</h1>
          <p className="text-sm text-gray-400">Duplicates detected by exact slug + strict name matching</p>
        </div>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">← Admin</Link>
      </div>

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">
          ✓ {message}
        </div>
      )}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{message}</div>
      )}
      {(status === 'importing' || status === 'checking') && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm mb-4">
          {status === 'checking' ? 'Checking for duplicates...' : `Importing... ${imported} done`}
        </div>
      )}

      {showDuplicates && duplicates.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-yellow-800 mb-3">
            ⚠ {duplicates.length} duplicate{duplicates.length > 1 ? 's' : ''} detected — {toImport.length} new phones ready to import
          </p>
          <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
            {duplicates.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-white border border-yellow-200 rounded-lg px-3 py-2">
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${d.type === 'exact' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                  {d.type === 'exact' ? 'Exact' : 'Similar'}
                </span>
                <span className="text-gray-500 truncate">"{d.incoming}"</span>
                <span className="text-gray-400 flex-shrink-0">→</span>
                <span className="text-gray-700 font-medium truncate">"{d.existing}"</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleImport(true, toImport)}
              className="flex-1 bg-yellow-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-yellow-600 transition">
              Skip duplicates & import {toImport.length} new phones
            </button>
            <button
              onClick={() => { setShowDuplicates(false); setDuplicates([]) }}
              className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      <textarea
        className="w-full h-96 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-blue-400 mb-4 resize-none"
        value={json}
        onChange={e => { setJson(e.target.value); setShowDuplicates(false); setDuplicates([]) }}
      />

      <button
        onClick={() => handleImport(false)}
        disabled={status === 'importing' || status === 'checking'}
        className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
        {status === 'importing' ? `Importing... (${imported} done)` : status === 'checking' ? 'Checking...' : 'Import phones'}
      </button>
    </main>
  )
}
