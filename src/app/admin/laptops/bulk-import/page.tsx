'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const SAMPLE = JSON.stringify([
  {
    name: "Apple MacBook Air 13 M3",
    brand: "Apple",
    price_inr: 114900,
    released_at: "2024-03-08",
    specs: [
      { category: "Performance", label: "Processor", value: "Apple M3" },
      { category: "Performance", label: "CPU Cores", value: "8-core" },
      { category: "Performance", label: "GPU Cores", value: "10-core" },
      { category: "Memory", label: "RAM", value: "8GB" },
      { category: "Memory", label: "RAM Type", value: "Unified Memory" },
      { category: "Storage", label: "Storage", value: "256GB SSD" },
      { category: "Display", label: "Screen Size", value: "13.6 inch" },
      { category: "Display", label: "Resolution", value: "2560 x 1664" },
      { category: "Display", label: "Display Type", value: "Liquid Retina" },
      { category: "Battery", label: "Battery Life", value: "Up to 18 hours" },
      { category: "Build", label: "Weight", value: "1.24 kg" },
      { category: "Build", label: "Color", value: "Midnight, Starlight, Space Grey, Sky Blue" },
      { category: "Connectivity", label: "Ports", value: "2x USB-C, MagSafe, 3.5mm" },
      { category: "Connectivity", label: "WiFi", value: "Wi-Fi 6E" },
      { category: "Connectivity", label: "Bluetooth", value: "5.3" },
      { category: "General", label: "OS", value: "macOS Sonoma" },
    ]
  }
], null, 2)

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function isDuplicate(incoming: string, existing: string): boolean {
  const a = normalize(incoming)
  const b = normalize(existing)
  if (a === b) return true
  const maxLen = Math.max(a.length, b.length)
  if (maxLen < 5) return a === b
  let matches = 0, j = 0
  for (let i = 0; i < a.length && j < b.length; i++) {
    if (a[i] === b[j]) { matches++; j++ }
  }
  const ratio = matches / maxLen
  const lenDiff = Math.abs(a.length - b.length) / maxLen
  return ratio > 0.95 && lenDiff < 0.05
}

function autoSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function BulkImportLaptopsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [json, setJson] = useState(SAMPLE)
  const [status, setStatus] = useState<'idle'|'checking'|'importing'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')
  const [imported, setImported] = useState(0)
  const [duplicates, setDuplicates] = useState<any[]>([])
  const [toImport, setToImport] = useState<any[]>([])
  const [showDuplicates, setShowDuplicates] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) router.push('/login')
    else if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading])

  if (loading) return <div className="flex items-center justify-center min-h-screen text-sm text-gray-400">Loading...</div>
  if (!user || !isAdmin) return null

  const handleImport = async (skipDupes = false, laptopsToImport?: any[]) => {
    setStatus('checking'); setMessage(''); setImported(0)
    let laptops = laptopsToImport
    if (!laptops) {
      try {
        laptops = JSON.parse(json)
        if (!Array.isArray(laptops)) throw new Error('Must be an array')
      } catch (e: any) {
        setMessage('Invalid JSON: ' + e.message); setStatus('error'); return
      }
    }
    const { data: existing } = await supabase.from('laptops').select('id, name, slug')
    const existingNames = (existing || []).map(l => l.name)
    const dupes: any[] = []
    const fresh: any[] = []
    for (const laptop of laptops) {
      const dup = existingNames.find(n => isDuplicate(laptop.name, n))
      if (dup && !skipDupes) dupes.push({ ...laptop, existingName: dup })
      else fresh.push(laptop)
    }
    if (dupes.length > 0 && !skipDupes) {
      setDuplicates(dupes); setToImport(fresh); setShowDuplicates(true); setStatus('idle')
      return
    }
    setStatus('importing')
    let count = 0
    for (const laptop of fresh) {
      const slug = autoSlug(laptop.name)
      const { data: inserted, error } = await supabase.from('laptops').insert({
        name: laptop.name, brand: laptop.brand, slug,
        price_inr: laptop.price_inr || null,
        released_at: laptop.released_at || null,
        image_url: laptop.image_url || null,
      }).select().single()
      if (error || !inserted) continue
      if (laptop.specs && laptop.specs.length > 0) {
        await supabase.from('laptop_specs').insert(
          laptop.specs.map((s: any) => ({ laptop_id: inserted.id, category: s.category, label: s.label, value: s.value }))
        )
      }
      count++
    }
    setImported(count)
    setStatus('success')
    setMessage(`Successfully imported ${count} laptop${count !== 1 ? 's' : ''}`)
    setShowDuplicates(false)
    setDuplicates([])
    setToImport([])
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Bulk Import Laptops</h1>
        <Link href="/admin/laptops" className="text-sm text-blue-600 hover:underline">← Laptop Admin</Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
        Paste a JSON array of laptops. Each laptop can include a <code>specs</code> array with category, label, and value fields.
      </div>

      {showDuplicates && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-3">⚠️ {duplicates.length} duplicate{duplicates.length !== 1 ? 's' : ''} found</h3>
          <div className="space-y-1 mb-4">
            {duplicates.map((d, i) => (
              <p key={i} className="text-xs text-yellow-700">
                <strong>{d.name}</strong> → already exists as "{d.existingName}"
              </p>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleImport(true, toImport)}
              className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition">
              Import {toImport.length} non-duplicates
            </button>
            <button onClick={() => handleImport(true, [...duplicates, ...toImport])}
              className="bg-yellow-600 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-yellow-700 transition">
              Import all anyway
            </button>
            <button onClick={() => setShowDuplicates(false)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm hover:border-gray-400 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-700">
          ✅ {message}
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
          ❌ {message}
        </div>
      )}

      <textarea
        value={json}
        onChange={e => setJson(e.target.value)}
        rows={24}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono mb-4 focus:outline-none focus:border-blue-400"
        style={{ color: '#111827', backgroundColor: '#ffffff' }}
        placeholder="Paste JSON array here..."
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => handleImport()}
          disabled={status === 'importing' || status === 'checking'}
          className="bg-blue-600 text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
          {status === 'importing' ? 'Importing...' : status === 'checking' ? 'Checking...' : 'Import Laptops'}
        </button>
        <button onClick={() => setJson(SAMPLE)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm hover:border-gray-400 transition">
          Load Sample
        </button>
        <Link href="/laptops" className="text-sm text-blue-600 hover:underline ml-auto">
          View Laptops →
        </Link>
      </div>
    </main>
  )
}
