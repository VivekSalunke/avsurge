'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const LAPTOP_TEMPLATES = [
  { name: 'Apple MacBook Air 13 M3', brand: 'Apple', price_inr: 114900, released_at: '2024-03-08' },
  { name: 'Apple MacBook Air 15 M3', brand: 'Apple', price_inr: 134900, released_at: '2024-03-08' },
  { name: 'Apple MacBook Pro 14 M3', brand: 'Apple', price_inr: 168900, released_at: '2023-11-07' },
  { name: 'Apple MacBook Pro 16 M3 Pro', brand: 'Apple', price_inr: 249900, released_at: '2023-11-07' },
  { name: 'Dell XPS 13 9340', brand: 'Dell', price_inr: 134990, released_at: '2024-01-01' },
  { name: 'Dell XPS 15 9530', brand: 'Dell', price_inr: 169990, released_at: '2023-06-01' },
  { name: 'Dell Inspiron 15 3520', brand: 'Dell', price_inr: 47990, released_at: '2023-01-01' },
  { name: 'HP Pavilion 15', brand: 'HP', price_inr: 52990, released_at: '2023-06-01' },
  { name: 'HP Envy x360 14', brand: 'HP', price_inr: 89990, released_at: '2024-01-01' },
  { name: 'HP Spectre x360 14', brand: 'HP', price_inr: 154990, released_at: '2024-01-01' },
  { name: 'Lenovo IdeaPad Slim 3', brand: 'Lenovo', price_inr: 38990, released_at: '2023-06-01' },
  { name: 'Lenovo IdeaPad Slim 5', brand: 'Lenovo', price_inr: 57990, released_at: '2023-06-01' },
  { name: 'Lenovo ThinkPad X1 Carbon Gen 11', brand: 'Lenovo', price_inr: 154990, released_at: '2023-01-01' },
  { name: 'Lenovo Yoga 7i 14', brand: 'Lenovo', price_inr: 89990, released_at: '2024-01-01' },
  { name: 'ASUS VivoBook 15', brand: 'ASUS', price_inr: 42990, released_at: '2023-06-01' },
  { name: 'ASUS ZenBook 14 OLED', brand: 'ASUS', price_inr: 79990, released_at: '2023-06-01' },
  { name: 'ASUS ROG Strix G15', brand: 'ASUS', price_inr: 119990, released_at: '2023-06-01' },
  { name: 'ASUS TUF Gaming F15', brand: 'ASUS', price_inr: 74990, released_at: '2023-06-01' },
  { name: 'Acer Aspire 5', brand: 'Acer', price_inr: 44990, released_at: '2023-06-01' },
  { name: 'Acer Swift Go 14', brand: 'Acer', price_inr: 69990, released_at: '2023-06-01' },
  { name: 'Acer Predator Helios 300', brand: 'Acer', price_inr: 89990, released_at: '2023-06-01' },
  { name: 'Microsoft Surface Laptop 5', brand: 'Microsoft', price_inr: 109990, released_at: '2022-10-01' },
  { name: 'Microsoft Surface Pro 9', brand: 'Microsoft', price_inr: 119990, released_at: '2022-10-01' },
  { name: 'MSI Modern 14', brand: 'MSI', price_inr: 54990, released_at: '2023-06-01' },
  { name: 'MSI Thin GF63', brand: 'MSI', price_inr: 64990, released_at: '2023-06-01' },
  { name: 'Samsung Galaxy Book3 Pro', brand: 'Samsung', price_inr: 129990, released_at: '2023-02-01' },
  { name: 'Samsung Galaxy Book3 360', brand: 'Samsung', price_inr: 89990, released_at: '2023-02-01' },
  { name: 'LG Gram 14', brand: 'LG', price_inr: 89990, released_at: '2023-01-01' },
  { name: 'LG Gram 16', brand: 'LG', price_inr: 109990, released_at: '2023-01-01' },
  { name: 'Razer Blade 15', brand: 'Razer', price_inr: 189990, released_at: '2023-06-01' },
]

function autoSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function similarity(a: string, b: string) {
  const A = a.toLowerCase(), B = b.toLowerCase()
  if (A === B) return 1
  if (A.includes(B) || B.includes(A)) return 0.9
  const wordsA = A.split(/\s+/), wordsB = B.split(/\s+/)
  const common = wordsA.filter(w => wordsB.includes(w)).length
  return common / Math.max(wordsA.length, wordsB.length)
}

export default function BulkImportLaptops() {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<{ name: string; status: string }[]>([])
  const [existing, setExisting] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  const [search, setSearch] = useState('')

  const loadExisting = async () => {
    const { data } = await supabase.from('laptops').select('name')
    setExisting((data || []).map(l => l.name))
    setLoaded(true)
  }

  const isDuplicate = (name: string) => existing.some(e => similarity(e, name) > 0.8)

  const toggleAll = () => {
    const filtered = LAPTOP_TEMPLATES.filter(l =>
      !isDuplicate(l.name) &&
      (!search || l.name.toLowerCase().includes(search.toLowerCase()) || l.brand.toLowerCase().includes(search.toLowerCase()))
    )
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(l => LAPTOP_TEMPLATES.indexOf(l))))
  }

  const importSelected = async () => {
    setImporting(true)
    setResults([])
    const toImport = LAPTOP_TEMPLATES.filter((_, i) => selected.has(i))
    const res: { name: string; status: string }[] = []
    for (const laptop of toImport) {
      const { error } = await supabase.from('laptops').insert({
        name: laptop.name, brand: laptop.brand,
        slug: autoSlug(laptop.name),
        price_inr: laptop.price_inr,
        released_at: laptop.released_at,
      })
      res.push({ name: laptop.name, status: error ? 'Failed' : 'Imported' })
    }
    setResults(res)
    setImporting(false)
    setSelected(new Set())
    loadExisting()
  }

  const filtered = LAPTOP_TEMPLATES.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.brand.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Bulk Import Laptops</h1>
        <Link href="/admin/laptops" className="text-sm text-blue-600 hover:underline">Back to Laptop Admin</Link>
      </div>
      {!loaded ? (
        <button onClick={loadExisting} className="bg-blue-600 text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-blue-700 transition">
          Load Laptop Templates
        </button>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1" />
            <button onClick={toggleAll} className="border border-gray-200 rounded-xl px-4 py-2 text-sm hover:border-blue-400 transition">Toggle All</button>
            <button onClick={importSelected} disabled={importing || selected.size === 0}
              className="bg-blue-600 text-white rounded-xl px-5 py-2 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {importing ? 'Importing...' : `Import ${selected.size}`}
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left">Select</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Brand</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((laptop) => {
                  const realIdx = LAPTOP_TEMPLATES.indexOf(laptop)
                  const dup = isDuplicate(laptop.name)
                  return (
                    <tr key={realIdx} className={`border-b border-gray-50 ${dup ? 'opacity-40' : ''}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(realIdx)} disabled={dup}
                          onChange={() => {
                            const s = new Set(selected)
                            s.has(realIdx) ? s.delete(realIdx) : s.add(realIdx)
                            setSelected(s)
                          }} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{laptop.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{laptop.brand}</td>
                      <td className="px-4 py-3 text-sm text-blue-600">₹{laptop.price_inr.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-xs">{dup ? <span className="text-orange-500">Exists</span> : <span className="text-green-500">Ready</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {results.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Results</h3>
              {results.map((r, i) => <p key={i} className="text-xs text-gray-600">{r.status === 'Imported' ? '✅' : '❌'} {r.name}</p>)}
            </div>
          )}
        </>
      )}
    </main>
  )
}
