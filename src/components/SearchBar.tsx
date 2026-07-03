'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const TYPE_ICON: Record<string, string> = {
  phone: '📱',
  tablet: '📟',
  laptop: '💻',
}

const TYPE_LABEL: Record<string, string> = {
  phone: 'Phone',
  tablet: 'Tablet',
  laptop: 'Laptop',
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setExpanded(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return }
    const timeout = setTimeout(async () => {
      setLoading(true)
      const res = await fetch('/api/search?q=' + encodeURIComponent(query))
      const data = await res.json()
      setResults(data)
      setOpen(true)
      setLoading(false)
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  const handleExpand = () => {
    setExpanded(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const go = (item: any) => {
    setQuery('')
    setOpen(false)
    setExpanded(false)
    const path = item.type === 'tablet' ? '/tablets/' : item.type === 'laptop' ? '/laptops/' : '/phones/'
    router.push(path + item.slug)
  }

  const handleEnter = () => {
    if (query.length >= 1) {
      router.push('/search?q=' + encodeURIComponent(query))
      setOpen(false)
      setExpanded(false)
      setQuery('')
    }
  }

  return (
    <div ref={ref} className="relative flex items-center">
      {!expanded ? (
        <button
          onClick={handleExpand}
          className="group flex items-center gap-0 overflow-hidden bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl transition-all duration-200 h-9 px-2.5 hover:px-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="max-w-0 group-hover:max-w-xs overflow-hidden whitespace-nowrap transition-all duration-200 text-xs font-medium group-hover:ml-1.5">
            Search
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-white border border-blue-400 rounded-xl px-3 py-2 w-56 shadow-sm">
          <button onClick={handleEnter}>
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 hover:text-blue-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search devices..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            onKeyDown={e => e.key === 'Enter' && handleEnter()}
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
          />
          {loading ? (
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          ) : query ? (
            <button onClick={() => { setQuery(''); setOpen(false) }}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-lg leading-none">×</button>
          ) : null}
        </div>
      )}

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 w-72">
          {results.map(item => (
            <button key={`${item.type}-${item.id}`} onClick={() => go(item)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-100 last:border-0">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} className="object-contain w-full h-full" />
                  : TYPE_ICON[item.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-400">{item.brand} · {TYPE_LABEL[item.type]}</p>
              </div>
              {item.price_inr && (
                <p className="text-xs text-blue-600 font-medium flex-shrink-0">
                  ₹{item.price_inr.toLocaleString('en-IN')}
                </p>
              )}
            </button>
          ))}
          <button onClick={handleEnter}
            className="w-full px-4 py-2.5 text-xs text-blue-600 hover:bg-blue-50 transition text-center border-t border-gray-100">
            See all results for "{query}" →
          </button>
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 z-50 w-72">
          <p className="text-sm text-gray-400">No devices found for "{query}"</p>
        </div>
      )}
    </div>
  )
}
