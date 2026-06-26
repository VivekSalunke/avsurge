import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

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

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/tablets" className="hover:text-blue-600">Tablets</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">Under {budgetLabel}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Best Tablets Under {budgetLabel} in India
        </h1>
        <p className="text-sm text-gray-500">
          {tablets.length} tablets found — sorted by price (high to low)
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {VALID_BUDGETS.map(budget => (
          <Link
            key={budget}
            href={`/best-tablets/${budget}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              budget === b
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}
          >
            Under ₹{budget.toLocaleString('en-IN')}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tablets.map((tablet: any) => (
          <Link
            key={tablet.id}
            href={`/tablets/${tablet.slug}`}
            className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-blue-300 transition group"
          >
            <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-3 overflow-hidden">
              {tablet.image_url
                ? <img src={tablet.image_url} alt={tablet.name} className="object-contain w-full h-full p-2" />
                : <span className="text-4xl">📟</span>}
            </div>
            <p className="text-xs text-gray-400 mb-0.5">{tablet.brand}</p>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2 leading-tight mb-2">
              {tablet.name}
            </p>
            {tablet.price_inr && (
              <p className="text-sm font-bold text-blue-600">
                ₹{tablet.price_inr.toLocaleString('en-IN')}
              </p>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
        <h2 className="text-base font-semibold text-gray-800 mb-2">
          How to pick the best tablet under {budgetLabel}?
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          When buying a tablet under {budgetLabel}, focus on display size, chipset, RAM, and battery life.
          Use the <Link href="/compare-tablets" className="text-blue-600 hover:underline">comparison tool</Link> to compare any two tablets side by side,
          or try the <Link href="/finder" className="text-blue-600 hover:underline">device finder</Link> to filter by your priorities.
        </p>
      </div>
    </main>
  )
}
