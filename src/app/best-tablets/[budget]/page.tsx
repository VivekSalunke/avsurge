import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { formatPriceINR } from '@/lib/format'

const VALID_BUDGETS = [10000, 20000, 30000, 50000, 100000, 150000]

export const dynamicParams = true
export const revalidate = 3600

export async function generateStaticParams() {
  return VALID_BUDGETS.map(b => ({ budget: b.toString() }))
}

export async function generateMetadata({ params }: { params: Promise<{ budget: string }> }): Promise<Metadata> {
  const { budget } = await params
  const b = parseInt(budget)
  if (!VALID_BUDGETS.includes(b)) return {}
  return {
    title: `Best Tablets Under ₹${b.toLocaleString('en-IN')} in India (2025)`,
    description: `Top tablets under ₹${b.toLocaleString('en-IN')} in India. Compare specs, display, battery and performance to find the best tablet for your budget.`,
  }
}

export default async function UnderBudgetTabletsPage({ params }: { params: Promise<{ budget: string }> }) {
  const { budget } = await params
  const b = parseInt(budget)

  if (!VALID_BUDGETS.includes(b)) notFound()

  const { data: tablets } = await supabase
    .from('tablets')
    .select('*')
    .lte('price_inr', b)
    .gt('price_inr', 0)
    .order('price_inr', { ascending: false })

  if (!tablets || tablets.length === 0) notFound()

  const budgetLabel = `₹${b.toLocaleString('en-IN')}`
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the best tablet under ${budgetLabel}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The best tablets under ${budgetLabel} in India include options from Samsung, Xiaomi, Lenovo, Realme and Apple. Compare specs, display and battery life to find the right one for you.`,
        },
      },
      {
        '@type': 'Question',
        name: `Which tablet has the best display under ${budgetLabel}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `For the best display under ${budgetLabel}, look for tablets with high resolution screens, good brightness and accurate colors. Use our comparison tool to compare displays side by side.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is ${budgetLabel} enough to buy a good tablet in India?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, ${budgetLabel} is enough to get a good tablet in India with decent performance, display and battery life. Browse our list above to find the best options in this price range.`,
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
        <span className="text-[rgba(255,255,255,0.65)]">Under {budgetLabel}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Best Tablets Under {budgetLabel} in India
        </h1>
        <p className="text-sm text-dim">
          {tablets.length} tablets found — sorted by price (high to low)
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {VALID_BUDGETS.map(budget => (
          <Link
            key={budget}
            href={`/best-tablets/${budget}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              budget === b
                ? 'border-transparent bg-gradient-to-r from-neon-cyan to-neon-violet text-black shadow-sm'
                : 'bg-[var(--card-bg)] text-[rgba(255,255,255,0.85)] border-[rgba(255,255,255,0.06)] hover:border-neon-cyan hover:text-neon-cyan'
            }`}
          >
            Under {formatPriceINR(budget)}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/leaderboard" className="px-3 py-1.5 rounded-full text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]">
          🔥 Trending tablets
        </Link>
        <Link href="/brands" className="px-3 py-1.5 rounded-full text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]">
          🏷️ Browse by brand
        </Link>
        <Link href="/best-tablets-for/drawing" className="px-3 py-1.5 rounded-full text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]">
          ✏️ Best for drawing
        </Link>
        <Link href="/best-tablets-for/students" className="px-3 py-1.5 rounded-full text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]">
          🎓 Best for students
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tablets.map((tablet: any) => (
          <Link
            key={tablet.id}
            href={`/tablets/${tablet.slug}`}
            className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] p-4 hover:border-[rgba(6,182,212,0.35)] hover:glow transition-all duration-200 card-hover group"
          >
            <div className="aspect-square bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mb-3 overflow-hidden">
              {tablet.image_url
                ? <img src={tablet.image_url} alt={tablet.name} className="object-contain w-full h-full p-2" />
                : <span className="text-4xl">📟</span>}
            </div>
            <p className="text-xs text-[rgba(255,255,255,0.4)] mb-0.5">{tablet.brand}</p>
            <p className="text-sm font-semibold text-white group-hover:text-neon-cyan transition line-clamp-2 leading-tight mb-2">
              {tablet.name}
            </p>
            {tablet.price_inr && (
              <p className="text-sm font-bold text-neon-cyan">
                {formatPriceINR(tablet.price_inr)}
              </p>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-[var(--panel)] rounded-2xl border border-[rgba(255,255,255,0.06)] space-y-4">
        <h2 className="text-base font-semibold text-white">
          How to pick the best tablet under {budgetLabel}?
        </h2>
        <p className="text-sm text-dim leading-relaxed">
          Tablets under {budgetLabel} are mostly used for entertainment, online classes, reading and light productivity, so the display matters more than raw performance. Prioritise a sharp panel with a minimum of FHD (1920×1080) resolution and good brightness — a dim or low-resolution screen is the quickest way to regret a tablet purchase. For students, stylus support is worth paying extra for, since it enables note-taking and PDF annotations that a phone simply can&apos;t do.
        </p>
        <p className="text-sm text-dim leading-relaxed">
          For performance, aim for at least 4GB of RAM and a mid-range chipset from MediaTek or Qualcomm. Battery life at this price typically ranges between 8–12 hours, which is plenty for a day of classes and streaming. Storage matters too — 64GB is the comfortable minimum, and check whether the model supports microSD expansion so you can add space later for movies and apps.
        </p>
        <p className="text-sm text-dim leading-relaxed">
          Use our <Link href="/compare-tablets" className="text-neon-cyan hover:underline">comparison tool</Link> to put any two tablets on this list side by side, or try the <Link href="/search" className="text-neon-cyan hover:underline">Search &amp; Discover</Link> page to filter by screen size, RAM and battery. Prices below are indicative — confirm the live price on the retailer&apos;s page, as sale prices frequently drop below {budgetLabel}.
        </p>
      </div>
    </main>
  )
}
