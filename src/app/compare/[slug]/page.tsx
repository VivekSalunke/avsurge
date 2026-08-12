import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { formatPriceINR } from '@/lib/format'

export const dynamicParams = true
export const revalidate = 3600

const ICONS: Record<string, string> = {
  Display: '🖥️', Performance: '⚡', Camera: '📷',
  Battery: '🔋', Connectivity: '📡', Build: '🏗️',
  Storage: '💾', General: '📋',
}

interface Phone {
  id: number
  name: string
  brand: string
  slug: string
  price_inr: number | null
  image_url: string | null
}

async function getPair(slugParam: string): Promise<{ phoneA: Phone; phoneB: Phone } | null> {
  const parts = slugParam.split('-vs-')
  if (parts.length < 2) return null

  for (let i = 1; i < parts.length; i++) {
    const slugA = parts.slice(0, i).join('-vs-')
    const slugB = parts.slice(i).join('-vs-')
    const { data } = await supabase.from('phones').select('*').in('slug', [slugA, slugB])
    if (data && data.length === 2) {
      const phoneA = data.find((p: any) => p.slug === slugA)
      const phoneB = data.find((p: any) => p.slug === slugB)
      if (phoneA && phoneB) return { phoneA, phoneB }
    }
  }
  return null
}

export async function generateStaticParams() {
  const { data: topPhones } = await supabase
    .from('phones')
    .select('slug, price_inr, view_count')
    .not('price_inr', 'is', null)
    .order('view_count', { ascending: false, nullsFirst: false })
    .limit(30)

  const list = topPhones || []
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
  const { phoneA, phoneB } = pair
  const title = `${phoneA.name} vs ${phoneB.name}: Compare Specs & Price`
  const description = `Compare ${phoneA.name} and ${phoneB.name} side by side — specs, camera, battery, performance and price in India.`
  return {
    title: `${title} | AVSurge`,
    description,
    alternates: { canonical: `https://avsurge.com/compare/${slug}` },
    openGraph: { title, description, url: `https://avsurge.com/compare/${slug}` },
  }
}

async function getSpecs(phoneId: number) {
  const { data } = await supabase.from('phone_specs').select('*').eq('phone_id', phoneId).order('id')
  return data || []
}

export default async function ComparePairPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pair = await getPair(slug)
  if (!pair) notFound()
  const { phoneA, phoneB } = pair

  const [specsA, specsB] = await Promise.all([getSpecs(phoneA.id), getSpecs(phoneB.id)])

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
    name: `${phoneA.name} vs ${phoneB.name}`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, url: `https://avsurge.com/phones/${phoneA.slug}`, name: phoneA.name },
      { '@type': 'ListItem', position: 2, url: `https://avsurge.com/phones/${phoneB.slug}`, name: phoneB.name },
    ],
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/phones" className="hover:text-blue-600">Phones</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">{phoneA.name} vs {phoneB.name}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{phoneA.name} vs {phoneB.name}</h1>
      <p className="text-sm text-gray-400 mb-8">Full specs comparison, price and camera details</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {[phoneA, phoneB].map((phone) => (
          <div key={phone.id} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
            <div className="w-28 h-28 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
              {phone.image_url
                ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full p-2" />
                : <span className="text-5xl">📱</span>}
            </div>
            <p className="font-semibold text-gray-900 text-sm">{phone.name}</p>
            <p className="text-xs text-gray-400 mb-1">{phone.brand}</p>
            {phone.price_inr && (
              <p className="text-blue-600 text-sm font-bold">{formatPriceINR(phone.price_inr)}</p>
            )}
            <Link href={`/phones/${phone.slug}`} className="inline-block mt-2 text-xs text-blue-500 hover:underline">
              Full specs →
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3 mb-8">
        <div>
          <p className="text-xs text-blue-400 mb-0.5">Want to compare with a different phone?</p>
          <p className="text-sm font-semibold text-blue-800">Use our interactive comparison tool</p>
        </div>
        <Link href={`/compare?a=${phoneA.slug}`}
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
              <div className="px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50/50 truncate">{phoneA.name}</div>
              <div className="px-4 py-2 text-xs font-medium text-gray-400 text-center">Spec</div>
              <div className="px-4 py-2 text-xs font-medium text-purple-600 bg-purple-50/50 text-right truncate">{phoneB.name}</div>
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
        <Link href={`/phones/${phoneA.slug}`}
          className="bg-white border border-gray-200 rounded-xl py-3 text-center text-sm text-blue-600 hover:border-blue-300 transition">
          Full specs: {phoneA.name} →
        </Link>
        <Link href={`/phones/${phoneB.slug}`}
          className="bg-white border border-gray-200 rounded-xl py-3 text-center text-sm text-purple-600 hover:border-purple-300 transition">
          Full specs: {phoneB.name} →
        </Link>
      </div>
    </main>
  )
}
