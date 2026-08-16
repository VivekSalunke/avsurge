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
  'drawing': {
    title: 'Best Tablets for Drawing',
    desc: 'Best tablets for digital art and drawing in India with stylus support and high resolution display.',
    specLabel: 'Display',
    specKeywords: ['amoled', 'lcd', 'ips'],
    intro: 'For digital drawing, look for tablets with stylus support, high resolution display and pressure sensitivity.',
    guide: [
      'For digital art, stylus support and display quality matter far more than processing power. Look for a tablet with active stylus support (pressure-sensitive, palm rejection built in) and a high-resolution screen with accurate colour — a good 2K LCD or AMOLED panel with sRGB or DCI-P3 coverage shows your artwork the way it is. Lower-end tablets with capacitive-only "styluses" are not suitable for serious drawing, so check the stylus type in the spec table.',
      'Your budget decides the realistic ceiling: under ₹30,000 you get solid 2K LCD options with basic stylus support that are great for students and hobbyists; above that, tablets add laminated displays, lower latency, and stronger processors that handle multi-layer canvases in apps like Sketchbook and Krita without lag. Compare display resolution, stylus compatibility, and RAM side by side before choosing — drawing apps get memory-hungry fast.',
    ],
  },
  'students': {
    title: 'Best Tablets for Students',
    desc: 'Best budget-friendly tablets for students in India for studying, note-taking and entertainment.',
    specLabel: 'RAM',
    specKeywords: ['4gb', '6gb', '8gb'],
    intro: 'Students need a tablet with good display, long battery life, stylus support and affordable price.',
    guide: [
      'A study tablet should cover note-taking, PDF annotations, online classes, and light entertainment — which means display quality, battery life and stylus support matter more than raw horsepower. Aim for a sharp FHD or 2K display, 4GB+ RAM for smooth multitasking between a notes app, browser and video call, and at least 8 hours of battery so it survives a full day of classes without a charger.',
      'Stylus support is the feature that separates a study tablet from a media tablet. If your classes involve handwritten notes or marking up PDFs and lecture slides, budget for a model with an active stylus. Storage is the other practical consideration — 64GB with microSD expansion is the safe minimum for recorded lectures and apps. Compare display, RAM, storage and stylus support across the tablets above to find the best fit for your study routine.',
    ],
  },
  'gaming': {
    title: 'Best Gaming Tablets',
    desc: 'Best tablets for gaming in India with powerful processor, high refresh rate and large display.',
    specLabel: 'Chipset',
    specKeywords: ['snapdragon', 'apple m', 'dimensity', 'exynos'],
    intro: 'Gaming tablets need powerful processors, high refresh rate displays and good cooling.',
    guide: [
      'A gaming tablet needs three things: a flagship-class chipset, a high refresh rate display, and enough battery with cooling to sustain long sessions. Look for chips like the Snapdragon 8-series, Dimensity 9000-series, or Apple\'s M-series/A-series — these sustain demanding titles at high settings. A 120Hz+ display is important because it makes supported games feel dramatically smoother, and large AMOLED panels give you an immersive advantage over phones.',
      'Thermals are the hidden factor. Tablets have more surface area than phones, so they throttle less, but sustained performance still varies between models. Check our spec tables for RAM (8GB+ recommended for the latest titles), battery capacity, and display specs, then use the comparison tool to weigh chipset, display and cooling between your final candidates. If you play competitively, input latency and speakers also deserve attention.',
    ],
  },
  'kids': {
    title: 'Best Tablets for Kids',
    desc: 'Best tablets for children in India with parental controls, durable build and educational apps.',
    specLabel: 'RAM',
    specKeywords: ['3gb', '4gb'],
    intro: 'Kids tablets need durable build quality, parental controls, good display and affordable price.',
    guide: [
      'A kids tablet is a family investment, so the priorities are durability, parental controls, and a good display for eyes. Look for models with reinforced builds and consider a rugged case, plus built-in parental controls that let you manage screen time, app access and content restrictions. An IPS or LCD display with comfortable brightness range is fine — kids don\'t need AMOLED, and the savings go toward a better build.',
      'In terms of specs, 3–4GB RAM and a mid-range chipset are more than enough for educational apps, YouTube Kids, drawing apps and simple games. Battery life and charging port durability matter since tablets take heavy everyday use. Set a budget, prioritise parental controls and build quality, and use the comparison tool to compare RAM, battery and display across the shortlisted models before making the call.',
    ],
  },
  'entertainment': {
    title: 'Best Tablets for Entertainment',
    desc: 'Best tablets for watching movies and streaming in India with AMOLED display and good speakers.',
    specLabel: 'Display',
    specKeywords: ['amoled', 'oled'],
    intro: 'For entertainment, look for tablets with vibrant AMOLED displays, stereo speakers and long battery life.',
    guide: [
      'For movies, shows and streaming, the display and speakers are everything. An AMOLED or OLED panel delivers true blacks, vivid colours and high contrast — the single biggest upgrade you can get for a media tablet — while a bright screen keeps content watchable in daylight. Equally important are stereo speakers; check our spec tables for speaker configuration, since single-speaker tablets sound noticeably flat for Netflix and YouTube.',
      'Pick a screen size based on where you watch. A 10–11 inch tablet is the comfortable middle ground for most people; go larger only if the tablet mostly lives on a stand at home. Don\'t overpay for gaming-grade processors on a media tablet — a mid-range chipset paired with a great display gives you the best value. Compare display type, resolution, speakers and battery across the tablets above, and confirm the codec support (Widevine L1) for HD streaming if that matters to you.',
    ],
  },
  'work': {
    title: 'Best Tablets for Work',
    desc: 'Best tablets for productivity and work in India with keyboard support and powerful processor.',
    specLabel: 'Chipset',
    specKeywords: ['apple m', 'snapdragon 8', 'dimensity 9'],
    intro: 'Work tablets need keyboard support, powerful processors, multitasking capabilities and long battery life.',
    guide: [
      'A work tablet replaces a laptop for a meaningful chunk of the workday, so it needs a capable processor, generous RAM, and real multitasking features. Look for flagship or upper-mid-range chipsets (Apple M-series, Snapdragon 8-series, Dimensity 9000-series) with 8GB+ RAM, keyboard cover support, and a desktop-style multitasking interface. Split-screen and floating-window support turn a tablet from a big phone into an actual productivity device.',
      'Battery life and portability are the two advantages a tablet holds over a laptop — 10+ hours of battery and sub-700g weight make it the device you carry everywhere. If your work involves typing, prioritise keyboard support and accessories; if it involves calls and presentations, camera quality and speaker quality matter. Compare chipset, RAM, keyboard compatibility and battery across the tablets above, then decide based on how much of your day is typing versus meetings.',
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
        <Link href="/tablets" className="hover:text-neon-cyan">Tablets</Link>
        <span>&rsaquo;</span>
        <span className="text-[rgba(255,255,255,0.65)]">{uc.title}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{uc.title} in India (2026)</h1>
        <p className="text-sm text-dim">{uc.intro}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(USE_CASES).map(([key, val]) => (
          <Link key={key} href={`/best-tablets-for/${key}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${key === usecase ? 'border-transparent bg-gradient-to-r from-neon-cyan to-neon-violet text-black shadow-sm' : 'bg-[var(--card-bg)] text-[rgba(255,255,255,0.85)] border-[rgba(255,255,255,0.06)] hover:border-neon-cyan hover:text-neon-cyan'}`}>
            {val.title.replace('Best ', '').replace(' Tablets', '')}
          </Link>
        ))}
      </div>

      {(!tablets || tablets.length === 0) ? (
        <div className="bg-[var(--card-bg)] border border-dashed border-[rgba(255,255,255,0.06)] rounded-2xl py-20 text-center">
          <p className="text-[rgba(255,255,255,0.4)] text-sm">No tablets found for this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tablets.map((tablet: any) => (
            <Link key={tablet.id} href={`/tablets/${tablet.slug}`}
              className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] p-4 hover:border-[rgba(6,182,212,0.35)] hover:glow transition-all duration-200 card-hover group">
              <div className="aspect-square bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mb-3 overflow-hidden">
                {tablet.image_url
                  ? <img src={tablet.image_url} alt={tablet.name} className="object-contain w-full h-full p-2" />
                  : <span className="text-4xl">📟</span>}
              </div>
              <p className="text-xs text-[rgba(255,255,255,0.4)] mb-0.5">{tablet.brand}</p>
              <p className="text-sm font-semibold text-white group-hover:text-neon-cyan transition line-clamp-2 leading-tight mb-2">{tablet.name}</p>
              {tablet.price_inr && (
                <p className="text-sm font-bold text-neon-cyan">{formatPriceINR(tablet.price_inr)}</p>
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
          Use our <Link href="/compare-tablets" className="text-neon-cyan hover:underline">comparison tool</Link> to compare any two tablets side by side, or try <Link href="/ai-recommend" className="text-neon-cyan hover:underline">AI Recommender</Link> for personalised suggestions based on your budget and needs.
        </p>
      </div>
    </main>
  )
}
