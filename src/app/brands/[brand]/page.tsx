import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

const brandIcons: Record<string, string> = {
  Samsung: '🔵', Apple: '🍎', OnePlus: '🔴', Google: '🟡',
  Xiaomi: '🟠', Realme: '🟢', Vivo: '🔷', OPPO: '🟣',
  Nothing: '⚫', iQOO: '🔸', Motorola: '🔹',
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const brandName = decodeURIComponent(brand)

  const { data: phones } = await supabase
    .from('phones')
    .select('*')
    .ilike('brand', brandName)
    .order('price_inr', { ascending: true })

  if (!phones || phones.length === 0) notFound()

  const priceRange = phones.filter(p => p.price_inr)
  const minPrice = Math.min(...priceRange.map(p => p.price_inr))
  const maxPrice = Math.max(...priceRange.map(p => p.price_inr))

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/phones" className="hover:text-blue-600">Phones</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">{brandName}</span>
      </div>

      {/* Brand header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl">
            {brandIcons[brandName] || '📱'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{brandName} Phones in India</h1>
            <p className="text-sm text-gray-400 mt-0.5">{phones.length} devices · Prices from ₹{minPrice?.toLocaleString('en-IN')} to ₹{maxPrice?.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Browse all {brandName} smartphones available in India. Compare specs, prices, and find the best {brandName} phone for your budget.
        </p>
      </div>

      {/* Phones grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {phones.map((phone: any) => (
          <Link key={phone.id} href={`/phones/${phone.slug}`}
            className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 transition group">
            <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
              {phone.image_url
                ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full" />
                : <span className="text-4xl">📱</span>}
            </div>
            <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-blue-600 transition line-clamp-2">{phone.name}</p>
            {phone.price_inr && (
              <p className="text-xs text-blue-600 font-medium mt-1">₹{phone.price_inr.toLocaleString('en-IN')}</p>
            )}
          </Link>
        ))}
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const brandName = decodeURIComponent(brand)
  const { data: phones } = await supabase.from('phones').select('id').ilike('brand', brandName)
  return {
    title: `${brandName} Phones Price List in India`,
    description: `Browse all ${brandName} smartphones in India. Compare ${brandName} phone prices, specs and reviews. ${phones?.length || 0} ${brandName} phones available.`,
    alternates: { canonical: `https://avsurge.com/brands/${brand}` },
  }
}

export async function generateStaticParams() {
  const { data } = await supabase.from('phones').select('brand')
  const brands = [...new Set((data || []).map(p => p.brand))]
  return brands.map(brand => ({ brand: encodeURIComponent(brand) }))
}
