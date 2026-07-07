'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminPage() {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) router.push('/login')
    else if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading, profileLoading])

  if (loading || profileLoading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  if (!user || !isAdmin) return null

  const sections = [
    {
      title: '📱 Phones',
      cards: [
        { href: '/admin/add-phone', title: 'Add Phone', desc: 'Add a new phone with full specs' },
        { href: '/admin/phones', title: 'Manage Phones', desc: 'Edit or delete existing phones' },
        { href: '/admin/bulk', title: 'Bulk Import Phones', desc: 'Import multiple phones via JSON' },
      ]
    },
    {
      title: '📟 Tablets',
      cards: [
        { href: '/admin/add-tablet', title: 'Add Tablet', desc: 'Add a new tablet with full specs' },
        { href: '/admin/tablets', title: 'Manage Tablets', desc: 'Edit or delete existing tablets' },
        { href: '/admin/import-tablets', title: 'Bulk Import Tablets', desc: 'Import multiple tablets via JSON' },
      ]
    },
    {
      title: '💻 Laptops',
      cards: [
        { href: '/admin/laptops/add', title: 'Add Laptop', desc: 'Add a new laptop with full specs' },
        { href: '/admin/laptops', title: 'Manage Laptops', desc: 'Edit or delete existing laptops' },
        { href: '/admin/laptops/bulk-import', title: 'Bulk Import Laptops', desc: 'Import multiple laptops via JSON' },
      ]
    },
    {
      title: '🖼️ Images',
      cards: [
        { href: '/admin/images', title: 'Image Manager', desc: 'Add or update images for all devices' },
      ]
    },
    {
      title: '🏷️ Brands',
      cards: [
        { href: '/admin/brands', title: 'Manage Brand Logos', desc: 'Add or edit brand logos' },
      ]
    },
  ]

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Panel</h1>
        <p className="text-sm text-gray-400">Manage AVSurge content</p>
      </div>

      {sections.map(section => (
        <div key={section.title} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">{section.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {section.cards.map(card => (
              <Link key={card.href} href={card.href}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group">
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600">{card.title}</h3>
                <p className="text-xs text-gray-400">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </main>
  )
}
