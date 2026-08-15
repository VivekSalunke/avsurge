import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { formatPriceINR } from '@/lib/format'

const VALID_BUDGETS = [10000, 15000, 20000, 30000, 50000, 100000]

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
    title: `Best Phones Under ₹${b.toLocaleString('en-IN')} in India (2025)`,
    description: `Top smartphones under ₹${b.toLocaleString('en-IN')} in India. Compare specs, cameras, and battery life to find the best phone for your budget.`,
  }
}

export default async function UnderBudgetPage({ params }: { params: Promise<{ budget: string }> }) {
  const { budget } = await params
  const b = parseInt(budget)

  if (!VALID_BUDGETS.includes(b)) notFound()

  const { data: phones } = await supabase
    .from('phones')
    .select('*')
    .lte('price_inr', b)
    .gt('price_inr', 0)
    .order('price_inr', { ascending: false })

  if (!phones || phones.length === 0) notFound()

  const budgetLabel = `₹${b.toLocaleString('en-IN')}`
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the best phone under ${budgetLabel}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The best phones under ${budgetLabel} in India include options from Samsung, Xiaomi, Realme, OnePlus and Apple. Compare specs, camera quality and battery life to find the right one for you.`,
        },
      },
      {
        '@type': 'Question',
        name: `Which phone has the best camera under ${budgetLabel}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `For the best camera under ${budgetLabel}, look for phones with high megapixel counts, optical image stabilization and large aperture lenses. Use our comparison tool to compare cameras side by side.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is ${budgetLabel} enough to buy a good phone in India?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, ${budgetLabel} is enough to get a good smartphone in India with decent performance, camera and battery life. Browse our list above to find the best options in this price range.`,
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
        <span className="text-[rgba(255,255,255,0.65)]">Under {budgetLabel}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Best Phones Under {budgetLabel} in India
        </h1>
        <p className="text-sm text-dim">
          {phones.length} phones found — sorted by price (high to low)
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {VALID_BUDGETS.map(budget => (
          <Link
            key={budget}
            href={`/best-phones/${budget}`}
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
          🔥 Trending phones
        </Link>
        <Link href="/brands" className="px-3 py-1.5 rounded-full text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]">
          🏷️ Browse by brand
        </Link>
        <Link href="/best-phones-for/gaming" className="px-3 py-1.5 rounded-full text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]">
          🎮 Best for gaming
        </Link>
        <Link href="/best-phones-for/camera" className="px-3 py-1.5 rounded-full text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]">
          📷 Best for camera
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {phones.map((phone: any) => (
          <Link
            key={phone.id}
            href={`/phones/${phone.slug}`}
            className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] p-4 hover:border-[rgba(6,182,212,0.35)] hover:glow transition-all duration-200 card-hover group"
          >
            <div className="aspect-square bg-[rgba(255,255,255,0.02)] rounded-xl flex items-center justify-center mb-3 overflow-hidden">
              {phone.image_url
                ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full p-2" />
                : <span className="text-4xl">📱</span>}
            </div>
            <p className="text-xs text-[rgba(255,255,255,0.4)] mb-0.5">{phone.brand}</p>
            <p className="text-sm font-semibold text-white group-hover:text-neon-cyan transition line-clamp-2 leading-tight mb-2">
              {phone.name}
            </p>
            {phone.price_inr && (
              <p className="text-sm font-bold text-neon-cyan">
                {formatPriceINR(phone.price_inr)}
              </p>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-[var(--panel)] rounded-2xl border border-[rgba(255,255,255,0.06)]">
        <h2 className="text-base font-semibold text-white mb-2">
          How to pick the best phone under {budgetLabel}?
        </h2>
        <p className="text-sm text-dim leading-relaxed">
          When buying a phone under {budgetLabel}, focus on the processor (chipset), RAM, battery capacity, and camera quality.
          Use the <Link href="/compare" className="text-neon-cyan hover:underline">comparison tool</Link> to compare any two phones side by side,
          or try the <Link href="/search" className="text-neon-cyan hover:underline">Search & Discover</Link> to filter by your priorities.
        </p>
      </div>
    </main>
  )
}
