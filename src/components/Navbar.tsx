'use client'
import Link from 'next/link'
import { useState } from 'react'
import SearchBar from './SearchBar'
import NavAuth from './NavAuth'
import AILogo from './AILogo'

type Section = 'phones' | 'tablets' | 'laptops' | 'compare' | 'tools'

const TOP_ITEMS: { id: Section; label: string }[] = [
  { id: 'phones', label: 'Phones' },
  { id: 'tablets', label: 'Tablets' },
  { id: 'laptops', label: 'Laptops' },
  { id: 'compare', label: 'Compare' },
  { id: 'tools', label: 'Tools' },
]

const SECTION_LINKS: Record<Section, { icon: string; title: string; desc: string; href: string }[]> = {
  phones: [
    { icon: '📱', title: 'All Phones', desc: 'Browse all 250+ phones', href: '/phones' },
    { icon: '⚖️', title: 'Compare Phones', desc: 'Side-by-side comparison', href: '/compare' },
    { icon: '✨', title: 'AI Recommender', desc: 'Get personalized picks', href: '/ai-recommend' },
    { icon: '🔍', title: 'Search & Discover', desc: 'Filter, find and AI search', href: '/search' },
  ],
  tablets: [
    { icon: '📟', title: 'All Tablets', desc: 'Browse all tablets', href: '/tablets' },
    { icon: '⚖️', title: 'Compare Tablets', desc: 'Side-by-side comparison', href: '/compare-tablets' },
    { icon: '✨', title: 'AI Recommender', desc: 'Get personalized picks', href: '/ai-recommend' },
    { icon: '🔍', title: 'Search & Discover', desc: 'Filter, find and AI search', href: '/search' },
  ],
  laptops: [
    { icon: '💻', title: 'All Laptops', desc: 'Browse all laptops', href: '/laptops' },
    { icon: '⚖️', title: 'Compare Laptops', desc: 'Side-by-side comparison', href: '/compare-laptops' },
    { icon: '✨', title: 'AI Recommender', desc: 'Get personalized picks', href: '/ai-recommend' },
    { icon: '🔍', title: 'Search & Discover', desc: 'Filter, find and AI search', href: '/search' },
  ],
  compare: [
    { icon: '📱', title: 'Compare Phones', desc: 'Two phones side by side', href: '/compare' },
    { icon: '📟', title: 'Compare Tablets', desc: 'Two tablets side by side', href: '/compare-tablets' },
    { icon: '💻', title: 'Compare Laptops', desc: 'Two laptops side by side', href: '/compare-laptops' },
    { icon: '✨', title: 'AI Verdict', desc: 'AI picks the winner for you', href: '/compare' },
  ],
  tools: [
    { icon: '✨', title: 'AI Recommender', desc: 'Personalized device picks', href: '/ai-recommend' },
    { icon: '🔍', title: 'Search & Discover', desc: 'Filter, find and AI search', href: '/search' },
    { icon: '🏆', title: 'Leaderboard', desc: 'Trending devices right now', href: '/leaderboard' },
    { icon: '📖', title: 'Glossary', desc: 'Tech terms explained', href: '/glossary' },
  ],
}

