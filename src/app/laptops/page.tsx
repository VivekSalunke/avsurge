import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import LaptopFilters from '@/components/LaptopFilters'
import { parseLaptopSpecs, getFinalLaptopSpecScore, SpecRow } from '@/lib/laptopSpecScore'

export const revalidate = 60
export const metadata = {
  title: 'Laptops Price List in India 2026 | AVSurge',
  alternates: { canonical: 'https://avsurge.com/laptops' },
  description: 'Browse all laptops available in India. Compare laptop specs, prices and reviews. Find the best laptop for your budget.',
}

interface Laptop {
  id: number
  name: string
  brand: string
  slug: string
  price_inr: number | null
  image_url: string | null
  created_at?: string | null
  view_count?: number | null
  spec_score_override?: number | null
}
interface BrandRow {
  brand: string
}

export default async function LaptopsPage({ searchParams }: { searchParams: Promise<{ brand?: string }> }) {
  const params = await searchParams
  const brand = params?.brand
  let query = supabase.from('laptops').select('*').order('created_at', { ascending: false })
  if (brand) query = query.ilike('brand', brand)
  const { data: laptops } = await query
  const { data: brandsRaw } = await supabase.from('laptops').select('brand')
  const brands = [...new Set((brandsRaw || []).map((b: BrandRow) => b.brand))].sort()
  const brandIcons: Record<string, string> = {
    Apple: '🍎', Dell: '🔵', HP: '🔷', Lenovo: '🔲',
    ASUS: '🟥', Acer: '🟢', Microsoft: '🪟', Samsung: '🔵',
    MSI: '🔴', Razer: '🟢', LG: '🟣',
  }

  const laptopIds = (laptops || []).map((l: Laptop) => l.id)
  const { data: allSpecs } = laptopIds.length > 0
    ? await supabase.from('laptop_specs').select('laptop_id, category, label, value').in('laptop_id', laptopIds)
    : { data: [] as (SpecRow & { laptop_id: number })[] }

  const specsByLaptop = new Map<number, SpecRow[]>()
  for (const spec of allSpecs || []) {
    const list = specsByLaptop.get(spec.laptop_id) || []
    list.push({ category: spec.category, label: spec.label, value: spec.value })
    specsByLaptop.set(spec.laptop_id, list)
  }

  const enrichedLaptops = (laptops || []).map((laptop: Laptop) => {
    const specs = specsByLaptop.get(laptop.id) || []
    const parsed = parseLaptopSpecs(specs)
    const processorRaw = specs.find(s => s.label.toLowerCase() === 'processor')?.value ?? null
    return {
      id: laptop.id,
      slug: laptop.slug,
      name: laptop.name,
      brand: laptop.brand,
      price_inr: laptop.price_inr,
      image_url: laptop.image_url,
      created_at: laptop.created_at,
      view_count: laptop.view_count,
      score: getFinalLaptopSpecScore(specs, laptop.spec_score_override),
      ramGB: parsed.ramGB,
      storageGB: parsed.storageGB,
      processorRaw,
    }
  })

  const itemListSchema = laptops && laptops.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: brand ? `${brand} Laptops` : 'All Laptops',
    description: 'Browse laptops available in India with specs, prices and reviews.',
    itemListElement: laptops.slice(0, 50).map((laptop: Laptop, idx: number) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `https://avsurge.com/laptops/${laptop.slug}`,
      name: laptop.name,
    })),
  } : null

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 text-[var(--text)]">
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}

      <div className="rounded-2xl p-8 mb-8 text-white border border-[rgba(255,255,255,0.06)] bg-[var(--panel)]">
        <p className="text-dim text-xs mb-2 uppercase tracking-widest font-medium">India's laptop database</p>
        <h1 className="text-3xl font-bold mb-2">Find your perfect laptop</h1>
        <p className="text-[rgba(255,255,255,0.65)] mb-6 max-w-md">Specs, prices and comparisons for every laptop in India.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/compare-laptops" className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] px-5 py-2.5 text-sm font-semibold text-[rgba(255,255,255,0.85)] transition-all duration-200 hover:border-neon-violet hover:text-white hover:glow">
            Compare laptops
          </Link>
          <Link href="/best-laptops/50000" className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] px-5 py-2.5 text-sm font-semibold text-[rgba(255,255,255,0.85)] transition-all duration-200 hover:border-neon-cyan hover:text-white hover:glow">
            Browse by budget
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/leaderboard"
          className="px-3 py-1.5 rounded-full text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]">
          🔥 Trending laptops
        </Link>
        <Link href="/brands"
          className="px-3 py-1.5 rounded-full text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]">
          🏷️ Browse by brand
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-base font-bold text-white mb-4">Browse by budget</h2>
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
              className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 text-center hover:border-[rgba(6,182,212,0.35)] hover:glow transition-all duration-200 group card-hover">
              <div className="text-2xl mb-1">💻</div>
              <p className="text-xs font-semibold text-[rgba(255,255,255,0.85)] group-hover:text-neon-cyan transition">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-bold text-dim uppercase tracking-widest mb-3">Browse by use case</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '🎮 Gaming', href: '/best-laptops-for/gaming' },
            { label: '🎬 Video Editing', href: '/best-laptops-for/video-editing' },
            { label: '🎓 Students', href: '/best-laptops-for/students' },
            { label: '💼 Business', href: '/best-laptops-for/business' },
            { label: '💻 Programming', href: '/best-laptops-for/programming' },
            { label: '✈️ Lightweight', href: '/best-laptops-for/lightweight' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="px-3 py-1.5 rounded-full text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]">
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/laptops"
          className={`px-3 py-1.5 rounded-full text-sm border transition ${!brand ? 'border-transparent bg-gradient-to-r from-neon-cyan to-neon-violet text-black shadow-sm' : 'bg-[var(--card-bg)] text-[rgba(255,255,255,0.85)] border-[rgba(255,255,255,0.06)] hover:border-neon-cyan hover:text-neon-cyan'}`}>
          All
        </Link>
        {brands.map((b: string) => (
          <Link key={b} href={`/laptops?brand=${b}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition ${brand === b ? 'border-transparent bg-gradient-to-r from-neon-cyan to-neon-violet text-black shadow-sm' : 'bg-[var(--card-bg)] text-[rgba(255,255,255,0.85)] border-[rgba(255,255,255,0.06)] hover:border-neon-cyan hover:text-neon-cyan'}`}>
            <span>{brandIcons[b] || '💻'}</span>{b}
          </Link>
        ))}
      </div>

      {(!laptops || laptops.length === 0) ? (
        <div className="bg-[var(--card-bg)] border border-dashed border-[rgba(255,255,255,0.06)] rounded-2xl py-20 text-center text-[rgba(255,255,255,0.4)]">
          <div className="text-4xl mb-3">💻</div>
          <p className="text-sm">No laptops yet. Add some from the admin panel.</p>
        </div>
      ) : (
        <LaptopFilters devices={enrichedLaptops} />
      )}
    </main>
  )
}
