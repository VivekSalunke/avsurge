import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
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
    title: `Best Laptops Under ₹${b.toLocaleString('en-IN')} in India (2025)`,
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
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/laptops" className="hover:text-blue-600">Laptops</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">Under {budgetLabel}</span>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Best Laptops Under {budgetLabel} in India</h1>
        <p className="text-sm text-gray-500">{laptops.length} laptops found — sorted by price (high to low)</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {VALID_BUDGETS.map(budget => (
          <Link key={budget} href={`/best-laptops/${budget}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${budget === b ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
            Under ₹{budget.toLocaleString('en-IN')}
          </Link>
        ))}
      </div>
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
      <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
        <h2 className="text-base font-semibold text-gray-800 mb-2">How to pick the best laptop under {budgetLabel}?</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          When buying a laptop under {budgetLabel}, focus on the processor, RAM, storage type (SSD vs HDD), display quality, and battery life.
          Use the <Link href="/compare-laptops" className="text-blue-600 hover:underline">comparison tool</Link> to compare any two laptops side by side.
        </p>
      </div>
    </main>
  )
}
