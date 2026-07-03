import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
export const revalidate = 60

const brandLogos: Record<string, string> = {
  Samsung: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png',
  Apple: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/814px-Apple_logo_black.svg.png',
  OnePlus: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/OnePlus_Logo.svg/2560px-OnePlus_Logo.svg.png',
  Google: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png',
  Xiaomi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Xiaomi_logo.svg/2560px-Xiaomi_logo.svg.png',
  Realme: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Realme_logo.svg/2560px-Realme_logo.svg.png',
  Vivo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Vivo_logo_2019.svg/2560px-Vivo_logo_2019.svg.png',
  OPPO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/OPPO_LOGO_2019.svg/2560px-OPPO_LOGO_2019.svg.png',
  Nothing: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Nothing_Logo.svg/2560px-Nothing_Logo.svg.png',
  iQOO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/IQOO_Logo.svg/2560px-IQOO_Logo.svg.png',
  Motorola: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Motorola_logo_2015.svg/2560px-Motorola_logo_2015.svg.png',
  Lenovo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lenovo_logo_2015.svg/2560px-Lenovo_logo_2015.svg.png',
  ASUS: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/2560px-ASUS_Logo.svg.png',
  Dell: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Dell_Logo.svg/2560px-Dell_Logo.svg.png',
  HP: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/2048px-HP_logo_2012.svg.png',
  Acer: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Acer_2011.svg/2560px-Acer_2011.svg.png',
  MSI: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/MSI_Logo.svg/2560px-MSI_Logo.svg.png',
  Microsoft: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png',
  Razer: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/93/Razer_logo.svg/2560px-Razer_logo.svg.png',
  LG: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/LG_logo_%282015%29.svg/2560px-LG_logo_%282015%29.svg.png',
  Nokia: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nokia_wordmark.svg/2560px-Nokia_wordmark.svg.png',
  Sony: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/2560px-Sony_logo.svg.png',
  Honor: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Honor_Magic_series_logo.svg/2560px-Honor_Magic_series_logo.svg.png',
  Infinix: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Infinix_Logo.svg/2560px-Infinix_Logo.svg.png',
  Tecno: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Tecno_Mobile_logo.svg/2560px-Tecno_Mobile_logo.svg.png',
  Lava: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Lava_International_Logo.svg/2560px-Lava_International_Logo.svg.png',
}

const brandColors: Record<string, string> = {
  Samsung: 'bg-blue-50', Apple: 'bg-gray-50', OnePlus: 'bg-red-50',
  Google: 'bg-white', Xiaomi: 'bg-orange-50', Realme: 'bg-yellow-50',
  Vivo: 'bg-blue-50', OPPO: 'bg-green-50', Nothing: 'bg-gray-50',
  iQOO: 'bg-blue-50', Motorola: 'bg-blue-50', Lenovo: 'bg-red-50',
  ASUS: 'bg-blue-50', Dell: 'bg-blue-50', HP: 'bg-blue-50',
  Acer: 'bg-green-50', MSI: 'bg-red-50', Microsoft: 'bg-gray-50',
  Razer: 'bg-green-50', LG: 'bg-red-50',
}

const BrandCard = ({ brand, count, label, href }: { brand: string, count: number, label: string, href: string }) => (
  <Link href={href}
    className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group text-center">
    <div className={`w-full h-16 ${brandColors[brand] || 'bg-gray-50'} rounded-xl flex items-center justify-center mb-3 overflow-hidden px-3`}>
      {brandLogos[brand] ? (
        <img src={brandLogos[brand]} alt={brand} className="object-contain max-h-10 max-w-full" />
      ) : (
        <span className="text-lg font-bold text-gray-600">{brand}</span>
      )}
    </div>
    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition text-sm">{brand}</h3>
    <p className="text-xs text-gray-400 mt-1">{count} {label}{count !== 1 ? 's' : ''}</p>
  </Link>
)

export default async function BrandsPage() {
  const [{ data: phonesRaw }, { data: tabletsRaw }, { data: laptopsRaw }] = await Promise.all([
    supabase.from('phones').select('brand'),
    supabase.from('tablets').select('brand'),
    supabase.from('laptops').select('brand'),
  ])

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

      {/* Phone brands */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-base font-bold text-gray-900">📱 Phone Brands</h2>
          <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">{phoneBrands.length} brands</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {phoneBrands.map(([brand, count]) => (
            <BrandCard key={brand} brand={brand} count={count} label="phone" href={`/brands/${encodeURIComponent(brand)}`} />
          ))}
        </div>
      </div>

      {/* Tablet brands */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-base font-bold text-gray-900">📟 Tablet Brands</h2>
          <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">{tabletBrands.length} brands</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tabletBrands.map(([brand, count]) => (
            <BrandCard key={brand} brand={brand} count={count} label="tablet" href={`/brands/${encodeURIComponent(brand)}`} />
          ))}
        </div>
      </div>

      {/* Laptop brands */}
      {laptopBrands.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-base font-bold text-gray-900">💻 Laptop Brands</h2>
            <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">{laptopBrands.length} brands</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {laptopBrands.map(([brand, count]) => (
              <BrandCard key={brand} brand={brand} count={count} label="laptop" href={`/brands/${encodeURIComponent(brand)}`} />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
