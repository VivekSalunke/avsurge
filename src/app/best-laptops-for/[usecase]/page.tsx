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
  'gaming': {
    title: 'Best Gaming Laptops',
    desc: 'Best gaming laptops in India with powerful GPU, high refresh rate display and fast processor.',
    specLabel: 'GPU',
    specKeywords: ['rtx', 'rx 6', 'rx 7'],
    intro: 'Gaming laptops need a dedicated GPU, fast processor, high refresh rate display and good cooling system.'
  },
  'students': {
    title: 'Best Laptops for Students',
    desc: 'Best budget-friendly laptops for students in India with good performance and battery life.',
    specLabel: 'Battery Life',
    specKeywords: ['10', '11', '12', '13', '14', '15', '16', '17', '18'],
    intro: 'Students need a reliable laptop with good battery life, lightweight design and decent performance.'
  },
  'business': {
    title: 'Best Business Laptops',
    desc: 'Best laptops for business professionals in India with security features and productivity tools.',
    specLabel: 'Processor',
    specKeywords: ['core i7', 'core i9', 'ryzen 7', 'ryzen 9', 'm3 pro', 'm3 max'],
    intro: 'Business laptops need strong performance, long battery life, security features and a professional design.'
  },
  'video-editing': {
    title: 'Best Laptops for Video Editing',
    desc: 'Best laptops for video editing in India with powerful processor, dedicated GPU and color-accurate display.',
    specLabel: 'GPU',
    specKeywords: ['rtx', 'm3', 'm2', 'rx 7'],
    intro: 'Video editing requires a powerful processor, dedicated GPU, color-accurate display and fast storage.'
  },
  'programming': {
    title: 'Best Laptops for Programming',
    desc: 'Best laptops for developers and programmers in India with fast processor and plenty of RAM.',
    specLabel: 'RAM',
    specKeywords: ['16gb', '32gb'],
    intro: 'Programming laptops need fast processors, plenty of RAM, good keyboard and long battery life.'
  },
  'lightweight': {
    title: 'Best Lightweight Laptops',
    desc: 'Best thin and light laptops in India under 1.5kg for travel and portability.',
    specLabel: 'Weight',
    specKeywords: ['1.0', '1.1', '1.2', '1.3', '1.4', '1.5'],
    intro: 'Lightweight laptops are perfect for travel and daily commute. Look for laptops under 1.5kg with good battery life.'
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
    alternates: { canonical: `https://avsurge.com/best-laptops-for/${usecase}` },
  }
}

export default async function BestLaptopsForPage({ params }: { params: Promise<{ usecase: string }> }) {
  const { usecase } = await params
  const uc = USE_CASES[usecase]
  if (!uc) notFound()

  const { data: allSpecs } = await supabase
    .from('laptop_specs')
    .select('laptop_id, value')
    .eq('label', uc.specLabel)

  const matchingIds = (allSpecs || [])
    .filter(s => uc.specKeywords.some(kw => s.value.toLowerCase().includes(kw)))
    .map(s => s.laptop_id)

  const { data: laptops } = await supabase
    .from('laptops')
    .select('*')
    .in('id', matchingIds.length > 0 ? matchingIds : [-1])
    .order('price_inr', { ascending: true })
    .limit(20)

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/laptops" className="hover:text-blue-600">Laptops</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">{uc.title}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{uc.title} in India (2025)</h1>
        <p className="text-sm text-gray-500">{uc.intro}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(USE_CASES).map(([key, val]) => (
          <Link key={key} href={`/best-laptops-for/${key}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${key === usecase ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
            {val.title.replace('Best ', '').replace(' Laptops', '')}
          </Link>
        ))}
      </div>

      {(!laptops || laptops.length === 0) ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center">
          <p className="text-gray-400 text-sm">No laptops found for this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {laptops.map((laptop: any) => (
            <Link key={laptop.id} href={`/laptops/${laptop.slug}`}
              className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-blue-300 transition group">
              <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-3 overflow-hidden">
                {laptop.image_url
                  ? <img src={laptop.image_url} alt={laptop.name} className="object-contain w-full h-full p-2" />
                  : <span className="text-4xl">💻</span>}
              </div>
              <p className="text-xs text-gray-400 mb-0.5">{laptop.brand}</p>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2 leading-tight mb-2">{laptop.name}</p>
              {laptop.price_inr && (
                <p className="text-sm font-bold text-blue-600">₹{laptop.price_inr.toLocaleString('en-IN')}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
        <h2 className="text-base font-semibold text-gray-800 mb-2">How to choose the {uc.title.toLowerCase()}?</h2>
        <p className="text-sm text-gray-500 leading-relaxed">{uc.intro} Use our <Link href="/compare-laptops" className="text-blue-600 hover:underline">comparison tool</Link> to compare any two laptops side by side, or try <Link href="/ai-recommend" className="text-blue-600 hover:underline">AI Recommender</Link> for personalized suggestions.</p>
      </div>
    </main>
  )
}
