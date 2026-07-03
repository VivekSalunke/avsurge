import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SpecExplainer from '@/components/SpecExplainer'
import LaptopJsonLd from '@/components/LaptopJsonLd'
import LaptopViewTracker from '@/components/LaptopViewTracker'
import RecentlyViewedLaptops from '@/components/RecentlyViewedLaptops'
import LaptopReviews from '@/components/LaptopReviews'
import LaptopWishlistButton from '@/components/LaptopWishlistButton'
import LaptopPriceAlertButton from '@/components/LaptopPriceAlertButton'
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
export default async function LaptopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getLaptop(slug)
  if (!data) notFound()
  const { laptop, specs } = data
  const grouped = specs.reduce((acc: Record<string, any[]>, s: any) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})
  const highlights = ['Performance', 'Display', 'Memory', 'Battery']
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <LaptopJsonLd laptop={laptop} specs={specs} />
      <LaptopViewTracker slug={laptop.slug} />
      <LaptopJsonLd laptop={laptop} specs={specs} />
      <LaptopViewTracker slug={laptop.slug} />
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/laptops" className="hover:text-blue-600">Laptops</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">{laptop.name}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-20">
            <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-5 overflow-hidden">
              {laptop.image_url
                ? <img src={laptop.image_url} alt={laptop.name} className="object-contain w-full h-full" />
                : <span className="text-7xl">💻</span>}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{laptop.name}</h1>
            <p className="text-sm text-gray-400 mb-4">{laptop.brand}</p>
            {laptop.price_inr && (
              <div className="bg-blue-50 rounded-xl px-4 py-3 mb-4 text-center">
                <div className="text-xs text-blue-400 mb-0.5">Starting price in India</div>
                <div className="text-2xl font-bold text-blue-700">₹{laptop.price_inr.toLocaleString('en-IN')}</div>
              </div>
            )}
            {laptop.released_at && (
              <p className="text-xs text-gray-400 text-center mb-4">
                Released {new Date(laptop.released_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            )}
            <div className="flex flex-col gap-2">
              <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(laptop.name)}`} target="_blank"
                className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700 transition text-center">
                Check on Flipkart →
              </a>
              <Link href={`/compare-laptops?a=${laptop.slug}`}
                className="w-full text-center border border-dashed border-gray-300 text-gray-500 rounded-xl py-2.5 text-sm hover:border-blue-400 hover:text-blue-600 transition">
                + Add to compare
              </Link>
              <a href={`https://www.amazon.in/s?k=${encodeURIComponent(laptop.name)}`} target="_blank"
                className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition text-center">
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
                      <td className="px-5 py-3 text-sm text-gray-900 font-medium">
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
          <LaptopReviews laptopId={laptop.id} />
          <RecentlyViewedLaptops currentSlug={laptop.slug} />
          {specs.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400 text-sm">
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
    description: `${laptop.name} full specifications, price in India (₹${laptop.price_inr?.toLocaleString('en-IN') || 'N/A'}), display, battery, performance and more.`,
    alternates: { canonical: `https://avsurge.com/laptops/${slug}` },
  }
}
