import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const metadata = {
  title: 'Device Brands | AVSurge',
  description: 'Browse phones, tablets and laptops by brand. Find all Samsung, Apple, OnePlus, Dell, HP and more devices in India.',
  alternates: { canonical: 'https://avsurge.com/brands' },
}


export const revalidate = 60

const BrandCard = ({ brand, count, label, href, logoUrl }: {
  brand: string, count: number, label: string, href: string, logoUrl?: string
}) => (
  <Link href={href}
    className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group text-center">
    <div className="w-full h-16 bg-gray-50 rounded-xl flex items-center justify-center mb-3 overflow-hidden px-3">
      {logoUrl ? (
        <img src={logoUrl} alt={brand} className="object-contain max-h-10 max-w-full" />
      ) : (
        <span className="text-lg font-bold text-gray-500">{brand}</span>
      )}
    </div>
    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition text-sm">{brand}</h3>
    <p className="text-xs text-gray-400 mt-1">{count} {label}{count !== 1 ? 's' : ''}</p>
  </Link>
)

export default async function BrandsPage() {
  const [{ data: phonesRaw }, { data: tabletsRaw }, { data: laptopsRaw }, { data: logoData }] = await Promise.all([
    supabase.from('phones').select('brand'),
    supabase.from('tablets').select('brand'),
    supabase.from('laptops').select('brand'),
    supabase.from('brand_logos').select('brand, logo_url'),
  ])

  const logoMap: Record<string, string> = {}
  for (const l of logoData || []) logoMap[l.brand] = l.logo_url

  const phoneBrandCount: Record<string, number> = {}
  for (const p of phonesRaw || []) phoneBrandCount[p.brand] = (phoneBrandCount[p.brand] || 0) + 1

  const tabletBrandCount: Record<string, number> = {}
  for (const t of tabletsRaw || []) tabletBrandCount[t.brand] = (tabletBrandCount[t.brand] || 0) + 1

  const laptopBrandCount: Record<string, number> = {}
  for (const l of laptopsRaw || []) laptopBrandCount[l.brand] = (laptopBrandCount[l.brand] || 0) + 1

  const phoneBrands = Object.entries(phoneBrandCount).sort((a, b) => b[1] - a[1])
  const tabletBrands = Object.entries(tabletBrandCount).sort((a, b) => b[1] - a[1])
  const laptopBrands = Object.entries(laptopBrandCount).sort((a, b) => b[1] - a[1])

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Brands</h1>
        <p className="text-sm text-gray-400">Browse phones, tablets and laptops by brand</p>
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-base font-bold text-gray-900">📱 Phone Brands</h2>
          <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">{phoneBrands.length} brands</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {phoneBrands.map(([brand, count]) => (
            <BrandCard key={brand} brand={brand} count={count} label="phone"
              href={`/brands/${encodeURIComponent(brand)}`} logoUrl={logoMap[brand]} />
          ))}
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-base font-bold text-gray-900">📟 Tablet Brands</h2>
          <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">{tabletBrands.length} brands</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tabletBrands.map(([brand, count]) => (
            <BrandCard key={brand} brand={brand} count={count} label="tablet"
              href={`/brands/${encodeURIComponent(brand)}`} logoUrl={logoMap[brand]} />
          ))}
        </div>
      </div>

      {laptopBrands.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-base font-bold text-gray-900">💻 Laptop Brands</h2>
            <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">{laptopBrands.length} brands</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {laptopBrands.map(([brand, count]) => (
              <BrandCard key={brand} brand={brand} count={count} label="laptop"
                href={`/brands/${encodeURIComponent(brand)}`} logoUrl={logoMap[brand]} />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
