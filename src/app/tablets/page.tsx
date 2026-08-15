import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import DeviceCard from '@/components/DeviceCard'

export const revalidate = 60

export const metadata = {
  title: 'Tablets Price List in India 2026 | AVSurge',
  description:
    'Browse all tablets available in India. Compare tablet specs, prices and reviews. Find the best tablet for your budget.',
  alternates: { canonical: 'https://avsurge.com/tablets' },
}

interface Tablet {
  id: string | number
  slug: string
  name: string
  brand: string | null
  price_inr?: number | null
  image_url?: string | null
}

export default async function TabletsPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>
}) {
  const params = await searchParams
  const brand = params?.brand

  let query = supabase
    .from('tablets')
    .select('*')
    .order('created_at', { ascending: false })

  if (brand) {
    query = query.ilike('brand', brand)
  }

  const { data: tabletsData, error: tabletsError } = await query

  if (tabletsError) {
    console.error('Failed to load tablets:', tabletsError)
  }

  const tablets = (tabletsData || []) as Tablet[]

  const { data: brandsRaw } = await supabase
    .from('tablets')
    .select('brand')

  const brands = [
    ...new Set(
      (brandsRaw || [])
        .map((b: { brand: string | null }) => b.brand)
        .filter(Boolean)
    ),
  ].sort() as string[]

  const brandIcons: Record<string, string> = {
    Samsung: '🔵',
    Apple: '🍎',
    Xiaomi: '🟠',
    Realme: '🟢',
    Lenovo: '🔷',
    OnePlus: '🔴',
    OPPO: '🟣',
    Honor: '🟡',
  }

  const itemListSchema =
    tablets.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: brand ? `${brand} Tablets` : 'All Tablets',
          description:
            'Browse tablets available in India with specs, prices and reviews.',
          itemListElement: tablets.slice(0, 50).map((tablet, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: `https://avsurge.com/tablets/${tablet.slug}`,
            name: tablet.name,
          })),
        }
      : null

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Schema */}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itemListSchema),
          }}
        />
      )}

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 rounded-2xl p-8 mb-10 text-white shadow-lg">
        <p className="text-blue-200 text-xs mb-3 uppercase tracking-widest font-semibold">
          India's Tablet Database
        </p>

        <h1 className="text-4xl font-extrabold mb-3 leading-tight">
          Find your perfect tablet
        </h1>

        <p className="text-blue-100 max-w-lg text-base leading-relaxed mb-6">
          Explore specs, prices and comparisons for every tablet available in India.
        </p>

        <div className="flex gap-3 flex-wrap">
          <Link
            href="/compare-tablets"
            className="bg-white text-blue-600 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition shadow-md hover:shadow-lg"
          >
            Compare tablets →
          </Link>
        </div>
      </div>

      {/* Quick navigation */}
      <section className="mb-10 flex flex-wrap gap-2">

        <Link
          href="/leaderboard"
          className="px-3.5 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition bg-white font-medium"
        >
          🔥 Trending tablets
        </Link>

        <Link
          href="/brands"
          className="px-3.5 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition bg-white font-medium"
        >
          🏷️ Browse by brand
        </Link>

        <Link
          href="/compare-tablets"
          className="px-3.5 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition bg-white font-medium"
        >
          ⚖️ Compare tablets
        </Link>

      </section>

      {/* Browse by use case */}
      <section className="mb-10">

        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
          Browse by use case
        </h2>

        <div className="flex flex-wrap gap-2">

          {[
            { label: '✏️ Drawing', href: '/best-tablets-for/drawing' },
            { label: '🎓 Students', href: '/best-tablets-for/students' },
            { label: '🎮 Gaming', href: '/best-tablets-for/gaming' },
            { label: '👶 Kids', href: '/best-tablets-for/kids' },
            { label: '🎬 Entertainment', href: '/best-tablets-for/entertainment' },
            { label: '💼 Work', href: '/best-tablets-for/work' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3.5 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition bg-white font-medium"
            >
              {item.label}
            </Link>
          ))}

        </div>
      </section>

      {/* Browse by budget */}
      <section className="mb-10">

        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
          Browse by budget
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">

          {[
            { label: 'Under ₹10K', budget: 10000 },
            { label: 'Under ₹20K', budget: 20000 },
            { label: 'Under ₹30K', budget: 30000 },
            { label: 'Under ₹50K', budget: 50000 },
            { label: 'Under ₹1L', budget: 100000 },
            { label: 'Under ₹1.5L', budget: 150000 },
          ].map(({ label, budget }) => (
            <Link
              key={budget}
              href={`/best-tablets/${budget}`}
              className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:border-blue-400 hover:shadow-md transition group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                📟
              </div>

              <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition">
                {label}
              </p>
            </Link>
          ))}

        </div>
      </section>

      {/* Brand filters */}
      <section className="mb-10">

        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
          Filter by brand
        </h2>

        <div className="flex flex-wrap gap-2">

          <Link
            href="/tablets"
            className={`px-3.5 py-2 rounded-lg text-sm border transition font-medium ${
              !brand
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}
          >
            All
          </Link>

          {brands.map(b => (
            <Link
              key={b}
              href={`/tablets?brand=${encodeURIComponent(b)}`}
              className={`px-3.5 py-2 rounded-lg text-sm border transition font-medium ${
                brand === b
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
              }`}
            >
              {brandIcons[b] || '📟'} {b}
            </Link>
          ))}

        </div>
      </section>

      {/* Device count */}
      <section className="mb-8">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {brand ? `${brand} tablets` : 'All tablets'}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Compare specs and prices
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            {tablets.length} devices
          </span>

        </div>
      </section>

      {/* Tablet cards */}
      {tablets.length > 0 ? (

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">

          {tablets.map(tablet => (

            <DeviceCard
              key={tablet.id}
              device={{
                id: tablet.id,
                slug: tablet.slug,
                name: tablet.name,
                brand: tablet.brand ?? 'Unknown',
                price_inr: tablet.price_inr ?? null,
                image_url: tablet.image_url ?? null,
              }}
              type="tablet"
            />

          ))}

        </div>

      ) : (

        <div className="bg-white border border-dashed border-gray-300 rounded-2xl py-24 text-center">

          <p className="text-6xl mb-6">
            📟
          </p>

          <p className="text-gray-600 text-lg font-semibold mb-2">
            No tablets found
          </p>

          <p className="text-gray-500 text-sm mb-6">
            Try adjusting your filters
          </p>

          <Link
            href="/tablets"
            className="inline-block text-blue-600 text-sm font-semibold hover:text-blue-700 hover:underline"
          >
            View all tablets →
          </Link>

        </div>

      )}

    </main>
  )
}
