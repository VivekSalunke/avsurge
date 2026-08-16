import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { formatPriceINR } from '@/lib/format'
const VALID_BUDGETS = [30000, 50000, 70000, 100000, 150000, 200000]
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
    title: `Best Laptops Under ₹${b.toLocaleString('en-IN')} in India (2026)`,
    description: `Top laptops under ₹${b.toLocaleString('en-IN')} in India. Compare specs, performance and battery life to find the best laptop for your budget.`,
  }
}
export default async function UnderBudgetLaptopsPage({ params }: { params: Promise<{ budget: string }> }) {
  const { budget } = await params
  const b = parseInt(budget)
  if (!VALID_BUDGETS.includes(b)) notFound()
  const { data: laptops } = await supabase
    .from('laptops')
    .select('*')
    .lte('price_inr', b)
    .gt('price_inr', 0)
    .order('price_inr', { ascending: false })
  if (!laptops || laptops.length === 0) notFound()
  const budgetLabel = `₹${b.toLocaleString('en-IN')}`
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the best laptop under ${budgetLabel}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The best laptops under ${budgetLabel} in India include options from Apple, Dell, HP, Lenovo and ASUS. Compare processor, RAM, display and battery life to find the right one for you.`,
        },
      },
      {
        '@type': 'Question',
        name: `Which laptop is best for students under ${budgetLabel}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `For students, look for a laptop under ${budgetLabel} with at least 8GB RAM, 512GB SSD, good battery life and a lightweight design. Use our comparison tool to compare laptops side by side.`,
        },
      },
      {
        '@type': 'Question',
        name: `Should I buy a Windows or Mac laptop under ${budgetLabel}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Under ${budgetLabel}, Windows laptops generally offer more variety and better value for money. MacBooks start at higher price points but offer excellent performance and build quality.`,
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
        <span className="text-[rgba(255,255,255,0.65)]">Under {budgetLabel}</span>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Best Laptops Under {budgetLabel} in India</h1>
        <p className="text-sm text-dim">{laptops.length} laptops found — sorted by price (high to low)</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {VALID_BUDGETS.map(budget => (
          <Link key={budget} href={`/best-laptops/${budget}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${budget === b ? 'border-transparent bg-gradient-to-r from-neon-cyan to-neon-violet text-black shadow-sm' : 'bg-[var(--card-bg)] text-[rgba(255,255,255,0.85)] border-[rgba(255,255,255,0.06)] hover:border-neon-cyan hover:text-neon-cyan'}`}>
            Under {formatPriceINR(budget)}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/leaderboard" className="px-3 py-1.5 rounded-full text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]">
          🔥 Trending laptops
        </Link>
        <Link href="/brands" className="px-3 py-1.5 rounded-full text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]">
          🏷️ Browse by brand
        </Link>
        <Link href="/best-laptops-for/gaming" className="px-3 py-1.5 rounded-full text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]">
          🎮 Best for gaming
        </Link>
        <Link href="/best-laptops-for/students" className="px-3 py-1.5 rounded-full text-sm border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] hover:border-neon-cyan hover:text-neon-cyan transition bg-[var(--card-bg)]">
          🎓 Best for students
        </Link>
      </div>
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
      <div className="mt-12 p-6 bg-[var(--panel)] rounded-2xl border border-[rgba(255,255,255,0.06)] space-y-4">
        <h2 className="text-base font-semibold text-white">How to pick the best laptop under {budgetLabel}?</h2>
        <p className="text-sm text-dim leading-relaxed">
          Under {budgetLabel}, the order of priority should be storage type, RAM, processor and then everything else. An SSD is non-negotiable — a laptop with a 512GB NVMe SSD boots in seconds and feels dramatically faster than any machine with a hard drive, regardless of processor. Pair that with at least 8GB RAM, and the machine will handle everyday multitasking, browser tabs, and office apps without slowdowns for years.
        </p>
        <p className="text-sm text-dim leading-relaxed">
          Processor choice depends on your work. An Intel Core i3, Core i5 or AMD Ryzen 3/5 covers web browsing, documents, streaming and light photo editing. If you plan to do video editing, programming or content creation, step up to a Ryzen 5 or Core i5 with 16GB RAM, since these are the components that actually determine how long the laptop stays usable. Display quality — especially brightness and colour accuracy — matters more than a flashy design, and battery life of 6+ hours is the practical minimum for students and commuters.
        </p>
        <p className="text-sm text-dim leading-relaxed">
          Use the <Link href="/compare-laptops" className="text-neon-cyan hover:underline">comparison tool</Link> to compare any two laptops on this list side by side, or visit the <Link href="/search" className="text-neon-cyan hover:underline">Search &amp; Discover</Link> page to filter by RAM, storage and processor. Prices below are indicative starting prices — confirm the live price on the retailer&apos;s page, since frequent sales can bring models well under {budgetLabel}.
        </p>
      </div>
    </main>
  )
}
