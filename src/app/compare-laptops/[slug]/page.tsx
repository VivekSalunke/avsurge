import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { formatPriceINR } from '@/lib/format'

export const dynamicParams = true
export const revalidate = 3600

const ICONS: Record<string, string> = {
  Display: '🖥️', Performance: '⚡', Memory: '🧠',
  Battery: '🔋', Connectivity: '📡', Build: '🏗️',
  Storage: '💾', General: '📋', Audio: '🔊', Graphics: '🎮',
}

interface Laptop {
  id: number
  name: string
  brand: string
  slug: string
  price_inr: number | null
  image_url: string | null
}

async function getPair(slugParam: string): Promise<{ laptopA: Laptop; laptopB: Laptop } | null> {
  const parts = slugParam.split('-vs-')
  if (parts.length < 2) return null

  for (let i = 1; i < parts.length; i++) {
    const slugA = parts.slice(0, i).join('-vs-')
    const slugB = parts.slice(i).join('-vs-')
    const { data } = await supabase.from('laptops').select('*').in('slug', [slugA, slugB])
    if (data && data.length === 2) {
      const laptopA = data.find((l: any) => l.slug === slugA)
      const laptopB = data.find((l: any) => l.slug === slugB)
      if (laptopA && laptopB) return { laptopA, laptopB }
    }
  }
  return null
}

export async function generateStaticParams() {
  const { data: topLaptops } = await supabase
    .from('laptops')
    .select('slug, price_inr, view_count')
    .not('price_inr', 'is', null)
    .order('view_count', { ascending: false, nullsFirst: false })
    .limit(30)

  const list = topLaptops || []
  const pairs: { slug: string }[] = []
  const seen = new Set<string>()

  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a: any = list[i], b: any = list[j]
      if (!a.price_inr || !b.price_inr) continue
      const ratio = a.price_inr > b.price_inr ? a.price_inr / b.price_inr : b.price_inr / a.price_inr
      if (ratio > 1.6) continue
      const key = [a.slug, b.slug].sort().join('-vs-')
      if (seen.has(key)) continue
      seen.add(key)
      pairs.push({ slug: `${a.slug}-vs-${b.slug}` })
    }
  }

  return pairs.slice(0, 150)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const pair = await getPair(slug)
  if (!pair) return {}
  const { laptopA, laptopB } = pair
  const title = `${laptopA.name} vs ${laptopB.name}: Compare Specs & Price`
  const description = `Compare ${laptopA.name} and ${laptopB.name} side by side — specs, performance, graphics and price in India.`
  return {
    title: `${title} | AVSurge`,
    description,
    alternates: { canonical: `https://avsurge.com/compare-laptops/${slug}` },
    openGraph: { title, description, url: `https://avsurge.com/compare-laptops/${slug}` },
  }
}

async function getSpecs(laptopId: number) {
  const { data } = await supabase.from('laptop_specs').select('*').eq('laptop_id', laptopId).order('id')
  return data || []
}

