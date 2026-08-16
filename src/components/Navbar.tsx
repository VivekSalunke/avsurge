'use client'
import Link from 'next/link'
import { useState, useRef } from 'react'
import SearchBar from './SearchBar'
import NavAuth from './NavAuth'
import AILogo from './AILogo'

const phoneItems = [
  { href: '/phones', label: 'All Phones', desc: 'Browse all 250+ phones' },
  { href: '/compare', label: 'Compare Phones', desc: 'Side by side comparison' },
  { href: '/best-phones/20000', label: 'Browse by Budget', desc: 'Filter by price range' },
  { href: '/search', label: 'Search & Discover', desc: 'Filter, find and AI search' },
]

const tabletItems = [
  { href: '/tablets', label: 'All Tablets', desc: 'Browse all tablets' },
  { href: '/compare-tablets', label: 'Compare Tablets', desc: 'Side by side comparison' },
  { href: '/best-tablets/30000', label: 'Browse by Budget', desc: 'Filter by price range' },
]

const laptopItems = [
  { href: '/laptops', label: 'All Laptops', desc: 'Browse all laptops' },
  { href: '/compare-laptops', label: 'Compare Laptops', desc: 'Side by side comparison' },
  { href: '/best-laptops/50000', label: 'Browse by Budget', desc: 'Filter by price range' },
]

const NavDropdown = ({ label, items }: { label: string, items: { href: string, label: string, desc: string }[] }) => {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openMenu = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
    setOpen(true)
  }

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 text-sm transition py-1 ${open ? 'text-neon-cyan' : 'text-[rgba(255,255,255,0.8)] hover:text-neon-cyan'}`}>
        {label}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 pt-2">
          <div className="dropdown-anim min-w-52 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.09)] bg-[rgba(13,15,20,0.94)] shadow-2xl shadow-black/50 backdrop-blur-xl">
            {items.map(item => (
              <Link key={item.href} href={item.href}
                className="flex flex-col border-l-2 border-transparent px-4 py-3 transition hover:border-neon-violet hover:bg-[rgba(139,92,246,0.06)]">
                <span className="text-sm font-medium text-white transition group-hover:text-neon-cyan">{item.label}</span>
                <span className="text-xs text-[rgba(255,255,255,0.6)]">{item.desc}</span>
              </Link>
            ))}
          </div>
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
    <nav className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.82)] backdrop-blur-xl shadow-[0_1px_0_0_rgba(139,92,246,0.04),0_8px_30px_rgba(0,0,0,0.35)]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-r from-neon-cyan to-neon-violet rounded-lg flex items-center justify-center text-black text-sm font-bold">AV</div>
            <span className="font-bold text-white text-lg">AVSurge</span>
          </Link>
          {/* Desktop nav */}
          <div className="hidden md:flex gap-5 text-sm text-[rgba(255,255,255,0.75)] items-center">
            <NavDropdown label="Phones" items={phoneItems} />
            <NavDropdown label="Tablets" items={tabletItems} />
            <NavDropdown label="Laptops" items={laptopItems} />
            <Link href="/brands" className="hover:text-neon-cyan transition">Brands</Link>
            <Link href="/leaderboard" className="hover:text-neon-cyan transition">Leaderboard</Link>
            <Link href="/news" className="hover:text-neon-cyan transition">News</Link>
            <Link href="/ai-recommend" className="flex items-center gap-1.5 text-sm text-neon-violet hover:text-neon-violet/90 font-medium transition bg-[rgba(139,92,246,0.06)] pl-1 pr-3 py-1 rounded-full"><AILogo size="xs" /> AI</Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SearchBar />
          <NavAuth />
          {/* Hamburger button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition">
            <span className={`block w-5 h-0.5 bg-[rgba(255,255,255,0.75)] transition-transform ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[rgba(255,255,255,0.75)] transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[rgba(255,255,255,0.75)] transition-transform ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(255,255,255,0.06)] bg-[var(--panel)] px-4 py-3 space-y-1">
          {/* Phones section */}
          <button
            onClick={() => setMobilePhoneOpen(!mobilePhoneOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.02)] rounded-xl">
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
                  className="block px-3 py-2 text-sm text-[rgba(255,255,255,0.7)] hover:text-neon-cyan hover:bg-[rgba(255,255,255,0.02)] rounded-lg transition">
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Tablets section */}
          <button
            onClick={() => setMobileTabletOpen(!mobileTabletOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.02)] rounded-xl">
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
                  className="block px-3 py-2 text-sm text-[rgba(255,255,255,0.7)] hover:text-neon-cyan hover:bg-[rgba(255,255,255,0.02)] rounded-lg transition">
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Laptops section */}
          <button
            onClick={() => setMobileLaptopOpen(!mobileLaptopOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.02)] rounded-xl">
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
                  className="block px-3 py-2 text-sm text-[rgba(255,255,255,0.7)] hover:text-neon-cyan hover:bg-[rgba(255,255,255,0.02)] rounded-lg transition">
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Direct links */}
          <Link href="/brands" onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.02)] rounded-xl">
            🏷️ Brands
          </Link>
          <Link href="/leaderboard" onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.02)] rounded-xl">
            🏆 Leaderboard
          </Link>
          <Link href="/news" onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.02)] rounded-xl">
            📰 News
          </Link>
          <Link href="/ai-recommend" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-neon-violet hover:bg-[rgba(139,92,246,0.08)] rounded-xl">
            <AILogo size="sm" /> AI Recommender
          </Link>
        </div>
      )}
    </nav>
  )
}
