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
    title: 'Best Gaming Phones',
    desc: 'Best gaming phones in India with high refresh rate display, powerful processor and large battery.',
    specLabel: 'Chipset',
    specKeywords: ['snapdragon 8', 'dimensity 9', 'apple a1'],
    intro: 'For gaming, you need a phone with a powerful processor, high refresh rate display and good cooling system.',
    guide: [
      'A good gaming phone lives or dies by its chipset and its display refresh rate. Look for flagship-tier chips like the Snapdragon 8 series, Dimensity 9000 series or Apple\'s A-series silicon, paired with a 120Hz or higher AMOLED display — smoothness in fast-paced games depends far more on refresh rate than on megapixel counts. Equally important is thermal management: a phone that throttles after 20 minutes of BGMI or COD Mobile will feel slower than a mid-range device with a better cooling design.',
      'Battery capacity matters too, because heavy gaming drains power quickly. A 5000mAh battery with 67W or faster charging lets you game for hours and top back up in under an hour. If you play competitively, also check that the phone\'s touch sampling rate is high — a 240Hz+ touch response translates directly to faster reaction times. The phones listed above are ranked by their combined spec score; use the comparison tool below to check thermals, speakers and battery between any two candidates.',
    ],
  },
  'camera': {
    title: 'Best Camera Phones',
    desc: 'Best camera phones in India with high megapixel sensors, optical zoom and night mode.',
    specLabel: 'Main camera',
    specKeywords: ['200mp', '108mp', '64mp', '50mp'],
    intro: 'For photography, look for phones with high megapixel sensors, optical image stabilization and versatile zoom capabilities.',
    guide: [
      'Megapixels are the least useful camera spec to compare — what actually separates a good phone camera from a great one is the sensor size, aperture, optical image stabilisation (OIS), and how the image signal processor handles low light and high contrast scenes. A 50MP main sensor with a large 1/1.5-inch sensor and OIS will consistently beat a 108MP or 200MP sensor without stabilisation in night shots and moving subjects.',
      'Think about your shooting style before buying. If you shoot street or travel photos, a phone with a good ultrawide and 2–3x optical zoom gives you far more flexibility than a high-megapixel main camera alone. If you mainly post to social media, front-camera quality and video stabilisation matter more than raw resolution. Use the comparison tool to line up main camera, ultrawide, telephoto and video specs side by side, then pick the phone that matches how you actually shoot.',
    ],
  },
  'battery': {
    title: 'Best Battery Life Phones',
    desc: 'Best phones with longest battery life in India. Find phones with 5000mAh+ battery.',
    specLabel: 'Capacity',
    specKeywords: ['6000', '5500', '5000'],
    intro: 'For long battery life, look for phones with 5000mAh or larger batteries and efficient processors.',
    guide: [
      'Battery life is a combination of battery size and efficiency, not just mAh on paper. A 5000mAh cell inside an efficient mid-range chipset can easily outlast a 5500mAh battery paired with a power-hungry flagship processor. Look for phones with 5000mAh or higher batteries built around efficient silicon — Dimensity 7-series, Snapdragon 7-series or 8-series with power-focused tuning — and pay attention to charging speed so the phone isn\'t tied to a charger for an hour every evening.',
      'For heavy users, prioritise both endurance and fast top-ups: 5000mAh with 33–67W charging is the sweet spot in most price segments. If battery is your single biggest concern, prefer phones with 6000mAh+ batteries, and check our spec tables for the official video-playback and talk-time estimates rather than relying on marketing claims. Compare battery capacity, charging speed and chipset efficiency side by side before making your pick.',
    ],
  },
  'students': {
    title: 'Best Phones for Students',
    desc: 'Best budget-friendly smartphones for students in India with good performance and battery life.',
    specLabel: 'RAM',
    specKeywords: ['8gb', '6gb'],
    intro: 'Students need a reliable phone with good performance, long battery life and a reasonable price.',
    guide: [
      'A student phone needs to last a full day of classes, handle online lectures and heavy multitasking between study apps, messaging and streaming, and survive 2–3 years of daily use. Prioritise at least 6GB of RAM, a 5000mAh battery, and 128GB of storage — 64GB fills up quickly with class recordings and apps. A 90Hz or 120Hz display is a nice-to-have, but RAM and battery are the specs that decide how long the phone stays usable.',
      'Software updates matter more for students than any hardware spec. A phone from a brand known for regular security and OS updates keeps receiving new features and stays safe longer, making it better value over a 3-year ownership period. If classes involve PDFs, notes and group projects, expandable storage and a bright display for outdoor reading are practical advantages. Compare the phones above on RAM, battery and storage using our comparison tool before deciding.',
    ],
  },
  '5g': {
    title: 'Best 5G Phones',
    desc: 'Best 5G smartphones available in India. Future-proof your purchase with 5G connectivity.',
    specLabel: '5G',
    specKeywords: ['yes'],
    intro: '5G phones offer faster internet speeds and are future-proof. Here are the best 5G phones available in India.',
    guide: [
      '5G coverage in India is expanding quickly, and a 5G phone future-proofs your purchase for the next 2–3 years. When comparing 5G phones, check which 5G bands are supported — phones that cover both n77 and n78 bands (the main bands used in India) are better equipped for reliable speeds across networks and future rollouts. A phone listed with 5G in our spec tables has been verified against the spec sheet, so you can filter confidently.',
      'Keep in mind that 5G alone doesn\'t make a phone better — pair it with a capable chipset, at least 6GB RAM and a decent battery so the network speed actually translates into a faster experience. If you plan to upgrade only once in the next 3 years, a 5G phone under ₹20,000–₹30,000 gives you the best balance of future-proofing and value. Use the comparison tool to compare 5G bands, chipset and battery across your shortlisted phones.',
    ],
  },
  'business': {
    title: 'Best Business Phones',
    desc: 'Best smartphones for business use in India with security features and productivity tools.',
    specLabel: 'Chipset',
    specKeywords: ['snapdragon 8', 'apple a1', 'dimensity 9'],
    intro: 'Business phones need strong security, reliable performance and good productivity features.',
    guide: [
      'A business phone needs dependable performance across calls, emails, video conferences and document work, plus security features you can trust. Prioritise a chipset with a reputation for stability — Snapdragon 8-series, Dimensity 9000-series or Apple\'s silicon — along with 8GB or more RAM for smooth multitasking between office apps. Battery and charging speed matter because a phone that dies mid-call or mid-presentation is a liability in a work day.',
      'Security-wise, look for phones with long software support commitments (the longer, the better for business use), biometric authentication, and good enterprise features like dual SIM with separate work profiles and secure folder capabilities. If you travel, dual SIM support and broad 5G band coverage are practical advantages. Compare the phones above on performance, battery, and software support using our comparison tool to find the right fit for your workflow.',
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
    title: `${uc.title} in India 2025 | AVSurge`,
    description: uc.desc,
    alternates: { canonical: `https://avsurge.com/best-phones-for/${usecase}` },
  }
}

