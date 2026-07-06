import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

const USE_CASES: Record<string, {
  title: string
  desc: string
  specLabel: string
  specKeywords: string[]
  intro: string
}> = {
  'drawing': {
    title: 'Best Tablets for Drawing',
    desc: 'Best tablets for digital art and drawing in India with stylus support and high resolution display.',
    specLabel: 'Display',
    specKeywords: ['amoled', 'lcd', 'ips'],
    intro: 'For digital drawing, look for tablets with stylus support, high resolution display and pressure sensitivity.'
  },
  'students': {
    title: 'Best Tablets for Students',
    desc: 'Best budget-friendly tablets for students in India for studying, note-taking and entertainment.',
    specLabel: 'RAM',
    specKeywords: ['4gb', '6gb', '8gb'],
    intro: 'Students need a tablet with good display, long battery life, stylus support and affordable price.'
  },
  'gaming': {
    title: 'Best Gaming Tablets',
    desc: 'Best tablets for gaming in India with powerful processor, high refresh rate and large display.',
    specLabel: 'Chipset',
    specKeywords: ['snapdragon', 'apple m', 'dimensity', 'exynos'],
    intro: 'Gaming tablets need powerful processors, high refresh rate displays and good cooling.'
  },
  'kids': {
    title: 'Best Tablets for Kids',
    desc: 'Best tablets for children in India with parental controls, durable build and educational apps.',
    specLabel: 'RAM',
    specKeywords: ['3gb', '4gb'],
    intro: 'Kids tablets need durable build quality, parental controls, good display and affordable price.'
  },
  'entertainment': {
    title: 'Best Tablets for Entertainment',
    desc: 'Best tablets for watching movies and streaming in India with AMOLED display and good speakers.',
    specLabel: 'Display',
    specKeywords: ['amoled', 'oled'],
    intro: 'For entertainment, look for tablets with vibrant AMOLED displays, stereo speakers and long battery life.'
  },
  'work': {
    title: 'Best Tablets for Work',
    desc: 'Best tablets for productivity and work in India with keyboard support and powerful processor.',
    specLabel: 'Chipset',
    specKeywords: ['apple m', 'snapdragon 8', 'dimensity 9'],
    intro: 'Work tablets need keyboard support, powerful processors, multitasking capabilities and long battery life.'
  },
}

export async function generateStaticParams() {
  return Object.keys(USE_CASES).map(usecase => ({ usecase }))
}

export const dynamicParams = false
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ usecase: string }> }): Promise<Metadata> {
  const { usecase } = await params
  const uc = USE_CASES[usecase]
  if (!uc) return {}
  return {
    title: `${uc.title} in India 2025 | AVSurge`,
    description: uc.desc,
    alternates: { canonical: `https://avsurge.com/best-tablets-for/${usecase}` },
  }
}

export default async function BestTabletsForPage({ params }: { params: Promise<{ usecase: string }> }) {
  const { usecase } = await params
  const uc = USE_CASES[usecase]
  if (!uc) notFound()

  const { data: allSpecs } = await supabase
    .from('tablet_specs')
    .select('tablet_id, value')
    .eq('label', uc.specLabel)

  const matchingIds = (allSpecs || [])
    .filter(s => uc.specKeywords.some(kw => s.value.toLowerCase().includes(kw)))
    .map(s => s.tablet_id)

  const { data: tablets } = await supabase
    .from('tablets')
    .select('*')
    .in('id', matchingIds.length > 0 ? matchingIds : [-1])
    .order('price_inr', { ascending: true })
    .limit(20)

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/tablets" className="hover:text-blue-600">Tablets</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">{uc.title}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{uc.title} in India (2025)</h1>
        <p className="text-sm text-gray-500">{uc.intro}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(USE_CASES).map(([key, val]) => (
          <Link key={key} href={`/best-tablets-for/${key}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${key === usecase ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
            {val.title.replace('Best ', '').replace(' Tablets', '')}
          </Link>
        ))}
      </div>

      {(!tablets || tablets.length === 0) ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center">
          <p className="text-gray-400 text-sm">No tablets found for this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tablets.map((tablet: any) => (
            <Link key={tablet.id} href={`/tablets/${tablet.slug}`}
              className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-blue-300 transition group">
              <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-3 overflow-hidden">
                {tablet.image_url
                  ? <img src={tablet.image_url} alt={tablet.name} className="object-contain w-full h-full p-2" />
                  : <span className="text-4xl">📟</span>}
              </div>
              <p className="text-xs text-gray-400 mb-0.5">{tablet.brand}</p>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2 leading-tight mb-2">{tablet.name}</p>
              {tablet.price_inr && (
                <p className="text-sm font-bold text-blue-600">₹{tablet.price_inr.toLocaleString('en-IN')}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
        <h2 className="text-base font-semibold text-gray-800 mb-2">How to choose the {uc.title.toLowerCase()}?</h2>
        <p className="text-sm text-gray-500 leading-relaxed">{uc.intro} Use our <Link href="/compare-tablets" className="text-blue-600 hover:underline">comparison tool</Link> to compare any two tablets side by side, or try <Link href="/ai-recommend" className="text-blue-600 hover:underline">AI Recommender</Link> for personalized suggestions.</p>
      </div>
    </main>
  )
}
