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
      { category: "Display", label: "Screen size", value: "6.9 inch" },
      { category: "Display", label: "Refresh rate", value: "120Hz" },
      { category: "Performance", label: "Chipset", value: "Snapdragon 8 Elite" },
      { category: "Camera", label: "Main camera", value: "200MP" },
      { category: "Battery", label: "Capacity", value: "5000 mAh" }
    ]
  }
], null, 2)

export default function BulkImportPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [json, setJson] = useState(SAMPLE)
  const [status, setStatus] = useState<'idle'|'importing'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')
  const [imported, setImported] = useState(0)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (!loading && user && !isAdmin) router.push('/')
  }, [user, isAdmin, loading])

  const handleImport = async () => {
    setStatus('importing'); setMessage(''); setImported(0)
    let phones
    try {
      phones = JSON.parse(json)
      if (!Array.isArray(phones)) throw new Error('Must be an array')
    } catch (e: any) {
      setMessage('Invalid JSON: ' + e.message); setStatus('error'); return
    }

    let count = 0
    for (const p of phones) {
      const slug = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const { data: phone, error: e1 } = await supabase
        .from('phones')
        .insert({ slug, name: p.name, brand: p.brand, price_inr: p.price_inr || null, released_at: p.released_at || null })
        .select().single()

      if (e1) { setMessage(`Error on "${p.name}": ${e1.message}`); setStatus('error'); return }

      if (p.specs?.length > 0) {
        await supabase.from('phone_specs').insert(p.specs.map((s: any) => ({ phone_id: phone.id, ...s })))
      }
      count++
      setImported(count)
    }

    setStatus('success')
    setMessage(`Successfully imported ${count} phones!`)
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Import</h1>
          <p className="text-sm text-gray-400">Paste a JSON array of phones to import at once</p>
        </div>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">← Admin</Link>
      </div>

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">{message}</div>
      )}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{message}</div>
      )}
      {status === 'importing' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm mb-4">
          Importing... {imported} done
        </div>
      )}

      <textarea
        className="w-full h-96 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-blue-400 mb-4 resize-none"
        value={json}
        onChange={e => setJson(e.target.value)}
      />

      <button
        onClick={handleImport}
        disabled={status === 'importing'}
        className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
        {status === 'importing' ? `Importing... (${imported} done)` : 'Import phones'}
      </button>
    </main>
  )
}
