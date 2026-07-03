import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

const brandIcons: Record<string, string> = {
  Samsung: '🔵', Apple: '🍎', OnePlus: '🔴', Google: '🟡',
  Xiaomi: '🟠', Realme: '🟢', Vivo: '🔷', OPPO: '🟣',
  Nothing: '⚫', iQOO: '🔸', Motorola: '🔹', Lenovo: '🔲',
  ASUS: '🟥', Honor: '🟡', Nokia: '🔵', Nubia: '🔴',
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const brandName = decodeURIComponent(brand)

  const [{ data: phones }, { data: tablets }, { data: laptops }] = await Promise.all([
    supabase.from('phones').select('*').ilike('brand', brandName).order('price_inr', { ascending: true }),
    supabase.from('tablets').select('*').ilike('brand', brandName).order('price_inr', { ascending: true }),
    supabase.from('laptops').select('*').ilike('brand', brandName).order('price_inr', { ascending: true }),
  ])

  if ((!phones || phones.length === 0) && (!tablets || tablets.length === 0)) notFound()

  const allPrices = [
    ...(phones || []).filter(p => p.price_inr).map(p => p.price_inr),
    ...(tablets || []).filter(t => t.price_inr).map(t => t.price_inr),
    ...(laptops || []).filter(l => l.price_inr).map(l => l.price_inr),
  ]
  const minPrice = allPrices.length ? Math.min(...allPrices) : null
  const maxPrice = allPrices.length ? Math.max(...allPrices) : null
  const totalDevices = (phones?.length || 0) + (tablets?.length || 0) + (laptops?.length || 0)

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/brands" className="hover:text-blue-600">Brands</Link>
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
            <h1 className="text-2xl font-bold text-gray-900">{brandName} Devices in India</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {totalDevices} devices
              {minPrice && maxPrice && ` · Prices from ₹${minPrice.toLocaleString('en-IN')} to ₹${maxPrice.toLocaleString('en-IN')}`}
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          {(phones?.length || 0) > 0 && <span>📱 {phones?.length} phones</span>}
          {(tablets?.length || 0) > 0 && <span>📟 {tablets?.length} tablets</span>}
          {(laptops?.length || 0) > 0 && <span>💻 {laptops?.length} laptops</span>}
        </div>
      </div>

      {/* Phones section */}
      {(phones?.length || 0) > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">📱 {brandName} Phones</h2>
            <span className="text-xs text-gray-400">{phones?.length} phones</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(phones || []).map((phone: any) => (
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
        </div>
      )}

      {/* Tablets section */}
      {(tablets?.length || 0) > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">📟 {brandName} Tablets</h2>
            <span className="text-xs text-gray-400">{tablets?.length} tablets</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(tablets || []).map((tablet: any) => (
              <Link key={tablet.id} href={`/tablets/${tablet.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 transition group">
                <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  {tablet.image_url
                    ? <img src={tablet.image_url} alt={tablet.name} className="object-contain w-full h-full" />
                    : <span className="text-4xl">📟</span>}
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-blue-600 transition line-clamp-2">{tablet.name}</p>
                {tablet.price_inr && (
                  <p className="text-xs text-blue-600 font-medium mt-1">₹{tablet.price_inr.toLocaleString('en-IN')}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
      {/* Laptops section */}
      {(laptops?.length || 0) > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">💻 {brandName} Laptops</h2>
            <span className="text-xs text-gray-400">{laptops?.length} laptops</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(laptops || []).map((laptop: any) => (
              <Link key={laptop.id} href={`/laptops/${laptop.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 transition group">
                <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  {laptop.image_url
                    ? <img src={laptop.image_url} alt={laptop.name} className="object-contain w-full h-full" />
                    : <span className="text-4xl">💻</span>}
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-blue-600 transition line-clamp-2">{laptop.name}</p>
                {laptop.price_inr && (
                  <p className="text-xs text-blue-600 font-medium mt-1">₹{laptop.price_inr.toLocaleString('en-IN')}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const brandName = decodeURIComponent(brand)
  const [{ data: phones }, { data: tablets }, { data: laptopData }] = await Promise.all([
    supabase.from('phones').select('id').ilike('brand', brandName),
    supabase.from('tablets').select('id').ilike('brand', brandName),
    supabase.from('laptops').select('id').ilike('brand', brandName),
  ])
  const total = (phones?.length || 0) + (tablets?.length || 0) + (laptopData?.length || 0)
  return {
    title: `${brandName} Phones & Tablets Price List in India`,
    description: `Browse all ${brandName} smartphones, tablets and laptops in India. ${total} ${brandName} devices available with specs and prices.`,
    alternates: { canonical: `https://avsurge.com/brands/${brand}` },
  }
}

export async function generateStaticParams() {
  const [{ data: phones }, { data: tablets }, { data: laptops }] = await Promise.all([
    supabase.from('phones').select('brand'),
    supabase.from('tablets').select('brand'),
    supabase.from('laptops').select('brand'),
  ])
  const [{ data: laptopBrands }] = await Promise.all([
    supabase.from('laptops').select('brand'),
  ])
  const brands = [...new Set([
    ...(phones || []).map(p => p.brand),
    ...(tablets || []).map(t => t.brand),
    ...(laptopBrands || []).map(l => l.brand),
  ])]
  return brands.map(brand => ({ brand: encodeURIComponent(brand) }))
}
