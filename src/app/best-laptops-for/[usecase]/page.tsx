import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { formatPriceINR } from '@/lib/format'

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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the ${uc.title.toLowerCase()} in India?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: uc.intro,
        },
      },
    ],
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 text-[var(--text)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="text-sm text-[rgba(255,255,255,0.4)] mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neon-cyan">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/laptops" className="hover:text-neon-cyan">Laptops</Link>
        <span>&rsaquo;</span>
        <span className="text-[rgba(255,255,255,0.65)]">{uc.title}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{uc.title} in India (2025)</h1>
        <p className="text-sm text-dim">{uc.intro}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(USE_CASES).map(([key, val]) => (
          <Link key={key} href={`/best-laptops-for/${key}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${key === usecase ? 'border-transparent bg-gradient-to-r from-neon-cyan to-neon-violet text-black shadow-sm' : 'bg-[var(--card-bg)] text-[rgba(255,255,255,0.85)] border-[rgba(255,255,255,0.06)] hover:border-neon-cyan hover:text-neon-cyan'}`}>
            {val.title.replace('Best ', '').replace(' Laptops', '')}
          </Link>
        ))}
      </div>

      {(!laptops || laptops.length === 0) ? (
        <div className="bg-[var(--card-bg)] border border-dashed border-[rgba(255,255,255,0.06)] rounded-2xl py-20 text-center">
          <p className="text-[rgba(255,255,255,0.4)] text-sm">No laptops found for this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {laptops.map((laptop: any) => (
            <Link key={laptop.id} href={`/laptops/${laptop.slug}`}
              className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] p-4 hover:border-[rgba(6,182,212,0.35)] hover:glow transition-all duration-200 card-hover group">
              <div className="aspect-square bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mb-3 overflow-hidden">
                {laptop.image_url
                  ? <img src={laptop.image_url} alt={laptop.name} className="object-contain w-full h-full p-2" />
                  : <span className="text-4xl">💻</span>}
              </div>
              <p className="text-xs text-[rgba(255,255,255,0.4)] mb-0.5">{laptop.brand}</p>
              <p className="text-sm font-semibold text-white group-hover:text-neon-cyan transition line-clamp-2 leading-tight mb-2">{laptop.name}</p>
              {laptop.price_inr && (
                <p className="text-sm font-bold text-neon-cyan">{formatPriceINR(laptop.price_inr)}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-[var(--panel)] rounded-2xl border border-[rgba(255,255,255,0.06)]">
        <h2 className="text-base font-semibold text-white mb-2">How to choose the {uc.title.toLowerCase()}?</h2>
        <p className="text-sm text-dim leading-relaxed">{uc.intro} Use our <Link href="/compare-laptops" className="text-neon-cyan hover:underline">comparison tool</Link> to compare any two laptops side by side, or try <Link href="/ai-recommend" className="text-neon-cyan hover:underline">AI Recommender</Link> for personalized suggestions.</p>
      </div>
    </main>
  )
}