const BUDGET_CHIPS: Record<string, [string, string][]> = {
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

const USE_CASES: Record<string, [string, string][]> = {
  phones: [
    ['🎮 Gaming', '/best-phones-for/gaming'],
    ['📷 Camera', '/best-phones-for/camera'],
    ['🔋 Battery', '/best-phones-for/battery'],
    ['🎓 Students', '/best-phones-for/students'],
    ['📡 5G', '/best-phones-for/5g'],
    ['💼 Business', '/best-phones-for/business'],
  ],
  tablets: [
    ['✏️ Drawing', '/best-tablets-for/drawing'],
    ['🎓 Students', '/best-tablets-for/students'],
    ['🎮 Gaming', '/best-tablets-for/gaming'],
    ['👶 Kids', '/best-tablets-for/kids'],
    ['🎬 Entertainment', '/best-tablets-for/entertainment'],
    ['💼 Work', '/best-tablets-for/work'],
  ],
  laptops: [
    ['🎮 Gaming', '/best-laptops-for/gaming'],
    ['🎬 Video Editing', '/best-laptops-for/video-editing'],
    ['🎓 Students', '/best-laptops-for/students'],
    ['💻 Programming', '/best-laptops-for/programming'],
    ['💼 Business', '/best-laptops-for/business'],
    ['🪶 Lightweight', '/best-laptops-for/lightweight'],
  ],
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSections, setMobileSections] = useState<Record<string, boolean>>({})
  const [active, setActive] = useState<Section | null>(null)

  const toggle = (s: Section) => setActive(a => (a === s ? null : s))
  const toggleMobile = (s: string) => setMobileSections(p => ({ ...p, [s]: !p[s] }))
  const isMobileOpen = (s: string) => !!mobileSections[s]

  const mobileItems: Record<string, { href: string; label: string }[]> = {
    phones: SECTION_LINKS.phones.map(({ href, title }) => ({ href, label: title })),
    tablets: SECTION_LINKS.tablets.map(({ href, title }) => ({ href, label: title })),
    laptops: SECTION_LINKS.laptops.map(({ href, title }) => ({ href, label: title })),
    compare: SECTION_LINKS.compare.slice(0, 3).map(({ href, title }) => ({ href, label: title })),
    tools: SECTION_LINKS.tools.map(({ href, title }) => ({ href, label: title })),
  }

  return (
    <nav onMouseLeave={() => setActive(null)} className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.82)] backdrop-blur-xl shadow-[0_1px_0_0_rgba(139,92,246,0.04),0_8px_30px_rgba(0,0,0,0.35)]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)} onMouseEnter={() => setActive(null)}>
            <div className="w-8 h-8 bg-gradient-to-r from-neon-cyan to-neon-violet rounded-lg flex items-center justify-center text-black text-sm font-bold">AV</div>
            <span className="font-bold text-white text-lg">AVSurge</span>
          </Link>
          {/* Desktop nav */}
          <div className="hidden lg:flex gap-4 text-sm text-[rgba(255,255,255,0.75)] items-center">
            {TOP_ITEMS.map(item => (
              <button
                key={item.id}
                onMouseEnter={() => setActive(item.id)}
                onClick={() => toggle(item.id)}
                className={`flex items-center gap-1 py-1 whitespace-nowrap transition ${active === item.id ? 'text-neon-cyan' : 'hover:text-neon-cyan'}`}>
                {item.label} <Chevron open={active === item.id} />
              </button>
            ))}
            <Link href="/brands" onMouseEnter={() => setActive(null)} className="py-1 whitespace-nowrap hover:text-neon-cyan transition">Brands</Link>
            <Link href="/news" onMouseEnter={() => setActive(null)} className="py-1 whitespace-nowrap hover:text-neon-cyan transition">News</Link>
            <Link href="/about" onMouseEnter={() => setActive(null)} className="py-1 whitespace-nowrap hover:text-neon-cyan transition">About</Link>
          </div>
        </div>

        <div className="flex items-center gap-1.5" onMouseEnter={() => setActive(null)}>
          <SearchBar />
          <Link href="/ai-recommend" title="AI Recommender" onMouseEnter={() => setActive(null)}
            className="group flex items-center gap-0 overflow-hidden bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.09)] rounded-xl transition-all duration-200 h-9 px-2.5 hover:px-3">
            <AILogo size="xs" />
            <span className="max-w-0 group-hover:max-w-xs overflow-hidden whitespace-nowrap transition-all duration-200 text-xs font-medium text-[rgba(255,255,255,0.85)] group-hover:ml-1.5">
              AI
            </span>
          </Link>
          <Link href="/wishlist" title="Wishlist" onMouseEnter={() => setActive(null)}
            className="group hidden sm:flex items-center gap-0 overflow-hidden bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.09)] text-[rgba(255,255,255,0.85)] hover:text-neon-cyan rounded-xl transition-all duration-200 h-9 px-2.5 hover:px-3">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className="max-w-0 group-hover:max-w-xs overflow-hidden whitespace-nowrap transition-all duration-200 text-xs font-medium group-hover:ml-1.5">
              Wishlist
            </span>
          </Link>
          <NavAuth />
          {/* Hamburger button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition">
            <span className={`block w-5 h-0.5 bg-[rgba(255,255,255,0.75)] transition-transform ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[rgba(255,255,255,0.75)] transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[rgba(255,255,255,0.75)] transition-transform ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Second-row tab bar */}
      {active && (
        <div className="hidden lg:block border-t border-[rgba(255,255,255,0.06)] bg-[rgba(13,15,20,0.96)] backdrop-blur-xl dropdown-anim">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-2.5">
              {SECTION_LINKS[active].map(l => (
                <Link key={`${l.href}:${l.title}`} href={l.href} onClick={() => setActive(null)}
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
            {BUDGET_CHIPS[active] && USE_CASES[active] && (
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[rgba(255,255,255,0.06)] pt-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-medium">Budget</span>
                  {BUDGET_CHIPS[active].map(([label, href]) => (
                    <Link key={href} href={href} onClick={() => setActive(null)}
                      className="neon-badge rounded-full border border-[rgba(6,182,212,0.15)] px-3 py-1 text-xs hover:border-neon-cyan hover:bg-[rgba(6,182,212,0.1)] transition">
                      {label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 border-l border-[rgba(255,255,255,0.06)] pl-6">
                  <span className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.45)] font-medium">Popular picks</span>
                  {USE_CASES[active].map(([label, href]) => (
                    <Link key={href} href={href} onClick={() => setActive(null)}
                      className="neon-badge rounded-full border border-[rgba(139,92,246,0.2)] px-3 py-1 text-xs hover:border-neon-violet hover:bg-[rgba(139,92,246,0.1)] transition">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[rgba(255,255,255,0.06)] bg-[var(--panel)] px-4 py-3 space-y-1">
          {TOP_ITEMS.map(section => (
            <div key={section.id}>
              <button
                onClick={() => toggleMobile(section.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.02)] rounded-xl">
                {section.label}
                <Chevron open={isMobileOpen(section.id)} />
              </button>
              {isMobileOpen(section.id) && (
                <div className="pl-4 space-y-1">
                  {mobileItems[section.id].map(item => (
                    <Link key={item.href} href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-sm text-[rgba(255,255,255,0.7)] hover:text-neon-cyan hover:bg-[rgba(255,255,255,0.02)] rounded-lg transition">
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Direct links */}
          <Link href="/brands" onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.02)] rounded-xl">
            🏷️ Brands
          </Link>
          <Link href="/news" onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.02)] rounded-xl">
            📰 News
          </Link>
          <Link href="/about" onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.02)] rounded-xl">
            ℹ️ About
          </Link>
          <Link href="/wishlist" onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.02)] rounded-xl">
            ❤️ Wishlist
          </Link>
        </div>
      )}
    </nav>
  )
}
