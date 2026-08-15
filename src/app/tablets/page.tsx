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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-[var(--text)]">

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
      <div className="rounded-2xl p-8 mb-10 text-white shadow-lg border border-[rgba(255,255,255,0.06)] bg-[var(--panel)]">
        <p className="text-dim text-xs mb-3 uppercase tracking-widest font-semibold">
          India's Tablet Database
        </p>

        <h1 className="text-4xl font-extrabold mb-3 leading-tight">
          Find your perfect tablet
        </h1>

        <p className="text-[rgba(255,255,255,0.65)] max-w-lg text-base leading-relaxed mb-6">
          Explore specs, prices and comparisons for every tablet available in India.
        </p>

        <div className="flex gap-3 flex-wrap">
          <Link
            href="/compare-tablets"
            className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] px-6 py-2.5 text-sm font-semibold text-[rgba(255,255,255,0.85)] transition-all duration-200 hover:border-neon-violet hover:text-white hover:glow"
          >
            Compare tablets →
          </Link>
        </div>
      </div>

      {/* Quick navigation */}
      <section className="mb-10 flex flex-wrap gap-2">

        <Link
          href="/leaderboard"
          className="px-3.5 py-2 rounded-lg text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)] font-medium"
        >
          🔥 Trending tablets
        </Link>

        <Link
          href="/brands"
          className="px-3.5 py-2 rounded-lg text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)] font-medium"
        >
          🏷️ Browse by brand
        </Link>

        <Link
          href="/compare-tablets"
          className="px-3.5 py-2 rounded-lg text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)] font-medium"
        >
          ⚖️ Compare tablets
        </Link>

      </section>

      {/* Browse by use case */}
      <section className="mb-10">

        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
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
              className="px-3.5 py-2 rounded-lg text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)] font-medium"
            >
              {item.label}
            </Link>
          ))}

        </div>
      </section>

      {/* Browse by budget */}
      <section className="mb-10">

        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
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
              className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-lg p-3 text-center hover:border-[rgba(6,182,212,0.35)] hover:glow transition-all duration-200 group card-hover"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                📟
              </div>

              <p className="text-xs font-semibold text-[rgba(255,255,255,0.85)] group-hover:text-neon-cyan transition">
                {label}
              </p>
            </Link>
          ))}

        </div>
      </section>

      {/* Brand filters */}
      <section className="mb-10">

        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
          Filter by brand
        </h2>

        <div className="flex flex-wrap gap-2">

          <Link
            href="/tablets"
            className={`px-3.5 py-2 rounded-lg text-sm border transition font-medium ${
              !brand
                ? 'border-transparent bg-gradient-to-r from-neon-cyan to-neon-violet text-black shadow-sm'
                : 'bg-[var(--card-bg)] text-[rgba(255,255,255,0.85)] border-[rgba(255,255,255,0.06)] hover:border-neon-cyan hover:text-neon-cyan'
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
                  ? 'border-transparent bg-gradient-to-r from-neon-cyan to-neon-violet text-black shadow-sm'
                  : 'bg-[var(--card-bg)] text-[rgba(255,255,255,0.85)] border-[rgba(255,255,255,0.06)] hover:border-neon-cyan hover:text-neon-cyan'
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
            <h2 className="text-xl font-bold text-white">
              {brand ? `${brand} tablets` : 'All tablets'}
            </h2>
            <p className="mt-1 text-xs text-dim">
              Compare specs and prices
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-lg badge-blue px-3 py-2 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-neon-cyan" />
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

        <div className="bg-[var(--card-bg)] border border-dashed border-[rgba(255,255,255,0.08)] rounded-2xl py-24 text-center">

          <p className="text-6xl mb-6">
            📟
          </p>

          <p className="text-[rgba(255,255,255,0.65)] text-lg font-semibold mb-2">
            No tablets found
          </p>

          <p className="text-dim text-sm mb-6">
            Try adjusting your filters
          </p>

          <Link
            href="/tablets"
            className="inline-block text-neon-cyan text-sm font-semibold hover:text-neon-cyan hover:underline"
          >
            View all tablets →
          </Link>

        </div>

      )}

    </main>
  )
}
