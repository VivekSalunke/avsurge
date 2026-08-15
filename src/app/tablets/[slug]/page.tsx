import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TabletReviews from '@/components/TabletReviews'
import TabletWishlistButton from '@/components/TabletWishlistButton'
import SpecExplainer from '@/components/SpecExplainer'
import TabletJsonLd from '@/components/TabletJsonLd'
import RelatedTablets from '@/components/RelatedTablets'
import TabletPriceHistory from '@/components/TabletPriceHistory'
import RecentlyViewedTablets from '@/components/RecentlyViewedTablets'
import TabletViewTracker from '@/components/TabletViewTracker'
import TabletPriceAlertButton from '@/components/TabletPriceAlertButton'
import TabletTracker from '@/components/TabletTracker'
import SpecScoreBadge from '@/components/SpecScoreBadge'
import { formatPriceINR } from '@/lib/format'
import { buildAmazonSearchUrl } from '@/lib/affiliate'

export const revalidate = 60

const ICONS: Record<string, string> = {
  Display: '🖥️', Performance: '⚡', Camera: '📷',
  Battery: '🔋', Connectivity: '📡', Build: '🏗️',
  Storage: '💾', General: '📋', Audio: '🔊',
}

async function getTablet(slug: string) {
  const { data: tablet } = await supabase.from('tablets').select('*').eq('slug', slug).single()
  if (!tablet) return null
  const { data: specs } = await supabase.from('tablet_specs').select('*').eq('tablet_id', tablet.id).order('id')
  return { tablet, specs: specs || [] }
}

async function getComparisonCandidates(tablet: any) {
  if (!tablet.price_inr) return []
  const minPrice = tablet.price_inr / 1.6
  const maxPrice = tablet.price_inr * 1.6
  const { data } = await supabase
    .from('tablets')
    .select('slug, name, brand, price_inr')
    .neq('id', tablet.id)
    .gte('price_inr', minPrice)
    .lte('price_inr', maxPrice)
    .not('price_inr', 'is', null)
    .limit(3)
  return data || []
}

