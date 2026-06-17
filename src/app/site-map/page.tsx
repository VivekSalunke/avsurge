import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'Browse all pages on AVSurge — phones, comparisons, finder and more.',
}

export const revalidate = 3600

export default async function SitemapPage() {
  const { data: phones } = await supabase.from('phones').select('slug, name, brand').order('brand')
  const brands = [...new Set((phones || []).map(p => p.brand))].sort()

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Sitemap</h1>
      <p className="text-sm text-gray-400 mb-10">All pages on AVSurge</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Main pages */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Main</h2>
          <div className="flex flex-col gap-2">
            {[
              { href: '/', label: 'Home' },
              { href: '/phones', label: 'All Phones' },
              { href: '/compare', label: 'Compare Phones' },
              { href: '/finder', label: 'Phone Finder' },
              { href: '/news', label: 'News & Reviews' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
                <span className="text-gray-300">→</span> {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Browse by Brand</h2>
          <div className="flex flex-col gap-2">
            {brands.map(brand => (
              <Link key={brand} href={`/phones?brand=${brand}`}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
                <span className="text-gray-300">→</span> {brand}
              </Link>
            ))}
          </div>
        </div>

        {/* Account */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account</h2>
          <div className="flex flex-col gap-2">
            {[
              { href: '/login', label: 'Sign In' },
              { href: '/profile', label: 'My Profile' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
                <span className="text-gray-300">→</span> {item.label}
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Phones list by brand */}
      <div className="mt-12">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">All Phones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map(brand => (
            <div key={brand}>
              <h3 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">{brand}</h3>
              <div className="flex flex-col gap-1.5">
                {(phones || []).filter(p => p.brand === brand).map(phone => (
                  <Link key={phone.slug} href={`/phones/${phone.slug}`}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
                    <span className="text-gray-300">→</span> {phone.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
