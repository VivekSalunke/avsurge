import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function TabletOfTheDay() {
  const { data: tablets } = await supabase
    .from('tablets')
    .select('*')
    .not('price_inr', 'is', null)
    .order('created_at', { ascending: false })
    .limit(30)

  if (!tablets || tablets.length === 0) return null

  const today = new Date().toISOString().slice(0, 10)
  const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0)
  const tablet = tablets[seed % tablets.length]

  const { data: specs } = await supabase
    .from('tablet_specs')
    .select('*')
    .eq('tablet_id', tablet.id)
    .in('label', ['Display', 'RAM', 'Storage', 'Chipset', 'Battery'])

  const specMap: Record<string, string> = {}
  for (const s of specs || []) specMap[s.label] = s.value

  return (
    <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white mb-6">
      <p className="text-teal-200 text-xs uppercase tracking-widest font-medium mb-4">📟 Tablet of the day</p>
      <div className="flex gap-5 items-center">
        <div className="w-24 h-24 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {tablet.image_url
            ? <img src={tablet.image_url} alt={tablet.name} className="object-contain w-full h-full p-2" />
            : <span className="text-5xl">📟</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-teal-200 text-xs mb-0.5">{tablet.brand}</p>
          <h3 className="text-lg font-bold mb-1 leading-tight">{tablet.name}</h3>
          {tablet.price_inr && (
            <p className="text-teal-100 text-sm font-semibold mb-3">₹{tablet.price_inr.toLocaleString('en-IN')}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(specMap).slice(0, 3).map(([label, value]) => (
              <span key={label} className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                {value}
              </span>
            ))}
          </div>
          <Link href={`/tablets/${tablet.slug}`}
            className="inline-block bg-white text-teal-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-teal-50 transition">
            View specs →
          </Link>
        </div>
      </div>
    </div>
  )
}
