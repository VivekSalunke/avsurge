import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SortableDeviceGrid from '@/components/SortableDeviceGrid'

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

  if ((!phones || phones.length === 0) && (!tablets || tablets.length === 0) && (!laptops || laptops.length === 0)) notFound()

  const allPrices = [
    ...(phones || []).filter(p => p.price_inr).map(p => p.price_inr),
    ...(tablets || []).filter(t => t.price_inr).map(t => t.price_inr),
    ...(laptops || []).filter(l => l.price_inr).map(l => l.price_inr),
  ]
  const minPrice = allPrices.length ? Math.min(...allPrices) : null
  const maxPrice = allPrices.length ? Math.max(...allPrices) : null
  const totalDevices = (phones?.length || 0) + (tablets?.length || 0) + (laptops?.length || 0)

  const itemListSchema = totalDevices > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${brandName} Devices on AVSurge`,
    description: `Browse all ${brandName} phones, tablets and laptops available in India.`,
    itemListElement: [
      ...(phones || []).map((p: any) => ({ url: `https://avsurge.com/phones/${p.slug}`, name: p.name })),
      ...(tablets || []).map((t: any) => ({ url: `https://avsurge.com/tablets/${t.slug}`, name: t.name })),
      ...(laptops || []).map((l: any) => ({ url: `https://avsurge.com/laptops/${l.slug}`, name: l.name })),
    ].slice(0, 50).map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: item.url,
      name: item.name,
    })),
  } : null

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 text-[var(--text)]">
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}

      {/* Breadcrumb */}
      <div className="text-sm text-[rgba(255,255,255,0.4)] mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neon-cyan">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/brands" className="hover:text-neon-cyan">Brands</Link>
        <span>&rsaquo;</span>
        <span className="text-[rgba(255,255,255,0.65)]">{brandName}</span>
      </div>

      {/* Brand header */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] p-6 mb-8 neon-border">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-[rgba(6,182,212,0.06)] rounded-2xl flex items-center justify-center text-4xl">
            {brandIcons[brandName] || '📱'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{brandName} Devices in India</h1>
            <p className="text-sm text-[rgba(255,255,255,0.4)] mt-0.5">
              {totalDevices} devices
              {minPrice && maxPrice && ` · Prices from ₹${minPrice.toLocaleString('en-IN')} to ₹${maxPrice.toLocaleString('en-IN')}`}
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-dim">
          {(phones?.length || 0) > 0 && <span>📱 {phones?.length} phones</span>}
          {(tablets?.length || 0) > 0 && <span>📟 {tablets?.length} tablets</span>}
          {(laptops?.length || 0) > 0 && <span>💻 {laptops?.length} laptops</span>}
        </div>
      </div>

      {/* Phones section */}
      {(phones?.length || 0) > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">📱 {brandName} Phones</h2>
            <span className="text-xs text-[rgba(255,255,255,0.4)]">{phones?.length} phones</span>
          </div>
          <SortableDeviceGrid devices={phones || []} basePath="phones" fallbackIcon="📱" />
        </div>
      )}

      {/* Tablets section */}
      {(tablets?.length || 0) > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">📟 {brandName} Tablets</h2>
            <span className="text-xs text-[rgba(255,255,255,0.4)]">{tablets?.length} tablets</span>
          </div>
          <SortableDeviceGrid devices={tablets || []} basePath="tablets" fallbackIcon="📟" />
        </div>
      )}

      {/* Laptops section */}
      {(laptops?.length || 0) > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">💻 {brandName} Laptops</h2>
            <span className="text-xs text-[rgba(255,255,255,0.4)]">{laptops?.length} laptops</span>
          </div>
          <SortableDeviceGrid devices={laptops || []} basePath="laptops" fallbackIcon="💻" />
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