export default async function TabletPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getTablet(slug)
  if (!data) notFound()
  const { tablet, specs } = data
  const comparisonCandidates = await getComparisonCandidates(tablet)

  const grouped = specs.reduce((acc: Record<string, any[]>, s: any) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  const highlights = ['Display', 'Performance', 'Battery', 'Camera']

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 text-[var(--text)]">
      <TabletTracker deviceId={tablet.id} />
      <TabletJsonLd tablet={tablet} specs={specs} />
      <TabletViewTracker slug={tablet.slug} />
      <div className="text-sm text-[rgba(255,255,255,0.4)] mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neon-cyan">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/tablets" className="hover:text-neon-cyan">Tablets</Link>
        <span>&rsaquo;</span>
        <Link href={`/tablets?brand=${tablet.brand}`} className="hover:text-neon-cyan">{tablet.brand}</Link>
        <span>&rsaquo;</span>
        <span className="text-[rgba(255,255,255,0.65)]">{tablet.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(255,255,255,0.06)] p-6 sticky top-20">
            <div className="w-full aspect-square bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mb-5 overflow-hidden">
              {tablet.image_url
                ? <img src={tablet.image_url} alt={tablet.name} className="object-contain w-full h-full p-2" />
                : <span className="text-7xl">📟</span>}
            </div>
            <h1 className="text-xl font-bold text-white mb-1">{tablet.name}</h1>
            <p className="text-sm text-[rgba(255,255,255,0.4)] mb-4">{tablet.brand}</p>
            <SpecScoreBadge specs={specs} overrideScore={tablet.spec_score_override} />

            {tablet.price_inr && (
              <div className="price-tag rounded-xl px-4 py-3 mb-4 text-center">
                <div className="text-xs text-neon-cyan mb-0.5">Starting price in India</div>
                <div className="text-2xl font-bold text-neon-cyan">{formatPriceINR(tablet.price_inr)}</div>
              </div>
            )}

            {tablet.released_at && (
              <p className="text-xs text-[rgba(255,255,255,0.4)] text-center mb-4">
                Released {new Date(tablet.released_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(tablet.name)}`} target="_blank"
                className="w-full bg-gradient-to-r from-neon-violet to-neon-cyan text-black rounded-xl py-2.5 text-sm font-medium hover:brightness-110 transition text-center">
                Check on Flipkart →
              </a>
              <Link href={`/compare-tablets?a=${tablet.slug}`}
                className="w-full text-center border border-dashed border-[rgba(255,255,255,0.08)] text-dim rounded-xl py-2.5 text-sm hover:border-neon-cyan hover:text-neon-cyan transition">
                + Add to compare
              </Link>
              <TabletWishlistButton tabletId={tablet.id} />
              <TabletPriceAlertButton tabletId={tablet.id} tabletName={tablet.name} currentPrice={tablet.price_inr} />
              <a href={buildAmazonSearchUrl(tablet.name)} target="_blank"
                className="w-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.85)] rounded-xl py-2.5 text-sm font-medium hover:border-neon-violet hover:text-white hover:glow transition text-center">
                Check on Amazon →
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-5">
          {highlights.some(h => grouped[h]) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {highlights.map(cat => {
                const first = grouped[cat]?.[0]
                if (!first) return null
                return (
                  <div key={cat} className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-xl p-3">
                    <div className="text-xl mb-1">{ICONS[cat]}</div>
                    <div className="text-xs text-[rgba(255,255,255,0.4)] mb-0.5">{cat}</div>
                    <div className="text-sm font-semibold text-white leading-tight">{first.value}</div>
                  </div>
                )
              })}
            </div>
          )}

          {comparisonCandidates.length > 0 && (
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(255,255,255,0.06)] p-5">
              <h2 className="text-sm font-semibold text-[rgba(255,255,255,0.85)] mb-3">Popular comparisons</h2>
              <div className="flex flex-wrap gap-2">
                {comparisonCandidates.map((c: any) => (
                  <Link
                    key={c.slug}
                    href={`/compare-tablets/${[tablet.slug, c.slug].sort().join('-vs-')}`}
                    className="text-xs px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]"
                  >
                    vs {c.name} →
                  </Link>
                ))}
              </div>
            </div>
          )}

          {Object.entries(grouped).map(([category, catSpecs]: [string, any]) => (
            <div key={category} className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.04)]">
                <span>{ICONS[category] || '📋'}</span>
                <span className="text-sm font-semibold text-[rgba(255,255,255,0.85)]">{category}</span>
              </div>
              <table className="w-full">
                <tbody>
                  {catSpecs.map((spec: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-[var(--card-bg)]' : 'bg-[rgba(255,255,255,0.02)]'}>
                      <td className="px-5 py-3 text-sm text-[rgba(255,255,255,0.4)] w-2/5">{spec.label}</td>
                      <td className="px-5 py-3 text-sm text-white font-medium">
                        <div className="flex items-center gap-1">
                          <span>{spec.value}</span>
                          <SpecExplainer label={spec.label} value={spec.value} phoneName={tablet.name} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {specs.length === 0 && (
            <div className="bg-[var(--card-bg)] rounded-2xl border border-dashed border-[rgba(255,255,255,0.06)] py-16 text-center text-[rgba(255,255,255,0.4)] text-sm">
              No specs yet.
            </div>
          )}

          <RelatedTablets tabletId={tablet.id} brand={tablet.brand} priceInr={tablet.price_inr} />
          <TabletPriceHistory tabletId={tablet.id} currentPrice={tablet.price_inr} />
          <RecentlyViewedTablets currentSlug={tablet.slug} />
          <TabletReviews tabletId={tablet.id} />
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: tablet } = await supabase.from('tablets').select('*').eq('slug', slug).single()
  if (!tablet) return { title: 'Tablet not found' }
  return {
    title: `${tablet.name} Specs & Price in India`,
    description: `${tablet.name} full specifications, price in India (${formatPriceINR(tablet.price_inr)}), display, battery, performance and more.`,
    alternates: { canonical: `https://avsurge.com/tablets/${slug}` },
    openGraph: {
      title: `${tablet.name} — Full Specs & Price`,
      description: `${tablet.name} specifications and price in India.`,
      images: tablet.image_url ? [{ url: tablet.image_url }] : [],
    }
  }
}
