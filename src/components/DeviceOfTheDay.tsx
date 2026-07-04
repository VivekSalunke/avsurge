import { supabase } from '@/lib/supabase'
import Link from 'next/link'

async function getDeviceOfTheDay(table: string, specsTable: string, idKey: string, specLabels: string[], offset = 0) {
  const { data: devices } = await supabase
    .from(table)
    .select('*')
    .not('price_inr', 'is', null)
    .order('created_at', { ascending: false })
    .limit(30)

  if (!devices || devices.length === 0) return null

  const today = new Date().toISOString().slice(0, 10)
  const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0)
  const device = devices[(seed + offset) % devices.length]

  const { data: specs } = await supabase
    .from(specsTable)
    .select('*')
    .eq(idKey, device.id)
    .in('label', specLabels)

  const specMap: Record<string, string> = {}
  for (const s of specs || []) specMap[s.label] = s.value

  return { device, specMap }
}

export default async function DeviceOfTheDay() {
  const [phoneData, tabletData, laptopData] = await Promise.all([
    getDeviceOfTheDay('phones', 'phone_specs', 'phone_id', ['Chipset', 'RAM', 'Main camera', 'Capacity'], 0),
    getDeviceOfTheDay('tablets', 'tablet_specs', 'tablet_id', ['Chipset', 'RAM', 'Display', 'Battery'], 5),
    getDeviceOfTheDay('laptops', 'laptop_specs', 'laptop_id', ['Processor', 'RAM', 'Storage', 'Battery Life'], 10),
  ])

  const cards = [
    { data: phoneData, type: 'phones', emoji: '📱', label: 'Phone', color: 'from-blue-600 to-blue-700', light: 'bg-blue-500/20' },
    { data: tabletData, type: 'tablets', emoji: '📟', label: 'Tablet', color: 'from-teal-600 to-teal-700', light: 'bg-teal-500/20' },
    { data: laptopData, type: 'laptops', emoji: '💻', label: 'Laptop', color: 'from-indigo-600 to-indigo-700', light: 'bg-indigo-500/20' },
  ].filter(c => c.data !== null)

  if (cards.length === 0) return null

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900">⭐ Featured today</h2>
        <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ data, type, emoji, label, color, light }) => {
          if (!data) return null
          const { device, specMap } = data
          const specs = Object.entries(specMap).slice(0, 3)
          return (
            <div key={type} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white flex flex-col`}>
              <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-4">{emoji} {label} of the day</p>
              <div className="flex gap-4 flex-1">
                {/* Image on left */}
                <div className={`w-28 h-28 ${light} rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                  {device.image_url
                    ? <img src={device.image_url} alt={device.name} className="object-contain w-full h-full p-2" />
                    : <span className="text-5xl">{emoji}</span>}
                </div>
                {/* Info on right */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <p className="text-white/60 text-xs mb-0.5">{device.brand}</p>
                  <p className="font-bold text-sm leading-tight mb-1">{device.name}</p>
                  {device.price_inr && (
                    <p className="text-white font-bold text-base mb-2">₹{device.price_inr.toLocaleString('en-IN')}</p>
                  )}
                  {specs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {specs.map(([label, value]) => (
                        <span key={label} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          {value}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link href={`/${type}/${device.slug}`}
                    className="mt-auto inline-block bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-xl transition text-center">
                    View specs →
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
