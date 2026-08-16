'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

const NAV = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/phones', label: 'Phones' },
  { href: '/admin/add-phone', label: '+ Add Phone' },
  { href: '/admin/tablets', label: 'Tablets' },
  { href: '/admin/add-tablet', label: '+ Add Tablet' },
  { href: '/admin/laptops', label: 'Laptops' },
  { href: '/admin/laptops/add', label: '+ Add Laptop' },
  { href: '/admin/news', label: 'News' },
  { href: '/admin/images', label: 'Images' },
  { href: '/admin/brands', label: 'Brands' },
  { href: '/admin/price-history', label: 'Prices' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) router.push('/login')
    else if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading, profileLoading, router])

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" />
      </div>
    )
  }

  if (!user || !isAdmin) return null

  return (
    <div className="min-h-screen text-[var(--text)]">
      <div className="sticky top-[61px] z-40 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(13,15,20,0.92)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2">
          <Link href="/admin" className="mr-2 flex shrink-0 items-center gap-1.5 font-bold text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-r from-neon-cyan to-neon-violet text-xs font-bold text-black">AV</span>
            <span className="text-sm">Admin</span>
          </Link>
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[rgba(255,255,255,0.7)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-white">
              {item.label}
            </Link>
          ))}
          <Link href="/" className="ml-auto shrink-0 rounded-lg border border-[rgba(255,255,255,0.08)] px-2.5 py-1.5 text-xs font-medium text-dim transition hover:border-neon-cyan hover:text-neon-cyan">
            View site →
          </Link>
        </div>
      </div>
      {children}
    </div>
  )
}
