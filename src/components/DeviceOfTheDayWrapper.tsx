import { supabase } from '@/lib/supabase'
import DeviceOfTheDay from './DeviceOfTheDay'

async function getDevice(table: string, specsTable: string, idKey: string, specLabels: string[], offset: number) {
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

export default async function DeviceOfTheDayWrapper() {
  const [phoneData, tabletData, laptopData] = await Promise.all([
    getDevice('phones', 'phone_specs', 'phone_id', ['Chipset', 'RAM', 'Main camera', 'Capacity'], 0),
    getDevice('tablets', 'tablet_specs', 'tablet_id', ['Chipset', 'RAM', 'Display', 'Battery'], 5),
    getDevice('laptops', 'laptop_specs', 'laptop_id', ['Processor', 'RAM', 'Storage', 'Battery Life'], 10),
  ])

  const cards = [
    phoneData && { type: 'phones', emoji: '📱', label: 'Phone', color: 'from-blue-600 to-blue-700', light: 'bg-blue-500/20', ...phoneData },
    tabletData && { type: 'tablets', emoji: '📟', label: 'Tablet', color: 'from-teal-600 to-teal-700', light: 'bg-teal-500/20', ...tabletData },
    laptopData && { type: 'laptops', emoji: '💻', label: 'Laptop', color: 'from-indigo-600 to-indigo-700', light: 'bg-indigo-500/20', ...laptopData },
  ].filter(Boolean) as any[]

  return <DeviceOfTheDay cards={cards} />
}
