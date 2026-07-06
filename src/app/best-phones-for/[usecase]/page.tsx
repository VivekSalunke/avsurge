import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

const USE_CASES: Record<string, {
  title: string
  desc: string
  specLabel: string
  specKeywords: string[]
  intro: string
}> = {
  'gaming': {
    title: 'Best Gaming Phones',
    desc: 'Best gaming phones in India with high refresh rate display, powerful processor and large battery.',
    specLabel: 'Chipset',
    specKeywords: ['snapdragon 8', 'dimensity 9', 'apple a1'],
    intro: 'For gaming, you need a phone with a powerful processor, high refresh rate display and good cooling system.'
  },
  'camera': {
    title: 'Best Camera Phones',
    desc: 'Best camera phones in India with high megapixel sensors, optical zoom and night mode.',
    specLabel: 'Main camera',
    specKeywords: ['200mp', '108mp', '64mp', '50mp'],
    intro: 'For photography, look for phones with high megapixel sensors, optical image stabilization and versatile zoom capabilities.'
  },
  'battery': {
    title: 'Best Battery Life Phones',
    desc: 'Best phones with longest battery life in India. Find phones with 5000mAh+ battery.',
    specLabel: 'Capacity',
    specKeywords: ['6000', '5500', '5000'],
    intro: 'For long battery life, look for phones with 5000mAh or larger batteries and efficient processors.'
  },
  'students': {
    title: 'Best Phones for Students',
    desc: 'Best budget-friendly smartphones for students in India with good performance and battery life.',
    specLabel: 'RAM',
    specKeywords: ['8gb', '6gb'],
    intro: 'Students need a reliable phone with good performance, long battery life and a reasonable price.'
  },
  '5g': {
    title: 'Best 5G Phones',
    desc: 'Best 5G smartphones available in India. Future-proof your purchase with 5G connectivity.',
    specLabel: '5G',
    specKeywords: ['yes'],
    intro: '5G phones offer faster internet speeds and are future-proof. Here are the best 5G phones available in India.'
  },
  'business': {
    title: 'Best Business Phones',
    desc: 'Best smartphones for business use in India with security features and productivity tools.',
    specLabel: 'Chipset',
    specKeywords: ['snapdragon 8', 'apple a1', 'dimensity 9'],
    intro: 'Business phones need strong security, reliable performance and good productivity features.'
  },
}

export async function generateStaticParams() {
  return Object.keys(USE_CASES).map(usecase => ({ usecase }))
}

export const dynamicParams = false
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ usecase: string }> }): Promise<Metadata> {
  const { usecase } = await params
  const uc = USE_CASES[usecase]
  if (!uc) return {}
  return {
    title: `${uc.title} in India 2025 | AVSurge`,
    description: uc.desc,
    alternates: { canonical: `https://avsurge.com/best-phones-for/${usecase}` },
  }
}

export default async function BestPhonesForPage({ params }: { params: Promise<{ usecase: string }> }) {
  const { usecase } = await params
  const uc = USE_CASES[usecase]
  if (!uc) notFound()

  const { data: allSpecs } = await supabase
    .from('phone_specs')
    .select('phone_id, value')
    .eq('label', uc.specLabel)

  const matchingIds = (allSpecs || [])
    .filter(s => uc.specKeywords.some(kw => s.value.toLowerCase().includes(kw)))
    .map(s => s.phone_id)

  const { data: phones } = await supabase
    .from('phones')
    .select('*')
    .in('id', matchingIds.length > 0 ? matchingIds : [-1])
    .order('price_inr', { ascending: true })
    .limit(20)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the ${uc.title.toLowerCase()} in India?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: uc.intro,
        },
      },
    ],
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/phones" className="hover:text-blue-600">Phones</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">{uc.title}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{uc.title} in India (2025)</h1>
        <p className="text-sm text-gray-500">{uc.intro}</p>
      </div>

      {/* Use case quick links */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(USE_CASES).map(([key, val]) => (
          <Link key={key} href={`/best-phones-for/${key}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${key === usecase ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
            {val.title.replace('Best ', '').replace(' Phones', '')}
          </Link>
        ))}
      </div>

      {(!phones || phones.length === 0) ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center">
          <p className="text-gray-400 text-sm">No phones found for this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {phones.map((phone: any) => (
            <Link key={phone.id} href={`/phones/${phone.slug}`}
              className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-blue-300 transition group">
              <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-3 overflow-hidden">
                {phone.image_url
                  ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full p-2" />
                  : <span className="text-4xl">📱</span>}
              </div>
              <p className="text-xs text-gray-400 mb-0.5">{phone.brand}</p>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2 leading-tight mb-2">{phone.name}</p>
              {phone.price_inr && (
                <p className="text-sm font-bold text-blue-600">₹{phone.price_inr.toLocaleString('en-IN')}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
        <h2 className="text-base font-semibold text-gray-800 mb-2">How to choose the {uc.title.toLowerCase()}?</h2>
        <p className="text-sm text-gray-500 leading-relaxed">{uc.intro} Use our <Link href="/compare" className="text-blue-600 hover:underline">comparison tool</Link> to compare any two phones side by side, or try <Link href="/ai-recommend" className="text-blue-600 hover:underline">AI Recommender</Link> for personalized suggestions.</p>
      </div>
    </main>
  )
}
