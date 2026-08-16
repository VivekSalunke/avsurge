'use client'
import Link from 'next/link'
import { useState } from 'react'
import SearchBar from './SearchBar'
import NavAuth from './NavAuth'
import AILogo from './AILogo'

type Section = 'phones' | 'tablets' | 'laptops'

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

const SECTION_LINKS: Record<Section, { icon: string; title: string; desc: string; href: string }[]> = {
  phones: [
    { icon: '📱', title: 'All Phones', desc: 'Browse all 250+ phones', href: '/phones' },
    { icon: '⚖️', title: 'Compare Phones', desc: 'Side-by-side comparison', href: '/compare' },
    { icon: '🔍', title: 'Search & Discover', desc: 'Filter, find and AI search', href: '/search' },
    { icon: '✨', title: 'AI Recommender', desc: 'Get personalized picks', href: '/ai-recommend' },
  ],
  tablets: [
    { icon: '📟', title: 'All Tablets', desc: 'Browse all tablets', href: '/tablets' },
    { icon: '⚖️', title: 'Compare Tablets', desc: 'Side-by-side comparison', href: '/compare-tablets' },
    { icon: '🔍', title: 'Search & Discover', desc: 'Filter, find and AI search', href: '/search' },
  ],
  laptops: [
    { icon: '💻', title: 'All Laptops', desc: 'Browse all laptops', href: '/laptops' },
    { icon: '⚖️', title: 'Compare Laptops', desc: 'Side-by-side comparison', href: '/compare-laptops' },
    { icon: '🔍', title: 'Search & Discover', desc: 'Filter, find and AI search', href: '/search' },
  ],
}

const BUDGET_CHIPS: Record<Section, [string, string][]> = {
  phones: [
    ['₹10,000', '/best-phones/10000'],
    ['₹15,000', '/best-phones/15000'],
    ['₹20,000', '/best-phones/20000'],
    ['₹30,000', '/best-phones/30000'],
    ['₹50,000', '/best-phones/50000'],
  ],
  tablets: [
    ['₹20,000', '/best-tablets/20000'],
    ['₹30,000', '/best-tablets/30000'],
    ['₹50,000', '/best-tablets/50000'],
  ],
  laptops: [
    ['₹40,000', '/best-laptops/40000'],
    ['₹60,000', '/best-laptops/60000'],
    ['₹80,000', '/best-laptops/80000'],
    ['₹1,00,000', '/best-laptops/100000'],
  ],
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobilePhoneOpen, setMobilePhoneOpen] = useState(false)
  const [mobileTabletOpen, setMobileTabletOpen] = useState(false)
  const [mobileLaptopOpen, setMobileLaptopOpen] = useState(false)
  const [active, setActive] = useState<Section | null>(null)

  const toggle = (s: Section) => setActive(a => (a === s ? null : s))

  return (
    <nav onMouseLeave={() => setActive(null)} className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.82)] backdrop-blur-xl shadow-[0_1px_0_0_rgba(139,92,246,0.04),0_8px_30px_rgba(0,0,0,0.35)]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)} onMouseEnter={() => setActive(null)}>
            <div className="w-8 h-8 bg-gradient-to-r from-neon-cyan to-neon-violet rounded-lg flex items-center justify-center text-black text-sm font-bold">AV</div>
            <span className="font-bold text-white text-lg">AVSurge</span>
          </Link>
          {/* Desktop nav */}
          <div className="hidden md:flex gap-5 text-sm text-[rgba(255,255,255,0.75)] items-center">
            <button
              onMouseEnter={() => setActive('phones')}
              onClick={() => toggle('phones')}
              className={`flex items-center gap-1 py-1 transition ${active === 'phones' ? 'text-neon-cyan' : 'hover:text-neon-cyan'}`}>
              Phones <Chevron open={active === 'phones'} />
            </button>
            <button
              onMouseEnter={() => setActive('tablets')}
              onClick={() => toggle('tablets')}
              className={`flex items-center gap-1 py-1 transition ${active === 'tablets' ? 'text-neon-cyan' : 'hover:text-neon-cyan'}`}>
              Tablets <Chevron open={active === 'tablets'} />
            </button>
            <button
              onMouseEnter={() => setActive('laptops')}
              onClick={() => toggle('laptops')}
              className={`flex items-center gap-1 py-1 transition ${active === 'laptops' ? 'text-neon-cyan' : 'hover:text-neon-cyan'}`}>
              Laptops <Chevron open={active === 'laptops'} />
            </button>
            <Link href="/brands" onMouseEnter={() => setActive(null)} className="py-1 hover:text-neon-cyan transition">Brands</Link>
            <Link href="/leaderboard" onMouseEnter={() => setActive(null)} className="py-1 hover:text-neon-cyan transition">Leaderboard</Link>
            <Link href="/news" onMouseEnter={() => setActive(null)} className="py-1 hover:text-neon-cyan transition">News</Link>
            <Link href="/ai-recommend" onMouseEnter={() => setActive(null)} className="flex items-center gap-1.5 text-neon-violet hover:text-neon-violet/90 font-medium transition bg-[rgba(139,92,246,0.06)] pl-1 pr-3 py-1 rounded-full"><AILogo size="xs" /> AI</Link>
          </div>
        </div>

        <div className="flex items-center gap-2" onMouseEnter={() => setActive(null)}>
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

      {/* Second-row tab bar */}
      {active && (
        <div className="hidden md:block border-t border-[rgba(255,255,255,0.06)] bg-[rgba(13,15,20,0.96)] backdrop-blur-xl dropdown-anim">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-2.5">
              {SECTION_LINKS[active].map(l => (
                <Link key={l.href} href={l.href} onClick={() => setActive(null)}
                  className="group flex min-w-56 items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] px-4 py-2.5 transition hover:border-neon-violet hover:bg-[rgba(139,92,246,0.07)]">
                  <span className="text-lg">{l.icon}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-white transition-colors group-hover:text-neon-cyan">{l.title}</span>
                    <span className="block text-xs text-[rgba(255,255,255,0.55)]">{l.desc}</span>
                  </span>
                  <svg className="w-4 h-4 text-neon-cyan opacity-0 transition group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[rgba(255,255,255,0.06)] pt-3.5">
              <span className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-medium">Browse by budget:</span>
              {BUDGET_CHIPS[active].map(([label, href]) => (
                <Link key={href} href={href} onClick={() => setActive(null)}
                  className="neon-badge rounded-full border border-[rgba(6,182,212,0.15)] px-3 py-1 text-xs hover:border-neon-cyan hover:bg-[rgba(6,182,212,0.1)] transition">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(255,255,255,0.06)] bg-[var(--panel)] px-4 py-3 space-y-1">
          {/* Phones section */}
          <button
            onClick={() => setMobilePhoneOpen(!mobilePhoneOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.02)] rounded-xl">
            📱 Phones
            <Chevron open={mobilePhoneOpen} />
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
            <Chevron open={mobileTabletOpen} />
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
            <Chevron open={mobileLaptopOpen} />
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
