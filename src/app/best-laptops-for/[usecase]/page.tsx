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
  guide: string[]
}> = {
  'gaming': {
    title: 'Best Gaming Laptops',
    desc: 'Best gaming laptops in India with powerful GPU, high refresh rate display and fast processor.',
    specLabel: 'GPU',
    specKeywords: ['rtx', 'rx 6', 'rx 7'],
    intro: 'Gaming laptops need a dedicated GPU, fast processor, high refresh rate display and good cooling system.',
    guide: [
      'A gaming laptop is defined by its GPU — that\'s where the money goes. Look for an RTX 4060 or RTX 50-series class GPU (or Radeon RX 7000 series) for modern titles at 1080p high settings, paired with a processor that won\'t bottleneck it, like a Core i5/i7, Ryzen 5/7 or Apple M-series for the Mac crowd. A 144Hz+ display matters for competitive titles; below 120Hz you\'re leaving smoothness on the table in games like CS2, Valorant and Fortnite.',
      'Cooling is what separates a laptop that games for hours from one that throttles after 30 minutes. Check our spec tables for thermal design and remember that a chassis with better cooling can outperform a nominally more powerful laptop that runs hot. 16GB RAM and an NVMe SSD are non-negotiable for modern game installs. Balance your budget between GPU, cooling and display refresh rate — in that order — and use the comparison tool to weigh two shortlisted models side by side.',
    ],
  },
  'students': {
    title: 'Best Laptops for Students',
    desc: 'Best budget-friendly laptops for students in India with good performance and battery life.',
    specLabel: 'Battery Life',
    specKeywords: ['10', '11', '12', '13', '14', '15', '16', '17', '18'],
    intro: 'Students need a reliable laptop with good battery life, lightweight design and decent performance.',
    guide: [
      'For students, the three specs that matter most are battery life, weight and RAM. Look for a laptop with at least 8 hours of real-world battery so it survives a full campus day without a charger, a weight under 1.6kg so carrying it between classes doesn\'t become a chore, and 8GB+ RAM to handle the browser, office apps, and video calls at once. An SSD is mandatory — a machine with a hard drive will feel outdated from day one.',
      'A 14-inch display with good brightness is the sweet spot for most students — small enough to stay portable, large enough for real work. If your course involves coding, video editing or design, bump RAM to 16GB and choose a better processor now, because upgrading later is difficult or impossible in most laptops. Compare battery, weight, RAM and processor across the laptops above, then pick the one that fits your course load and commute.',
    ],
  },
  'business': {
    title: 'Best Business Laptops',
    desc: 'Best laptops for business professionals in India with security features and productivity tools.',
    specLabel: 'Processor',
    specKeywords: ['core i7', 'core i9', 'ryzen 7', 'ryzen 9', 'm3 pro', 'm3 max'],
    intro: 'Business laptops need strong performance, long battery life, security features and a professional design.',
    guide: [
      'A business laptop is judged on reliability, battery life, keyboard quality and security — not on gaming performance or flashy looks. Look for upper-mid-range processors like the Core i5/i7 or Ryzen 5/7 that handle spreadsheets, presentations, video calls and multiple apps without strain, paired with at least 16GB RAM for the multitasking-heavy workday. A full-day battery (8+ hours) and a comfortable keyboard are the specs you\'ll notice every single day.',
      'Security features are worth checking: modern business laptops include biometric logins, TPM-based encryption, and better firmware protection. Build quality matters too — a metal chassis with good hinges survives years of travel. If you fly often, consider a lightweight model and USB-C charging to cut down what you carry. Use the comparison tool to weigh processor, RAM, battery, weight and port selection between your shortlisted machines.',
    ],
  },
  'video-editing': {
    title: 'Best Laptops for Video Editing',
    desc: 'Best laptops for video editing in India with powerful processor, dedicated GPU and color-accurate display.',
    specLabel: 'GPU',
    specKeywords: ['rtx', 'm3', 'm2', 'rx 7'],
    intro: 'Video editing requires a powerful processor, dedicated GPU, color-accurate display and fast storage.',
    guide: [
      'Video editing stresses every part of a laptop at once, so nothing can be weak. You need a powerful multi-core processor (Core i7/i9, Ryzen 7/9, or Apple M-series), a dedicated GPU (RTX or Radeon) to accelerate effects and exports in Premiere and DaVinci Resolve, and a minimum of 16GB RAM — 32GB if you edit 4K timelines or motion graphics. Fast storage is critical too: an NVMe SSD is required for smooth scrubbing through large files.',
      'The display is the second half of the equation. A colour-accurate panel covering 100% sRGB or DCI-P3, with high brightness, lets you grade footage confidently without an external monitor. Don\'t forget cooling and sustained performance — export times vary massively between laptops with identical specs but different thermal designs. Compare GPU, RAM, storage speed and display colour coverage across the laptops above before you invest.',
    ],
  },
  'programming': {
    title: 'Best Laptops for Programming',
    desc: 'Best laptops for developers and programmers in India with fast processor and plenty of RAM.',
    specLabel: 'RAM',
    specKeywords: ['16gb', '32gb'],
    intro: 'Programming laptops need fast processors, plenty of RAM, good keyboard and long battery life.',
    guide: [
      'For programming, RAM is usually the first bottleneck — 16GB is the practical minimum for modern development with an IDE, Docker containers, and a browser full of tabs, while 32GB future-proofs you for larger projects. Processor-wise, either a Core i5/i7 or Ryzen 5/7 handles compilation comfortably; the GPU matters little unless you do ML or game development, so don\'t pay for a gaming GPU if you don\'t need it.',
      'Two underrated specs for developers are the keyboard and the display. You type thousands of lines a week, so a keyboard with good key travel and a comfortable layout beats an extra teraflop. A sharp, high-resolution display (at least FHD, ideally 2K+ or a 16:10 panel) shows more code on screen at once. Long battery life helps for libraries and co-working spaces. Compare RAM, processor, display and battery across the laptops above to find your daily driver.',
    ],
  },
  'lightweight': {
    title: 'Best Lightweight Laptops',
    desc: 'Best thin and light laptops in India under 1.5kg for travel and portability.',
    specLabel: 'Weight',
    specKeywords: ['1.0', '1.1', '1.2', '1.3', '1.4', '1.5'],
    intro: 'Lightweight laptops are perfect for travel and daily commute. Look for laptops under 1.5kg with good battery life.',
    guide: [
      'A lightweight laptop is a trade-off — the goal is to keep the machine under ~1.5kg without sacrificing the specs you actually need. The weight savings come from smaller screens (13–14 inches), efficient chipsets and compact builds, so decide early whether you\'re happy with 13.3 or 14 inches in exchange for carrying less. Ultrabooks with Intel Evo or Ryzen-powered designs hit the sweet spot of portability, battery life and daily performance.',
      'When you compare lightweight laptops, check that the portability gain didn\'t cost you essentials: a fast NVMe SSD, 8–16GB RAM, and a bright display. Battery life becomes doubly important on a machine that\'s always on the move — aim for 10+ hours. Connectivity also matters more when you travel; USB-C and Wi-Fi 6E make a real difference. Compare weight, battery, RAM and ports across the laptops above to find the lightest model that still does the job.',
    ],
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
    title: `${uc.title} in India 2026 | AVSurge`,
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
        <h1 className="text-2xl font-bold text-white mb-2">{uc.title} in India (2026)</h1>
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

      <div className="mt-12 p-6 bg-[var(--panel)] rounded-2xl border border-[rgba(255,255,255,0.06)] space-y-4">
        <h2 className="text-base font-semibold text-white">Buying guide: how to choose {uc.title.toLowerCase()}</h2>
        {uc.guide.map((para, i) => (
          <p key={i} className="text-sm text-dim leading-relaxed">{para}</p>
        ))}
        <p className="text-sm text-dim leading-relaxed">
          Use our <Link href="/compare-laptops" className="text-neon-cyan hover:underline">comparison tool</Link> to compare any two laptops side by side, or try <Link href="/ai-recommend" className="text-neon-cyan hover:underline">AI Recommender</Link> for personalised suggestions based on your budget and needs.
        </p>
      </div>
    </main>
  )
}
