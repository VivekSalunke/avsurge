import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import DeviceOfTheDayWrapper from '@/components/DeviceOfTheDayWrapper'
import RecentlyViewedHome from '@/components/RecentlyViewedHome'

export const revalidate = 60

export default async function HomePage() {
  const [
    { data: latestPhones },
    { data: budgetPhones },
    { data: premiumPhones },
    { data: reviews },
    { data: allPhones },
    { data: brandsRaw },
    { data: latestTablets },
    { data: allTablets },
    { data: latestLaptops },
    { data: allLaptops },
  ] = await Promise.all([
    supabase.from('phones').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('phones').select('*').lte('price_inr', 40000).order('price_inr', { ascending: true }).limit(6),
    supabase.from('phones').select('*').gte('price_inr', 80000).order('price_inr', { ascending: false }).limit(6),
    supabase.from('reviews').select('phone_id, rating'),
    supabase.from('phones').select('*'),
    supabase.from('phones').select('brand'),
    supabase.from('tablets').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('tablets').select('id'),
    supabase.from('laptops').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('laptops').select('id'),
  ])

  // Top rated phones
  const ratingMap: Record<number, { total: number; count: number }> = {}
  for (const r of reviews || []) {
    if (!ratingMap[r.phone_id]) ratingMap[r.phone_id] = { total: 0, count: 0 }
    ratingMap[r.phone_id].total += r.rating
    ratingMap[r.phone_id].count += 1
  }
  const topRated = (allPhones || [])
    .filter(p => ratingMap[p.id]?.count >= 1)
    .sort((a, b) => {
      const avgA = ratingMap[a.id].total / ratingMap[a.id].count
      const avgB = ratingMap[b.id].total / ratingMap[b.id].count
      return avgB - avgA
    })
    .slice(0, 6)

  const brands = [...new Set((brandsRaw || []).map((b: any) => b.brand))].sort()

  const brandIcons: Record<string, string> = {
    Samsung: '🔵', Apple: '🍎', OnePlus: '🔴', Google: '🟡',
    Xiaomi: '🟠', Realme: '🟢', Vivo: '🔷', OPPO: '🟣',
    Nothing: '⚫', iQOO: '🔸', Motorola: '🔹',
  }

  const PhoneCard = ({ phone }: { phone: any }) => (
    <Link href={`/phones/${phone.slug}`}
      className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:border-blue-400 hover:shadow-sm transition group">
      <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
        {phone.image_url
          ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full" />
          : <span className="text-4xl">📱</span>}
      </div>
      <p className="text-xs text-gray-400 mb-0.5">{phone.brand}</p>
      <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-blue-600 transition line-clamp-2">{phone.name}</p>
      {phone.price_inr && (
        <p className="text-xs text-blue-600 font-medium mt-1">₹{phone.price_inr.toLocaleString('en-IN')}</p>
      )}
    </Link>
  )

  const TabletCard = ({ tablet }: { tablet: any }) => (
    <Link href={`/tablets/${tablet.slug}`}
      className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:border-blue-400 hover:shadow-sm transition group">
      <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
        {tablet.image_url
          ? <img src={tablet.image_url} alt={tablet.name} className="object-contain w-full h-full" />
          : <span className="text-4xl">📟</span>}
      </div>
      <p className="text-xs text-gray-400 mb-0.5">{tablet.brand}</p>
      <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-blue-600 transition line-clamp-2">{tablet.name}</p>
      {tablet.price_inr && (
        <p className="text-xs text-blue-600 font-medium mt-1">₹{tablet.price_inr.toLocaleString('en-IN')}</p>
      )}
    </Link>
  )

  const LaptopCard = ({ laptop }: { laptop: any }) => (
    <Link href={`/laptops/${laptop.slug}`}
      className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:border-blue-400 hover:shadow-sm transition group">
      <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
        {laptop.image_url
          ? <img src={laptop.image_url} alt={laptop.name} className="object-contain w-full h-full" />
          : <span className="text-4xl">💻</span>}
      </div>
      <p className="text-xs text-gray-400 mb-0.5">{laptop.brand}</p>
      <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-blue-600 transition line-clamp-2">{laptop.name}</p>
      {laptop.price_inr && (
        <p className="text-xs text-blue-600 font-medium mt-1">₹{laptop.price_inr.toLocaleString('en-IN')}</p>
      )}
    </Link>
  )

  const Section = ({ title, href, phones, badge }: { title: string, href: string, phones: any[], badge?: string }) => (
    phones.length > 0 ? (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            {badge && <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">{badge}</span>}
          </div>
          <Link href={href} className="text-sm text-blue-600 hover:underline">See all →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {phones.map((phone: any) => <PhoneCard key={phone.id} phone={phone} />)}
        </div>
      </div>
    ) : null
  )

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 mb-10 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <p className="text-blue-200 text-xs mb-2 uppercase tracking-widest font-medium">India's device database</p>
          <h1 className="text-3xl font-bold mb-2">Find your perfect device</h1>
          <p className="text-blue-100 mb-6 max-w-md">Specs, prices, comparisons and reviews for every phone, tablet and laptop in India.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/phones" className="bg-white text-blue-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition">
              Browse phones
            </Link>
            <Link href="/tablets" className="bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/30 transition">
              Browse tablets
            </Link>
            <Link href="/laptops" className="bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/30 transition">
              Browse laptops
            </Link>
            <Link href="/search" className="border border-white/40 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition">
              Search & Discover →
            </Link>
            <Link href="/compare" className="border border-white/40 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition">
              Compare →
            </Link>
          </div>
        </div>
      </div>

      <DeviceOfTheDayWrapper />

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-10">
        {[
          { label: 'Phones', value: (allPhones?.length || 0) + '+', icon: '📱' },
          { label: 'Tablets', value: (allTablets?.length || 0) + '+', icon: '📟' },
          { label: 'Brands', value: brands.length + '+', icon: '🏷️' },
          { label: 'Reviews', value: (reviews?.length || 0) + '+', icon: '⭐' },
          { label: 'Laptops', value: (allLaptops?.length || 0) + '+', icon: '💻' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <div className="text-xl mb-0.5">{stat.icon}</div>
            <div className="text-base font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <RecentlyViewedHome />

      {/* Browse by Budget */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Browse by budget</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Under ₹10K', budget: 10000 },
            { label: 'Under ₹15K', budget: 15000 },
            { label: 'Under ₹20K', budget: 20000 },
            { label: 'Under ₹30K', budget: 30000 },
            { label: 'Under ₹50K', budget: 50000 },
            { label: 'Under ₹1L', budget: 100000 },
          ].map(({ label, budget }) => (
            <Link key={budget} href={`/best-phones/${budget}`}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-sm transition group">
              <div className="text-2xl mb-1">💰</div>
              <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition">{label}</p>
            </Link>
          ))}
        </div>
      </div>


      {/* Browse by Budget - Laptops */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Browse laptops by budget</h2>
          <Link href="/laptops" className="text-sm text-blue-600 hover:underline">All laptops →</Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Under ₹30K', budget: 30000 },
            { label: 'Under ₹50K', budget: 50000 },
            { label: 'Under ₹70K', budget: 70000 },
            { label: 'Under ₹1L', budget: 100000 },
            { label: 'Under ₹1.5L', budget: 150000 },
            { label: 'Under ₹2L', budget: 200000 },
          ].map(({ label, budget }) => (
            <Link key={budget} href={`/best-laptops/${budget}`}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-sm transition group">
              <div className="text-2xl mb-1">💻</div>
              <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest phones */}
      <Section title="Latest phones" href="/phones" phones={latestPhones || []} badge="New" />

      {/* Top rated */}
      {topRated.length > 0 && (
        <Section title="Top rated" href="/phones" phones={topRated} badge="⭐ Rated" />
      )}

      {/* Budget phones */}
      <Section title="Best under ₹40,000" href="/phones?maxPrice=40000" phones={budgetPhones || []} badge="Budget" />

      {/* Premium phones */}
      <Section title="Premium phones" href="/phones?minPrice=80000" phones={premiumPhones || []} badge="Flagship" />

      {/* Tablets section */}
      {(latestTablets || []).length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">Latest tablets</h2>
              <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">📟 New</span>
            </div>
            <Link href="/tablets" className="text-sm text-blue-600 hover:underline">See all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(latestTablets || []).map((tablet: any) => <TabletCard key={tablet.id} tablet={tablet} />)}
          </div>
        </div>
      )}

      {/* Latest laptops */}
      {(latestLaptops || []).length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">Latest laptops</h2>
              <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">💻 New</span>
            </div>
            <Link href="/laptops" className="text-sm text-blue-600 hover:underline">See all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(latestLaptops || []).map((laptop: any) => <LaptopCard key={laptop.id} laptop={laptop} />)}
          </div>
        </div>
      )}

      {/* Browse by use case */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Browse by use case</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: '🎮 Gaming', phone: '/best-phones-for/gaming', laptop: '/best-laptops-for/gaming' },
            { label: '📷 Camera', phone: '/best-phones-for/camera', laptop: null },
            { label: '🎓 Students', phone: '/best-phones-for/students', laptop: '/best-laptops-for/students' },
            { label: '🔋 Battery', phone: '/best-phones-for/battery', laptop: null },
            { label: '💼 Business', phone: '/best-phones-for/business', laptop: '/best-laptops-for/business' },
            { label: '✏️ Drawing', phone: null, laptop: '/best-tablets-for/drawing' },
          ].map(item => (
            <Link key={item.label} href={item.phone || item.laptop || '/search'}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:shadow-sm transition group">
              <p className="text-2xl mb-1">{item.label.split(' ')[0]}</p>
              <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition">{item.label.split(' ').slice(1).join(' ')}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <Link href="/compare" className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group">
          <div className="text-3xl mb-3">📱</div>
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 text-sm">Compare Phones</h3>
          <p className="text-xs text-gray-400">Side by side</p>
        </Link>
        <Link href="/compare-tablets" className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group">
          <div className="text-3xl mb-3">📟</div>
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 text-sm">Compare Tablets</h3>
          <p className="text-xs text-gray-400">Side by side</p>
        </Link>
        <Link href="/compare-laptops" className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group">
          <div className="text-3xl mb-3">💻</div>
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 text-sm">Compare Laptops</h3>
          <p className="text-xs text-gray-400">Side by side</p>
        </Link>
        <Link href="/search" className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 text-sm">Search & Filter</h3>
          <p className="text-xs text-gray-400">Find by budget & specs</p>
        </Link>
        <Link href="/ai-recommend" className="bg-white border border-purple-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-sm transition group">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-600 text-sm">AI Recommender</h3>
          <p className="text-xs text-gray-400">Get AI suggestions</p>
        </Link>
        <Link href="/news" className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group">
          <div className="text-3xl mb-3">📰</div>
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 text-sm">Latest News</h3>
          <p className="text-xs text-gray-400">Reviews & tech news</p>
        </Link>
        <Link href="/about" className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group">
          <div className="text-3xl mb-3">ℹ️</div>
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 text-sm">About Us</h3>
          <p className="text-xs text-gray-400">Learn about AVSurge</p>
        </Link>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Browse by brand</h2>
            <Link href="/brands" className="text-sm text-blue-600 hover:underline">All brands →</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand: any) => (
              <Link key={brand} href={`/phones?brand=${brand}`}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition">
                <span>{brandIcons[brand] || '📱'}</span>
                {brand}
              </Link>
            ))}
          </div>
        </div>
      )}

    </main>
  )
}
