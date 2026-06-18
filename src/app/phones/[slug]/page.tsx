import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Reviews from '@/components/Reviews'
import WishlistButton from '@/components/WishlistButton'
import RelatedPhones from '@/components/RelatedPhones'
import RecentlyViewed from '@/components/RecentlyViewed'
import ViewTracker from '@/components/ViewTracker'
import PriceHistory from '@/components/PriceHistory'
import PriceAlertButton from '@/components/PriceAlertButton'

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

export default async function PhonePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getPhone(slug)
  if (!data) notFound()
  const { phone, specs } = data

  const grouped = specs.reduce((acc: Record<string, any[]>, s: any) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  const highlights = ['Camera', 'Battery', 'Display', 'Performance']

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/phones" className="hover:text-blue-600">Phones</Link>
        <span>&rsaquo;</span>
        <Link href={`/phones?brand=${phone.brand}`} className="hover:text-blue-600">{phone.brand}</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">{phone.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-20">
            <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-5 text-7xl overflow-hidden">
              {phone.image_url
                ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full" />
                : '📱'}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{phone.name}</h1>
            <p className="text-sm text-gray-400 mb-4">{phone.brand}</p>

            {phone.price_inr && (
              <div className="bg-blue-50 rounded-xl px-4 py-3 mb-4 text-center">
                <div className="text-xs text-blue-400 mb-0.5">Starting price in India</div>
                <div className="text-2xl font-bold text-blue-700">₹{phone.price_inr.toLocaleString('en-IN')}</div>
              </div>
            )}

            {phone.released_at && (
              <p className="text-xs text-gray-400 text-center mb-4">
                Released {new Date(phone.released_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(phone.name)}`} target="_blank"
                className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700 transition text-center">
                Check on Flipkart →
              </a>
              <a href={`https://www.amazon.in/s?k=${encodeURIComponent(phone.name)}`} target="_blank"
                className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition text-center">
                Check on Amazon →
              </a>
              <WishlistButton phoneId={phone.id} />
              <PriceAlertButton phoneId={phone.id} phoneName={phone.name} currentPrice={phone.price_inr} />
              <Link href={`/compare?a=${phone.slug}`}
                className="w-full text-center border border-dashed border-gray-300 text-gray-500 rounded-xl py-2.5 text-sm hover:border-blue-400 hover:text-blue-600 transition">
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
                  <div key={cat} className="bg-white border border-gray-200 rounded-xl p-3">
                    <div className="text-xl mb-1">{ICONS[cat]}</div>
                    <div className="text-xs text-gray-400 mb-0.5">{cat}</div>
                    <div className="text-sm font-semibold text-gray-800 leading-tight">{first.value}</div>
                  </div>
                )
              })}
            </div>
          )}

          {Object.entries(grouped).map(([category, catSpecs]: [string, any]) => (
            <div key={category} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <span>{ICONS[category] || '📋'}</span>
                <span className="text-sm font-semibold text-gray-700">{category}</span>
              </div>
              <table className="w-full">
                <tbody>
                  {catSpecs.map((spec: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-5 py-3 text-sm text-gray-400 w-2/5">{spec.label}</td>
                      <td className="px-5 py-3 text-sm text-gray-900 font-medium">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {specs.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400 text-sm">
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
    title: `${phone.name} Specs & Price in India`,
    description: `${phone.name} full specifications, price in India (₹${phone.price_inr?.toLocaleString('en-IN') || 'N/A'}), camera, battery, display and more.`,
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
