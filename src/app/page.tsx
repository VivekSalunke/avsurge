import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import RecentlyViewedHome from '@/components/RecentlyViewedHome'
import FeaturedDeviceStack from '@/components/FeaturedDeviceStack'
import AILogo from '@/components/AILogo'
import { formatPriceINR } from '@/lib/format'

export const revalidate = 60

const BRAND_ICONS: Record<string, string> = {
  Samsung: '🔵', Apple: '🍎', OnePlus: '🔴', Google: '🟡',
  Xiaomi: '🟠', Realme: '🟢', Vivo: '🔷', OPPO: '🟣',
  Nothing: '⚫', iQOO: '🔸', Motorola: '🔹',
}

const cardBase =
  'group flex h-full flex-col rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] ' +
  'transition-all duration-300 card-hover hover:border-[rgba(139,92,246,0.3)] hover:glow'

const deviceImage = (url: string | null, name: string, fallback: string) => (
  <div className="relative flex aspect-[4/4.5] items-center justify-center overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.02))]">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(139,92,246,0.06),transparent_60%)]" />
    {url ? (
      <img src={url} alt={name} loading="lazy"
        className="relative h-full w-full object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-110" />
    ) : (
      <span className="text-3xl opacity-60">{fallback}</span>
    )}
  </div>
)

function DeviceCard({ device, href, fallback }: { device: any, href: string, fallback: string }) {
  return (
    <Link href={href} className={cardBase}>
      {deviceImage(device.image_url, device.name, fallback)}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <span className="inline-flex w-fit items-center gap-1 rounded-full neon-badge px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan" />
          {device.brand}
        </span>
        <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-snug text-[var(--text)] transition-colors group-hover:text-neon-violet">
          {device.name}
        </h3>
        <div className="mt-3 flex items-end justify-between gap-2">
          {device.price_inr ? (
            <div>
              <p className="text-base font-extrabold tracking-tight text-white">{formatPriceINR(device.price_inr)}</p>
              <span className="text-[10px] font-medium text-dim">Starting price</span>
            </div>
          ) : (
            <p className="text-xs font-medium text-dim">Price on request</p>
          )}
          <span className="text-neon-cyan opacity-0 transition-opacity group-hover:opacity-100">→</span>
        </div>
      </div>
    </Link>
  )
}

function SectionHeader({ title, badge, href }: { title: string, badge?: string, href: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="h-5 w-1 rounded-full bg-gradient-to-b from-neon-violet to-neon-cyan" />
        <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
        {badge && (
          <span className="neon-badge text-[10px] uppercase tracking-wider">{badge}</span>
        )}
      </div>
      <Link href={href} className="group/link text-sm font-medium text-[rgba(255,255,255,0.55)] transition hover:text-neon-cyan">
        See all
        <span className="ml-1 inline-block transition-transform group-hover/link:translate-x-0.5">→</span>
      </Link>
    </div>
  )
}

function BudgetGrid({ hrefPrefix, items }: { hrefPrefix: string, items: { label: string, budget: number }[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {items.map(({ label, budget }) => (
        <Link key={budget} href={`${hrefPrefix}${budget}`}
          className="group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] px-3 py-3.5 text-center transition-all duration-200 card-hover hover:border-[rgba(6,182,212,0.35)] hover:glow">
          <p className="text-sm font-semibold text-[rgba(255,255,255,0.85)] transition-colors group-hover:text-neon-cyan">{label}</p>
        </Link>
      ))}
    </div>
  )
}

function UseCaseGrid({ items }: { items: { label: string, href: string }[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {items.map(({ label, href }) => {
        const [icon, ...rest] = label.split(' ')
        return (
          <Link key={href} href={href}
            className="group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] px-3 py-4 text-center transition-all duration-200 card-hover hover:border-[rgba(139,92,246,0.35)] hover:glow">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.03)] text-lg transition-transform group-hover:scale-110">
              {icon}
            </div>
            <p className="text-xs font-semibold text-[rgba(255,255,255,0.75)]">{rest.join(' ')}</p>
          </Link>
        )
      })}
    </div>
  )
}

