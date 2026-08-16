import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Reviews from '@/components/Reviews'
import WishlistButton from '@/components/WishlistButton'
import RelatedPhones from '@/components/RelatedPhones'
import RecentlyViewed from '@/components/RecentlyViewed'
import ViewTracker from '@/components/ViewTracker'
import SpecExplainer from '@/components/SpecExplainer'
import PriceHistory from '@/components/PriceHistory'
import PhoneJsonLd from '@/components/PhoneJsonLd'
import PriceAlertButton from '@/components/PriceAlertButton'
import PhoneTracker from '@/components/PhoneTracker'
import SpecScoreBadge from '@/components/SpecScoreBadge'
import { formatPriceINR } from '@/lib/format'
import { buildAmazonSearchUrl } from '@/lib/affiliate'

export const revalidate = 60

const ICONS: Record<string, string> = {
  Display: '🖥️', Performance: '⚡', Camera: '📷',
  Battery: '🔋', Connectivity: '📡', Build: '🏗️',
  Storage: '💾', General: '📋',
}

async function getPhone(slug: string) {
  const { data: phone } = await supabase.from('phones').select('*').eq('slug', slug).single()
  if (!phone) return null
  const { data: specs } = await supabase.from('phone_specs').select('*').eq('phone_id', phone.id).order('id')
  return { phone, specs: specs || [] }
}

async function getComparisonCandidates(phone: any) {
  if (!phone.price_inr) return []
  const minPrice = phone.price_inr / 1.6
  const maxPrice = phone.price_inr * 1.6
  const { data } = await supabase
    .from('phones')
    .select('slug, name, brand, price_inr')
    .neq('id', phone.id)
    .gte('price_inr', minPrice)
    .lte('price_inr', maxPrice)
    .not('price_inr', 'is', null)
    .limit(3)
  return data || []
}

export default async function PhonePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getPhone(slug)
  if (!data) notFound()
  const { phone, specs } = data
  const comparisonCandidates = await getComparisonCandidates(phone)

  const grouped = specs.reduce((acc: Record<string, any[]>, s: any) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  const highlights = ['Camera', 'Battery', 'Display', 'Performance']

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 text-[var(--text)]">
      <PhoneTracker deviceId={phone.id} />
      <PhoneJsonLd phone={phone} specs={specs} />
      <div className="text-sm text-[rgba(255,255,255,0.4)] mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neon-cyan">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/phones" className="hover:text-neon-cyan">Phones</Link>
        <span>&rsaquo;</span>
        <Link href={`/phones?brand=${phone.brand}`} className="hover:text-neon-cyan">{phone.brand}</Link>
        <span>&rsaquo;</span>
        <span className="text-[rgba(255,255,255,0.65)]">{phone.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(255,255,255,0.06)] p-6 sticky top-20">
            <div className="w-full aspect-square bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mb-5 text-7xl overflow-hidden">
              {phone.image_url
                ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full p-2" />
                : '📱'}
            </div>
            <h1 className="text-xl font-bold text-white mb-1">{phone.name}</h1>
            <p className="text-sm text-[rgba(255,255,255,0.4)] mb-4">{phone.brand}</p>
            <SpecScoreBadge specs={specs} overrideScore={phone.spec_score_override} />

            {phone.price_inr && (
              <div className="price-tag rounded-xl px-4 py-3 mb-4 text-center">
                <div className="text-xs text-neon-cyan mb-0.5">Starting price in India</div>
                <div className="text-2xl font-bold text-neon-cyan">{formatPriceINR(phone.price_inr)}</div>
              </div>
            )}

            {phone.released_at && (
              <p className="text-xs text-[rgba(255,255,255,0.4)] text-center mb-4">
                Released {new Date(phone.released_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(phone.name)}`} target="_blank"
                className="w-full bg-gradient-to-r from-neon-violet to-neon-cyan text-black rounded-xl py-2.5 text-sm font-medium hover:brightness-110 transition text-center">
                Check on Flipkart →
              </a>
              <a href={buildAmazonSearchUrl(phone.name)} target="_blank"
                className="w-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.85)] rounded-xl py-2.5 text-sm font-medium hover:border-neon-violet hover:text-white hover:glow transition text-center">
                Check on Amazon →
              </a>
              <WishlistButton phoneId={phone.id} />
              <PriceAlertButton phoneId={phone.id} phoneName={phone.name} currentPrice={phone.price_inr} />
              <Link href={`/compare?a=${phone.slug}`}
                className="w-full text-center border border-dashed border-[rgba(255,255,255,0.08)] text-dim rounded-xl py-2.5 text-sm hover:border-neon-cyan hover:text-neon-cyan transition">
                + Add to compare
              </Link>
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
                    href={`/compare/${[phone.slug, c.slug].sort().join('-vs-')}`}
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
                      {spec.value}
                      <SpecExplainer label={spec.label} value={spec.value} phoneName={phone.name} />
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

          <RelatedPhones phoneId={phone.id} brand={phone.brand} priceInr={phone.price_inr} />
          <PriceHistory phoneId={phone.id} currentPrice={phone.price_inr} />
          <RecentlyViewed currentSlug={slug} />
          <Reviews phoneId={phone.id} />
          <ViewTracker slug={slug} />
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: phone } = await supabase.from('phones').select('*').eq('slug', slug).single()
  if (!phone) return { title: 'Phone not found' }
  return {
    title: phone.price_inr
      ? `${phone.name} Price in India (${formatPriceINR(phone.price_inr)}) | Full Specs`
      : `${phone.name} Full Specs & Price in India`,
    description: `${phone.name} full specifications, price in India (${formatPriceINR(phone.price_inr)}), camera, battery, display and more. Compare models side by side to find the best deal.`,
    keywords: [phone.name, phone.brand, 'specs', 'price India', 'review'],
    openGraph: {
      title: `${phone.name} — Full Specs & Price`,
      description: `${phone.name} specifications and price in India.`,
      images: phone.image_url ? [{ url: phone.image_url }] : [],
      url: `https://avsurge.com/phones/${slug}`,
    },
    alternates: { canonical: `https://avsurge.com/phones/${slug}` }
  }
}