export default async function BestPhonesForPage({ params }: { params: Promise<{ usecase: string }> }) {
  const { usecase } = await params
  const uc = USE_CASES[usecase]
  if (!uc) notFound()

  const { data: allSpecs } = await supabase
    .from('phone_specs')
    .select('phone_id, value')
    .eq('label', uc.specLabel)

  const matchingIds = (allSpecs || [])
    .filter(s => uc.specKeywords.some(kw => s.value.toLowerCase().includes(kw)))
    .map(s => s.phone_id)

  const { data: phones } = await supabase
    .from('phones')
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
        <Link href="/phones" className="hover:text-neon-cyan">Phones</Link>
        <span>&rsaquo;</span>
        <span className="text-[rgba(255,255,255,0.65)]">{uc.title}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{uc.title} in India (2025)</h1>
        <p className="text-sm text-dim">{uc.intro}</p>
      </div>

      {/* Use case quick links */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(USE_CASES).map(([key, val]) => (
          <Link key={key} href={`/best-phones-for/${key}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${key === usecase ? 'border-transparent bg-gradient-to-r from-neon-cyan to-neon-violet text-black shadow-sm' : 'bg-[var(--card-bg)] text-[rgba(255,255,255,0.85)] border-[rgba(255,255,255,0.06)] hover:border-neon-cyan hover:text-neon-cyan'}`}>
            {val.title.replace('Best ', '').replace(' Phones', '')}
          </Link>
        ))}
      </div>

      {(!phones || phones.length === 0) ? (
        <div className="bg-[var(--card-bg)] border border-dashed border-[rgba(255,255,255,0.06)] rounded-2xl py-20 text-center">
          <p className="text-[rgba(255,255,255,0.4)] text-sm">No phones found for this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {phones.map((phone: any) => (
            <Link key={phone.id} href={`/phones/${phone.slug}`}
              className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] p-4 hover:border-[rgba(6,182,212,0.35)] hover:glow transition-all duration-200 card-hover group">
              <div className="aspect-square bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mb-3 overflow-hidden">
                {phone.image_url
                  ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full p-2" />
                  : <span className="text-4xl">📱</span>}
              </div>
              <p className="text-xs text-[rgba(255,255,255,0.4)] mb-0.5">{phone.brand}</p>
              <p className="text-sm font-semibold text-white group-hover:text-neon-cyan transition line-clamp-2 leading-tight mb-2">{phone.name}</p>
              {phone.price_inr && (
                <p className="text-sm font-bold text-neon-cyan">{formatPriceINR(phone.price_inr)}</p>
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
          Use our <Link href="/compare" className="text-neon-cyan hover:underline">comparison tool</Link> to compare any two phones side by side, or try <Link href="/ai-recommend" className="text-neon-cyan hover:underline">AI Recommender</Link> for personalised suggestions based on your budget and needs.
        </p>
      </div>
    </main>
  )
}