export default async function CompareLaptopPairPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pair = await getPair(slug)
  if (!pair) notFound()
  const { laptopA, laptopB } = pair

  const [specsA, specsB] = await Promise.all([getSpecs(laptopA.id), getSpecs(laptopB.id)])

  const allCategories = [...new Set([...specsA, ...specsB].map((s: any) => s.category))]
  const getLabels = (cat: string) => {
    const labels = new Set([
      ...specsA.filter((s: any) => s.category === cat).map((s: any) => s.label),
      ...specsB.filter((s: any) => s.category === cat).map((s: any) => s.label),
    ])
    return [...labels]
  }
  const getVal = (specs: any[], cat: string, label: string) =>
    specs.find((s: any) => s.category === cat && s.label === label)?.value || '—'
  const isBetter = (valA: string, valB: string) => {
    const numA = parseFloat(valA.replace(/[^0-9.]/g, ''))
    const numB = parseFloat(valB.replace(/[^0-9.]/g, ''))
    if (isNaN(numA) || isNaN(numB)) return null
    return numA > numB ? 'a' : numB > numA ? 'b' : null
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${laptopA.name} vs ${laptopB.name}`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, url: `https://avsurge.com/laptops/${laptopA.slug}`, name: laptopA.name },
      { '@type': 'ListItem', position: 2, url: `https://avsurge.com/laptops/${laptopB.slug}`, name: laptopB.name },
    ],
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 text-[var(--text)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <div className="text-sm text-[rgba(255,255,255,0.4)] mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neon-cyan">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/laptops" className="hover:text-neon-cyan">Laptops</Link>
        <span>&rsaquo;</span>
        <span className="text-[rgba(255,255,255,0.65)]">{laptopA.name} vs {laptopB.name}</span>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">{laptopA.name} vs {laptopB.name}</h1>
      <p className="text-sm text-[rgba(255,255,255,0.4)] mb-8">Full specs comparison, price and performance details</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {[laptopA, laptopB].map((laptop) => (
          <div key={laptop.id} className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 text-center">
            <div className="w-28 h-28 bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
              {laptop.image_url
                ? <img src={laptop.image_url} alt={laptop.name} className="object-contain w-full h-full p-2" />
                : <span className="text-5xl">💻</span>}
            </div>
            <p className="font-semibold text-white text-sm">{laptop.name}</p>
            <p className="text-xs text-[rgba(255,255,255,0.4)] mb-1">{laptop.brand}</p>
            {laptop.price_inr && (
              <p className="text-neon-cyan text-sm font-bold">{formatPriceINR(laptop.price_inr)}</p>
            )}
            <Link href={`/laptops/${laptop.slug}`} className="inline-block mt-2 text-xs text-neon-cyan hover:underline">
              Full specs →
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.15)] rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3 mb-8">
        <div>
          <p className="text-xs text-neon-cyan mb-0.5">Want to compare with a different laptop?</p>
          <p className="text-sm font-semibold text-neon-cyan">Use our interactive comparison tool</p>
        </div>
        <Link href={`/compare-laptops?a=${laptopA.slug}`}
          className="text-xs bg-gradient-to-r from-neon-violet to-neon-cyan text-black px-3 py-1.5 rounded-lg hover:brightness-110 transition">
          Open in compare tool →
        </Link>
      </div>

      <div className="flex flex-col gap-5">
        {allCategories.map(cat => (
          <div key={cat} className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.04)]">
              <span>{ICONS[cat] || '📋'}</span>
              <span className="text-sm font-semibold text-[rgba(255,255,255,0.85)]">{cat}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-[rgba(255,255,255,0.04)]">
              <div className="px-4 py-2 text-xs font-medium text-neon-cyan bg-[rgba(6,182,212,0.06)] truncate">{laptopA.name}</div>
              <div className="px-4 py-2 text-xs font-medium text-[rgba(255,255,255,0.4)] text-center">Spec</div>
              <div className="px-4 py-2 text-xs font-medium text-neon-violet bg-[rgba(139,92,246,0.06)] text-right truncate">{laptopB.name}</div>
            </div>
            {getLabels(cat).map((label, i) => {
              const valA = getVal(specsA, cat, label)
              const valB = getVal(specsB, cat, label)
              const winner = isBetter(valA, valB)
              return (
                <div key={label} className={`grid grid-cols-3 items-center ${i % 2 === 0 ? 'bg-[var(--card-bg)]' : 'bg-[rgba(255,255,255,0.02)]'}`}>
                  <div className={`px-4 py-3 text-sm font-medium ${winner === 'a' ? 'text-neon-cyan bg-[rgba(6,182,212,0.06)]' : 'text-[rgba(255,255,255,0.85)]'}`}>
                    {valA}
                    {winner === 'a' && <span className="ml-1.5 text-xs neon-badge px-1.5 py-0.5 rounded">✓</span>}
                  </div>
                  <div className="px-4 py-3 text-xs text-[rgba(255,255,255,0.4)] text-center">{label}</div>
                  <div className={`px-4 py-3 text-sm font-medium text-right ${winner === 'b' ? 'text-neon-violet bg-[rgba(139,92,246,0.06)]' : 'text-[rgba(255,255,255,0.85)]'}`}>
                    {winner === 'b' && <span className="mr-1.5 text-xs neon-badge px-1.5 py-0.5 rounded">✓</span>}
                    {valB}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <Link href={`/laptops/${laptopA.slug}`}
          className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-xl py-3 text-center text-sm text-neon-cyan hover:border-neon-cyan transition">
          Full specs: {laptopA.name} →
        </Link>
        <Link href={`/laptops/${laptopB.slug}`}
          className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-xl py-3 text-center text-sm text-neon-violet hover:border-neon-violet transition">
          Full specs: {laptopB.name} →
        </Link>
      </div>
    </main>
  )
}
