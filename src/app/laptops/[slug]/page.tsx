import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SpecExplainer from '@/components/SpecExplainer'
import LaptopJsonLd from '@/components/LaptopJsonLd'
import LaptopViewTracker from '@/components/LaptopViewTracker'
import RecentlyViewedLaptops from '@/components/RecentlyViewedLaptops'
import RelatedLaptops from '@/components/RelatedLaptops'
import LaptopReviews from '@/components/LaptopReviews'
import LaptopPriceHistory from '@/components/LaptopPriceHistory'
import LaptopWishlistButton from '@/components/LaptopWishlistButton'
import LaptopPriceAlertButton from '@/components/LaptopPriceAlertButton'
import LaptopTracker from '@/components/LaptopTracker'
import { formatPriceINR } from '@/lib/format'
import { buildAmazonSearchUrl } from '@/lib/affiliate'
export const revalidate = 60
const ICONS: Record<string, string> = {
  Display: '🖥️', Performance: '⚡', Storage: '💾',
  Battery: '🔋', Connectivity: '📡', Build: '🏗️',
  Graphics: '🎮', General: '📋', Audio: '🔊', Memory: '🧠',
}
async function getLaptop(slug: string) {
  const { data: laptop } = await supabase.from('laptops').select('*').eq('slug', slug).single()
  if (!laptop) return null
  const { data: specs } = await supabase.from('laptop_specs').select('*').eq('laptop_id', laptop.id).order('id')
  return { laptop, specs: specs || [] }
}

async function getComparisonCandidates(laptop: any) {
  if (!laptop.price_inr) return []
  const minPrice = laptop.price_inr / 1.6
  const maxPrice = laptop.price_inr * 1.6
  const { data } = await supabase
    .from('laptops')
    .select('slug, name, brand, price_inr')
    .neq('id', laptop.id)
    .gte('price_inr', minPrice)
    .lte('price_inr', maxPrice)
    .not('price_inr', 'is', null)
    .limit(3)
  return data || []
}

export default async function LaptopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getLaptop(slug)
  if (!data) notFound()
  const { laptop, specs } = data
  const comparisonCandidates = await getComparisonCandidates(laptop)
  const grouped = specs.reduce((acc: Record<string, any[]>, s: any) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})
  const highlights = ['Performance', 'Display', 'Memory', 'Battery']
  return (
    <main className="max-w-5xl mx-auto px-4 py-8 text-[var(--text)]">
      <LaptopTracker deviceId={laptop.id} />
      <LaptopJsonLd laptop={laptop} specs={specs} />
      <LaptopViewTracker slug={laptop.slug} />
      <div className="text-sm text-[rgba(255,255,255,0.4)] mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neon-cyan">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/laptops" className="hover:text-neon-cyan">Laptops</Link>
        <span>&rsaquo;</span>
        <span className="text-[rgba(255,255,255,0.65)]">{laptop.name}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(255,255,255,0.06)] p-6 sticky top-20">
            <div className="w-full aspect-square bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mb-5 overflow-hidden">
              {laptop.image_url
                ? <img src={laptop.image_url} alt={laptop.name} className="object-contain w-full h-full p-2" />
                : <span className="text-7xl">💻</span>}
            </div>
            <h1 className="text-xl font-bold text-white mb-1">{laptop.name}</h1>
            <p className="text-sm text-[rgba(255,255,255,0.4)] mb-4">{laptop.brand}</p>
            {laptop.price_inr && (
              <div className="price-tag rounded-xl px-4 py-3 mb-4 text-center">
                <div className="text-xs text-neon-cyan mb-0.5">Starting price in India</div>
                <div className="text-2xl font-bold text-neon-cyan">{formatPriceINR(laptop.price_inr)}</div>
              </div>
            )}
            {laptop.released_at && (
              <p className="text-xs text-[rgba(255,255,255,0.4)] text-center mb-4">
                Released {new Date(laptop.released_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            )}
            <div className="flex flex-col gap-2">
              <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(laptop.name)}`} target="_blank"
                className="w-full bg-gradient-to-r from-neon-violet to-neon-cyan text-black rounded-xl py-2.5 text-sm font-medium hover:brightness-110 transition text-center">
                Check on Flipkart →
              </a>
              <Link href={`/compare-laptops?a=${laptop.slug}`}
                className="w-full text-center border border-dashed border-[rgba(255,255,255,0.08)] text-dim rounded-xl py-2.5 text-sm hover:border-neon-cyan hover:text-neon-cyan transition">
                + Add to compare
              </Link>
              <a href={buildAmazonSearchUrl(laptop.name)} target="_blank"
                className="w-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.85)] rounded-xl py-2.5 text-sm font-medium hover:border-neon-violet hover:text-white hover:glow transition text-center">
                Check on Amazon →
              </a>
              <LaptopWishlistButton laptopId={laptop.id} />
              <LaptopPriceAlertButton laptopId={laptop.id} laptopName={laptop.name} currentPrice={laptop.price_inr} />
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
                    href={`/compare-laptops/${[laptop.slug, c.slug].sort().join('-vs-')}`}
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
                          <SpecExplainer label={spec.label} value={spec.value} phoneName={laptop.name} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <LaptopPriceHistory laptopId={laptop.id} currentPrice={laptop.price_inr} />
          <RelatedLaptops laptopId={laptop.id} brand={laptop.brand} priceInr={laptop.price_inr} />
          <LaptopReviews laptopId={laptop.id} />
          <RecentlyViewedLaptops currentSlug={laptop.slug} />
          {specs.length === 0 && (
            <div className="bg-[var(--card-bg)] rounded-2xl border border-dashed border-[rgba(255,255,255,0.06)] py-16 text-center text-[rgba(255,255,255,0.4)] text-sm">
              No specs yet.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: laptop } = await supabase.from('laptops').select('*').eq('slug', slug).single()
  if (!laptop) return { title: 'Laptop not found' }
  return {
    title: `${laptop.name} Specs & Price in India`,
    description: `${laptop.name} full specifications, price in India (${formatPriceINR(laptop.price_inr)}), display, battery, performance and more.`,
    alternates: { canonical: `https://avsurge.com/laptops/${slug}` },
  }
}
