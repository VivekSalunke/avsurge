'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return }
    const timeout = setTimeout(async () => {
      setLoading(true)
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      setOpen(true)
      setLoading(false)
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  const go = (slug: string) => {
    setQuery('')
    setOpen(false)
    router.push(`/phones/${slug}`)
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 w-56 focus-within:bg-white focus-within:border-blue-400 transition">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search phones…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
        />
        {loading && (
          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-72">
          {results.map(phone => (
            <button key={phone.id} onClick={() => go(phone.slug)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-100 last:border-0">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                {phone.image_url
                  ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full" />
                  : '📱'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{phone.name}</p>
                <p className="text-xs text-gray-400">{phone.brand}</p>
              </div>
              {phone.price_inr && (
                <p className="text-xs text-blue-600 font-medium flex-shrink-0">
                  ₹{phone.price_inr.toLocaleString('en-IN')}
                </p>
              )}
            </button>
          ))}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
          </div>
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 z-50 min-w-72">
          <p className="text-sm text-gray-400">No phones found for "{query}"</p>
        </div>
      )}
    </div>
  )
}
