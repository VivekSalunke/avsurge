import { supabase } from '@/lib/supabase'
import Link from 'next/link'

async function getPhoneOfTheDay() {
  const { data: phones } = await supabase
    .from('phones')
    .select('*')
    .not('image_url', 'is', null)

  if (!phones || phones.length === 0) return null

  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  const index = dayOfYear % phones.length

  const phone = phones[index]

  const { data: specs } = await supabase
    .from('phone_specs')
    .select('*')
    .eq('phone_id', phone.id)
    .in('label', ['Chipset', 'Main camera', 'Capacity', 'Screen size', 'Charging speed', 'RAM'])

  return { phone, specs: specs || [] }
}

export default async function PhoneOfTheDay() {
  const data = await getPhoneOfTheDay()
  if (!data) return null

  const { phone, specs } = data

  const getSpec = (label: string) => specs.find(s => s.label === label)?.value || null

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-xl font-bold text-gray-900">Phone of the Day</h2>
        <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full font-medium">
          ⭐ {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      <div className="block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-md transition group">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Image */}
          <Link href={`/phones/${phone.slug}`} className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8 min-h-48">
            {phone.image_url
              ? <img src={phone.image_url} alt={phone.name} className="object-contain h-48 w-full" />
              : <span className="text-8xl">📱</span>}
          </Link>

          {/* Info */}
          <div className="md:col-span-2 p-6 flex flex-col justify-center">
            <p className="text-xs text-gray-400 mb-1">{phone.brand}</p>
            <Link href={`/phones/${phone.slug}`}>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                {phone.name}
              </h3>
            </Link>
            {phone.price_inr && (
              <p className="text-xl font-bold text-blue-600 mb-4">
                ₹{phone.price_inr.toLocaleString('en-IN')}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Chipset', icon: '⚡' },
                { label: 'Main camera', icon: '📷' },
                { label: 'Capacity', icon: '🔋' },
                { label: 'Screen size', icon: '🖥️' },
                { label: 'Charging speed', icon: '🔌' },
                { label: 'RAM', icon: '🚀' },
              ].map(({ label, icon }) => {
                const val = getSpec(label)
                if (!val) return null
                return (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{icon} {label}</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{val}</p>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              <Link href={`/phones/${phone.slug}`}
                className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition">
                View full specs →
              </Link>
              <a href={`https://www.amazon.in/s?k=${encodeURIComponent(phone.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-xl hover:border-blue-300 transition">
                Buy on Amazon
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
