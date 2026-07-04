import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function LaptopOfTheDay() {
  const { data: laptops } = await supabase
    .from('laptops')
    .select('*')
    .not('price_inr', 'is', null)
    .order('created_at', { ascending: false })
    .limit(30)

  if (!laptops || laptops.length === 0) return null

  const today = new Date().toISOString().slice(0, 10)
  const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0)
  const laptop = laptops[(seed + 7) % laptops.length]

  const { data: specs } = await supabase
    .from('laptop_specs')
    .select('*')
    .eq('laptop_id', laptop.id)
    .in('label', ['Processor', 'RAM', 'Storage', 'Display', 'Battery Life'])

  const specMap: Record<string, string> = {}
  for (const s of specs || []) specMap[s.label] = s.value

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white mb-6">
      <p className="text-indigo-200 text-xs uppercase tracking-widest font-medium mb-4">💻 Laptop of the day</p>
      <div className="flex gap-5 items-center">
        <div className="w-24 h-24 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {laptop.image_url
            ? <img src={laptop.image_url} alt={laptop.name} className="object-contain w-full h-full p-2" />
            : <span className="text-5xl">💻</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-indigo-200 text-xs mb-0.5">{laptop.brand}</p>
          <h3 className="text-lg font-bold mb-1 leading-tight">{laptop.name}</h3>
          {laptop.price_inr && (
            <p className="text-indigo-100 text-sm font-semibold mb-3">₹{laptop.price_inr.toLocaleString('en-IN')}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(specMap).slice(0, 3).map(([label, value]) => (
              <span key={label} className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                {value}
              </span>
            ))}
          </div>
          <Link href={`/laptops/${laptop.slug}`}
            className="inline-block bg-white text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition">
            View specs →
          </Link>
        </div>
      </div>
    </div>
  )
}
