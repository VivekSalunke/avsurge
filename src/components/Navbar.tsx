'use client'
import Link from 'next/link'
import { useState } from 'react'
import SearchBar from './SearchBar'
import NavAuth from './NavAuth'

const phoneItems = [
  { href: '/phones', label: 'All Phones', desc: 'Browse all 250+ phones' },
  { href: '/compare', label: 'Compare Phones', desc: 'Side by side comparison' },
]

const tabletItems = [
  { href: '/tablets', label: 'All Tablets', desc: 'Browse all tablets' },
  { href: '/compare-tablets', label: 'Compare Tablets', desc: 'Side by side comparison' },
]

const laptopItems = [
  { href: '/laptops', label: 'All Laptops', desc: 'Browse all laptops' },
  { href: '/compare-laptops', label: 'Compare Laptops', desc: 'Side by side comparison' },
  { href: '/best-laptops/50000', label: 'Browse by Budget', desc: 'Filter by price range' },
]

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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobilePhoneOpen, setMobilePhoneOpen] = useState(false)
  const [mobileTabletOpen, setMobileTabletOpen] = useState(false)
  const [mobileLaptopOpen, setMobileLaptopOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">AV</div>
            <span className="font-bold text-gray-900 text-lg">AVSurge</span>
          </Link>
          {/* Desktop nav */}
          <div className="hidden md:flex gap-5 text-sm text-gray-500 items-center">
            <NavDropdown label="Phones" items={phoneItems} />
            <NavDropdown label="Tablets" items={tabletItems} />
            <NavDropdown label="Laptops" items={laptopItems} />
            <Link href="/brands" className="hover:text-blue-600 transition">Brands</Link>
            <Link href="/news" className="hover:text-blue-600 transition">News</Link>
            <Link href="/ai-recommend" className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium transition bg-purple-50 px-3 py-1 rounded-full">🤖 AI</Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SearchBar />
          <NavAuth />
          {/* Hamburger button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition">
            <span className={`block w-5 h-0.5 bg-gray-600 transition-transform ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-600 transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-600 transition-transform ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {/* Phones section */}
          <button
            onClick={() => setMobilePhoneOpen(!mobilePhoneOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
            📱 Phones
            <svg className={`w-4 h-4 transition-transform ${mobilePhoneOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {mobilePhoneOpen && (
            <div className="pl-4 space-y-1">
              {phoneItems.map(item => (
                <Link key={item.href} href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Tablets section */}
          <button
            onClick={() => setMobileTabletOpen(!mobileTabletOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
            📟 Tablets
            <svg className={`w-4 h-4 transition-transform ${mobileTabletOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {mobileTabletOpen && (
            <div className="pl-4 space-y-1">
              {tabletItems.map(item => (
                <Link key={item.href} href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Laptops section */}
          <button
            onClick={() => setMobileLaptopOpen(!mobileLaptopOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
            💻 Laptops
            <svg className={`w-4 h-4 transition-transform ${mobileLaptopOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {mobileLaptopOpen && (
            <div className="pl-4 space-y-1">
              {laptopItems.map(item => (
                <Link key={item.href} href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Direct links */}
          <Link href="/brands" onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
            🏷️ Brands
          </Link>
          <Link href="/news" onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
            📰 News
          </Link>

          <Link href="/ai-recommend" onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-xl">
            🤖 AI Recommender
          </Link>
        </div>
      )}
    </nav>
  )
}
