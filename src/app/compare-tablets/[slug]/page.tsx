import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamicParams = true
export const revalidate = 3600

const ICONS: Record<string, string> = {
  Display: '🖥️', Performance: '⚡', Camera: '📷',
  Battery: '🔋', Connectivity: '📡', Build: '🏗️',
  Storage: '💾', General: '📋', Audio: '🔊',
}

interface Tablet {
  id: number
  name: string
  brand: string
  slug: string
  price_inr: number | null
  image_url: string | null
}

async function getPair(slugParam: string): Promise<{ tabletA: Tablet; tabletB: Tablet } | null> {
  const parts = slugParam.split('-vs-')
  if (parts.length < 2) return null

  for (let i = 1; i < parts.length; i++) {
    const slugA = parts.slice(0, i).join('-vs-')
    const slugB = parts.slice(i).join('-vs-')
    const { data } = await supabase.from('tablets').select('*').in('slug', [slugA, slugB])
    if (data && data.length === 2) {
      const tabletA = data.find((t: any) => t.slug === slugA)
      const tabletB = data.find((t: any) => t.slug === slugB)
      if (tabletA && tabletB) return { tabletA, tabletB }
    }
  }
  return null
}

export async function generateStaticParams() {
  const { data: topTablets } = await supabase
    .from('tablets')
    .select('slug, price_inr, view_count')
    .not('price_inr', 'is', null)
    .order('view_count', { ascending: false, nullsFirst: false })
    .limit(30)

  const list = topTablets || []
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
  const { tabletA, tabletB } = pair
  const title = `${tabletA.name} vs ${tabletB.name}: Compare Specs & Price`
  const description = `Compare ${tabletA.name} and ${tabletB.name} side by side — specs, display, battery and price in India.`
  return {
    title: `${title} | AVSurge`,
    description,
    alternates: { canonical: `https://avsurge.com/compare-tablets/${slug}` },
    openGraph: { title, description, url: `https://avsurge.com/compare-tablets/${slug}` },
  }
}

async function getSpecs(tabletId: number) {
  const { data } = await supabase.from('tablet_specs').select('*').eq('tablet_id', tabletId).order('id')
  return data || []
}

export default async function CompareTabletPairPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pair = await getPair(slug)
  if (!pair) notFound()
  const { tabletA, tabletB } = pair

  const [specsA, specsB] = await Promise.all([getSpecs(tabletA.id), getSpecs(tabletB.id)])

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
    name: `${tabletA.name} vs ${tabletB.name}`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, url: `https://avsurge.com/tablets/${tabletA.slug}`, name: tabletA.name },
      { '@type': 'ListItem', position: 2, url: `https://avsurge.com/tablets/${tabletB.slug}`, name: tabletB.name },
    ],
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/tablets" className="hover:text-blue-600">Tablets</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">{tabletA.name} vs {tabletB.name}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{tabletA.name} vs {tabletB.name}</h1>
      <p className="text-sm text-gray-400 mb-8">Full specs comparison, price and display details</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {[tabletA, tabletB].map((tablet) => (
          <div key={tablet.id} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
            <div className="w-28 h-28 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
              {tablet.image_url
                ? <img src={tablet.image_url} alt={tablet.name} className="object-contain w-full h-full p-2" />
                : <span className="text-5xl">📟</span>}
            </div>
            <p className="font-semibold text-gray-900 text-sm">{tablet.name}</p>
            <p className="text-xs text-gray-400 mb-1">{tablet.brand}</p>
            {tablet.price_inr && (
              <p className="text-blue-600 text-sm font-bold">₹{tablet.price_inr.toLocaleString('en-IN')}</p>
            )}
            <Link href={`/tablets/${tablet.slug}`} className="inline-block mt-2 text-xs text-blue-500 hover:underline">
              Full specs →
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3 mb-8">
        <div>
          <p className="text-xs text-blue-400 mb-0.5">Want to compare with a different tablet?</p>
          <p className="text-sm font-semibold text-blue-800">Use our interactive comparison tool</p>
        </div>
        <Link href={`/compare-tablets?a=${tabletA.slug}`}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
          Open in compare tool →
        </Link>
      </div>

      <div className="flex flex-col gap-5">
        {allCategories.map(cat => (
          <div key={cat} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
              <span>{ICONS[cat] || '📋'}</span>
              <span className="text-sm font-semibold text-gray-700">{cat}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-gray-100">
              <div className="px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50/50 truncate">{tabletA.name}</div>
              <div className="px-4 py-2 text-xs font-medium text-gray-400 text-center">Spec</div>
              <div className="px-4 py-2 text-xs font-medium text-purple-600 bg-purple-50/50 text-right truncate">{tabletB.name}</div>
            </div>
            {getLabels(cat).map((label, i) => {
              const valA = getVal(specsA, cat, label)
              const valB = getVal(specsB, cat, label)
              const winner = isBetter(valA, valB)
              return (
                <div key={label} className={`grid grid-cols-3 items-center ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                  <div className={`px-4 py-3 text-sm font-medium ${winner === 'a' ? 'text-blue-700 bg-blue-50/60' : 'text-gray-700'}`}>
                    {valA}
                    {winner === 'a' && <span className="ml-1.5 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">✓</span>}
                  </div>
                  <div className="px-4 py-3 text-xs text-gray-400 text-center">{label}</div>
                  <div className={`px-4 py-3 text-sm font-medium text-right ${winner === 'b' ? 'text-purple-700 bg-purple-50/60' : 'text-gray-700'}`}>
                    {winner === 'b' && <span className="mr-1.5 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">✓</span>}
                    {valB}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <Link href={`/tablets/${tabletA.slug}`}
          className="bg-white border border-gray-200 rounded-xl py-3 text-center text-sm text-blue-600 hover:border-blue-300 transition">
          Full specs: {tabletA.name} →
        </Link>
        <Link href={`/tablets/${tabletB.slug}`}
          className="bg-white border border-gray-200 rounded-xl py-3 text-center text-sm text-purple-600 hover:border-purple-300 transition">
          Full specs: {tabletB.name} →
        </Link>
      </div>
    </main>
  )
}
