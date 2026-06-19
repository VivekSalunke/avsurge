'use client'
import Link from 'next/link'
import { useState } from 'react'
import SearchBar from './SearchBar'
import NavAuth from './NavAuth'

const NavDropdown = ({ label, items }: { label: string, items: { href: string, label: string, desc: string }[] }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition py-1">
        {label}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden min-w-48">
          {items.map(item => (
            <Link key={item.href} href={item.href}
              className="flex flex-col px-4 py-3 hover:bg-blue-50 transition border-b border-gray-50 last:border-0">
              <span className="text-sm font-medium text-gray-800">{item.label}</span>
              <span className="text-xs text-gray-400">{item.desc}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">AV</div>
            <span className="font-bold text-gray-900 text-lg">AVSurge</span>
          </Link>
          <div className="hidden md:flex gap-5 text-sm text-gray-500 items-center">
            <NavDropdown label="Phones" items={[
              { href: '/phones', label: 'All Phones', desc: 'Browse all 228+ phones' },
              { href: '/compare', label: 'Compare Phones', desc: 'Side by side comparison' },
              { href: '/finder', label: 'Phone Finder', desc: 'Find by budget & specs' },
              { href: '/brands', label: 'Brands', desc: 'Browse by brand' },
              { href: '/search', label: 'Advanced Search', desc: 'Filter by price, 5G, brand' },
            ]} />
            <NavDropdown label="Tablets" items={[
              { href: '/tablets', label: 'All Tablets', desc: 'Browse all tablets' },
              { href: '/compare-tablets', label: 'Compare Tablets', desc: 'Side by side comparison' },
            ]} />
            <Link href="/news" className="hover:text-blue-600 transition">News</Link>
            <Link href="/finder" className="hover:text-blue-600 transition">Finder</Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SearchBar />
          <NavAuth />
        </div>
      </div>
    </nav>
  )
}