export default async function HomePage() {
  const [
    { data: latestPhones },
    { data: budgetPhones },
    { data: premiumPhones },
    { data: reviews },
    { data: allPhones },
    { data: brandsRaw },
    { data: latestTablets },
    { data: allTablets },
    { data: latestLaptops },
    { data: allLaptops },
  ] = await Promise.all([
    supabase.from('phones').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('phones').select('*').lte('price_inr', 40000).order('price_inr', { ascending: true }).limit(6),
    supabase.from('phones').select('*').gte('price_inr', 80000).order('price_inr', { ascending: false }).limit(6),
    supabase.from('reviews').select('phone_id, rating'),
    supabase.from('phones').select('*'),
    supabase.from('phones').select('brand'),
    supabase.from('tablets').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('tablets').select('id'),
    supabase.from('laptops').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('laptops').select('id'),
  ])

  const ratingMap: Record<number, { total: number; count: number }> = {}
  for (const r of reviews || []) {
    if (!ratingMap[r.phone_id]) ratingMap[r.phone_id] = { total: 0, count: 0 }
    ratingMap[r.phone_id].total += r.rating
    ratingMap[r.phone_id].count += 1
  }
  const topRated = (allPhones || [])
    .filter(p => ratingMap[p.id]?.count >= 1)
    .sort((a, b) => {
      const avgA = ratingMap[a.id].total / ratingMap[a.id].count
      const avgB = ratingMap[b.id].total / ratingMap[b.id].count
      return avgB - avgA
    })
    .slice(0, 6)

  const brands = [...new Set((brandsRaw || []).map((b: any) => b.brand))].sort()

  const stats = [
    { label: 'Phones', value: (allPhones?.length || 0) + '+', icon: 'M7 18c-1.26 0-2-1-2-2V7M17 6c1.26 0 2 1 2 2v9' },
    { label: 'Tablets', value: (allTablets?.length || 0) + '+', icon: 'M4 6h16v12H4z' },
    { label: 'Laptops', value: (allLaptops?.length || 0) + '+', icon: 'M3 7h18v10H3z' },
    { label: 'Brands', value: brands.length + '+', icon: 'M12 21V7M7 4l5-2 5 2M5 21h14' },
  ]

  const featuredDevices = [
    ...(latestPhones || []).slice(0, 2).map((p: any) => ({ ...p, type: 'phones' })),
    ...(latestTablets || []).slice(0, 1).map((t: any) => ({ ...t, type: 'tablets' })),
    ...(latestLaptops || []).slice(0, 1).map((l: any) => ({ ...l, type: 'laptops' })),
  ]

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative mb-14 overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.06)] bg-[var(--panel)] px-6 py-14 sm:px-12 sm:py-20">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.16),transparent_65%)] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12),transparent_65%)] blur-2xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full neon-badge text-[11px] uppercase tracking-[0.14em]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan" />
              India&apos;s Device Database
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl">
              Find your perfect <span className="text-emerald-400">device</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[rgba(255,255,255,0.65)] sm:text-lg">
              Comprehensive specs, live prices, detailed comparisons and genuine reviews for every phone, tablet and laptop available in India.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/phones"
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)]">
                Browse phones
              </Link>
              <Link href="/compare"
                className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] px-6 py-3 text-sm font-semibold text-[rgba(255,255,255,0.85)] transition-all duration-200 hover:border-neon-violet hover:text-white hover:glow">
                Compare devices
              </Link>
              <Link href="/leaderboard"
                className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] px-6 py-3 text-sm font-semibold text-[rgba(255,255,255,0.85)] transition-all duration-200 hover:border-neon-cyan hover:text-white hover:glow">
                Trending now
              </Link>
            </div>
          </div>

          {/* Featured device stack */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-neon-violet/20 to-neon-cyan/20 blur-lg" />
            <FeaturedDeviceStack devices={featuredDevices} />
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────── */}
      <div className="mb-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label}
            className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] p-5 text-center transition-all duration-200 card-hover hover:border-[rgba(139,92,246,0.3)] hover:glow">
            <svg className="mx-auto mb-3 h-6 w-6 text-neon-violet" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
            </svg>
            <div className="bg-gradient-to-r from-white to-[rgba(255,255,255,0.6)] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              {stat.value}
            </div>
            <div className="mt-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-dim">{stat.label}</div>
          </div>
        ))}
      </div>

      <RecentlyViewedHome />

      {/* ── Browse by budget ─────────────────────────────── */}
      <section className="mb-14">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-neon-violet to-neon-cyan" />
          <h2 className="text-xl font-bold tracking-tight text-white">Browse by budget</h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dim">Phones</p>
            <BudgetGrid hrefPrefix="/best-phones/" items={[
              { label: 'Under ₹10K', budget: 10000 },
              { label: 'Under ₹20K', budget: 20000 },
              { label: 'Under ₹30K', budget: 30000 },
              { label: 'Under ₹50K', budget: 50000 },
              { label: 'Under ₹1L', budget: 100000 },
            ]} />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dim">Tablets</p>
            <BudgetGrid hrefPrefix="/best-tablets/" items={[
              { label: 'Under ₹20K', budget: 20000 },
              { label: 'Under ₹30K', budget: 30000 },
              { label: 'Under ₹50K', budget: 50000 },
              { label: 'Under ₹1L', budget: 100000 },
              { label: 'Under ₹1.5L', budget: 150000 },
            ]} />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-dim">Laptops</p>
            <BudgetGrid hrefPrefix="/best-laptops/" items={[
              { label: 'Under ₹50K', budget: 50000 },
              { label: 'Under ₹70K', budget: 70000 },
              { label: 'Under ₹1L', budget: 100000 },
              { label: 'Under ₹1.5L', budget: 150000 },
              { label: 'Under ₹2L', budget: 200000 },
            ]} />
          </div>
        </div>
      </section>

      {/* ── Latest phones ────────────────────────────────── */}
      <section className="mb-14">
        <SectionHeader title="Latest phones" badge="New" href="/phones" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {(latestPhones || []).map((phone: any) => (
            <DeviceCard key={phone.id} device={phone} href={`/phones/${phone.slug}`} fallback="📱" />
          ))}
        </div>
      </section>

      {/* ── Top rated ────────────────────────────────────── */}
      {topRated.length > 0 && (
        <section className="mb-14">
          <SectionHeader title="Top rated" badge="Rated" href="/phones" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {topRated.map((phone: any) => (
              <DeviceCard key={phone.id} device={phone} href={`/phones/${phone.slug}`} fallback="📱" />
            ))}
          </div>
        </section>
      )}

      {/* ── Budget / premium ─────────────────────────────── */}
      <div className="mb-14 grid gap-10 lg:grid-cols-2">
        <section>
          <SectionHeader title="Best under ₹40K" badge="Budget" href="/phones?maxPrice=40000" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {(budgetPhones || []).map((phone: any) => (
              <DeviceCard key={phone.id} device={phone} href={`/phones/${phone.slug}`} fallback="📱" />
            ))}
          </div>
        </section>
        <section>
          <SectionHeader title="Premium phones" badge="Flagship" href="/phones?minPrice=80000" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {(premiumPhones || []).map((phone: any) => (
              <DeviceCard key={phone.id} device={phone} href={`/phones/${phone.slug}`} fallback="📱" />
            ))}
          </div>
        </section>
      </div>

      {/* ── Tablets ──────────────────────────────────────── */}
      {(latestTablets || []).length > 0 && (
        <section className="mb-14">
          <SectionHeader title="Latest tablets" badge="New" href="/tablets" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {(latestTablets || []).map((tablet: any) => (
              <DeviceCard key={tablet.id} device={tablet} href={`/tablets/${tablet.slug}`} fallback="📟" />
            ))}
          </div>
        </section>
      )}

      {/* ── Laptops ──────────────────────────────────────── */}
      {(latestLaptops || []).length > 0 && (
        <section className="mb-14">
          <SectionHeader title="Latest laptops" badge="New" href="/laptops" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {(latestLaptops || []).map((laptop: any) => (
              <DeviceCard key={laptop.id} device={laptop} href={`/laptops/${laptop.slug}`} fallback="💻" />
            ))}
          </div>
        </section>
      )}

      {/* ── Browse by use case ───────────────────────────── */}
      <div className="mb-14 grid gap-10 lg:grid-cols-3">
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-neon-violet to-neon-cyan" />
            <h2 className="text-lg font-bold tracking-tight text-white">Phones by use case</h2>
          </div>
          <UseCaseGrid items={[
            { label: '🎮 Gaming', href: '/best-phones-for/gaming' },
            { label: '📷 Camera', href: '/best-phones-for/camera' },
            { label: '🔋 Battery', href: '/best-phones-for/battery' },
            { label: '🎓 Students', href: '/best-phones-for/students' },
            { label: '📡 5G', href: '/best-phones-for/5g' },
            { label: '💼 Business', href: '/best-phones-for/business' },
          ]} />
        </section>
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-neon-violet to-neon-cyan" />
            <h2 className="text-lg font-bold tracking-tight text-white">Tablets by use case</h2>
          </div>
          <UseCaseGrid items={[
            { label: '✏️ Drawing', href: '/best-tablets-for/drawing' },
            { label: '🎓 Students', href: '/best-tablets-for/students' },
            { label: '🎮 Gaming', href: '/best-tablets-for/gaming' },
            { label: '👶 Kids', href: '/best-tablets-for/kids' },
            { label: '🎬 Entertainment', href: '/best-tablets-for/entertainment' },
            { label: '💼 Work', href: '/best-tablets-for/work' },
          ]} />
        </section>
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-neon-violet to-neon-cyan" />
            <h2 className="text-lg font-bold tracking-tight text-white">Laptops by use case</h2>
          </div>
          <UseCaseGrid items={[
            { label: '🎮 Gaming', href: '/best-laptops-for/gaming' },
            { label: '🎬 Video Editing', href: '/best-laptops-for/video-editing' },
            { label: '🎓 Students', href: '/best-laptops-for/students' },
            { label: '💼 Business', href: '/best-laptops-for/business' },
            { label: '💻 Programming', href: '/best-laptops-for/programming' },
            { label: '✈️ Lightweight', href: '/best-laptops-for/lightweight' },
          ]} />
        </section>
      </div>

      {/* ── Quick actions ────────────────────────────────── */}
      <section className="mb-14">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-neon-violet to-neon-cyan" />
          <h2 className="text-xl font-bold tracking-tight text-white">Explore AVSurge</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {[
            { href: '/compare', icon: '⚖️', title: 'Compare Phones', desc: 'Side by side' },
            { href: '/compare-tablets', icon: '📊', title: 'Compare Tablets', desc: 'Side by side' },
            { href: '/compare-laptops', icon: '🖥️', title: 'Compare Laptops', desc: 'Side by side' },
            { href: '/search', icon: '🔍', title: 'Search', desc: 'By specs & budget' },
            { href: '/leaderboard', icon: '🔥', title: 'Trending', desc: 'Most viewed' },
            { href: '/ai-recommend', icon: '🤖', title: 'AI Recommender', desc: 'Get suggestions' },
            { href: '/brands', icon: '🏷️', title: 'All Brands', desc: 'Browse by brand' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="group rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] p-4 text-center transition-all duration-200 card-hover hover:border-[rgba(139,92,246,0.35)] hover:glow">
              <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.03)] text-xl transition-transform group-hover:scale-110">
                {item.href === '/ai-recommend' ? <AILogo size="sm" /> : item.icon}
              </div>
              <h3 className="text-xs font-bold text-white transition-colors group-hover:text-neon-cyan">{item.title}</h3>
              <p className="mt-0.5 text-[10px] text-dim">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Brands ───────────────────────────────────────── */}
      {brands.length > 0 && (
        <section>
          <SectionHeader title="Browse by brand" href="/brands" />
          <div className="flex flex-wrap gap-2">
            {brands.map((brand: any) => (
              <Link key={brand} href={`/brands/${encodeURIComponent(brand)}`}
                className="group flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[rgba(255,255,255,0.75)] transition-all duration-200 hover:border-[rgba(6,182,212,0.4)] hover:text-neon-cyan hover:glow">
                <span className="text-base">{BRAND_ICONS[brand] || '▫'}</span>
                {brand}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
