import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import PhoneFilters from '@/components/PhoneFilters'
import DeviceCard from '@/components/DeviceCard'
import { getFinalSpecScore, type SpecRow } from '@/lib/specScore'

export const revalidate = 60

export const metadata = {
  title: 'Phones Price List in India 2026 | AVSurge',
  description:
    'Browse all smartphones available in India. Compare phone specs, prices, scores and reviews. Find the best phone for your budget.',
  alternates: { canonical: 'https://avsurge.com/phones' },
}

interface Phone {
  id: string | number
  slug: string
  name: string
  brand: string
  price_inr?: number | null
  image_url?: string | null
  spec_score_override?: number | null
}

interface PhoneSpec extends SpecRow {
  id: string | number
  phone_id: string | number
}

/**
 * Fetch phone specs in batches.
 *
 * Supabase can limit the number of rows returned from a single query.
 * Since the phone list can contain hundreds of devices, we split the
 * phone IDs into smaller batches so every phone gets its complete specs.
 */
async function getPhoneSpecs(
  phoneIds: Array<string | number>
): Promise<PhoneSpec[]> {
  const BATCH_SIZE = 25
  const allSpecs: PhoneSpec[] = []

  for (let i = 0; i < phoneIds.length; i += BATCH_SIZE) {
    const batchIds = phoneIds.slice(i, i + BATCH_SIZE)

    const { data, error } = await supabase
      .from('phone_specs')
      .select('id, phone_id, category, label, value')
      .in('phone_id', batchIds)
      .order('id')

    if (error) {
      console.error(
        `Failed to load phone specs batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      )
      continue
    }

    if (data) {
      allSpecs.push(...(data as PhoneSpec[]))
    }
  }

  return allSpecs
}

export default async function PhonesPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>
}) {
  const params = await searchParams
  const brand = params?.brand

  // ------------------------------------------------------------
  // Load phones
  // ------------------------------------------------------------

  let query = supabase
    .from('phones')
    .select('*')
    .order('created_at', { ascending: false })

  if (brand) {
    query = query.ilike('brand', brand)
  }

  const { data: phonesData, error: phonesError } = await query

  const phones = (phonesData || []) as Phone[]

  // ------------------------------------------------------------
  // Load brands
  // ------------------------------------------------------------

  const { data: brandsRaw } = await supabase
    .from('phones')
    .select('brand')

  const brands = [
    ...new Set(
      (brandsRaw || [])
        .map((b: { brand: string | null }) => b.brand)
        .filter(Boolean)
    ),
  ].sort() as string[]

  // ------------------------------------------------------------
  // Load complete specs in batches
  // ------------------------------------------------------------

  const phoneIds = phones.map(phone => phone.id)

  const specs = await getPhoneSpecs(phoneIds)

  console.log(
    `Loaded ${phones.length} phones and ${specs.length} phone specs`
  )

  // ------------------------------------------------------------
  // Group specs by phone
  // ------------------------------------------------------------

  const specsByPhone = new Map<string, SpecRow[]>()

  for (const spec of specs) {
    const phoneKey = String(spec.phone_id)

    const existing = specsByPhone.get(phoneKey) || []

    existing.push({
      category: spec.category,
      label: spec.label,
      value: spec.value,
    })

    specsByPhone.set(phoneKey, existing)
  }

  // ------------------------------------------------------------
  // Calculate AVSurge Score for every phone
  // ------------------------------------------------------------

  const phonesWithScores = phones.map(phone => {
    const phoneSpecs = specsByPhone.get(String(phone.id)) || []

    const score = getFinalSpecScore(
      phoneSpecs,
      phone.spec_score_override
    )

    // Extract filterable values from phone_specs.
    const getSpec = (label: string): string | null => {
      const spec = phoneSpecs.find(
        item => item.label.toLowerCase() === label.toLowerCase()
      )
      return spec?.value ?? null
    }

    const extractNumber = (value: string | null): number | null => {
      if (!value) return null

      const normalized = value.toLowerCase().replace(/,/g, '')

      // Convert TB to GB so storage filters use a consistent unit.
      const tbMatch = normalized.match(/(\d+(?:\.\d+)?)\s*tb/)
      if (tbMatch) {
        return Number(tbMatch[1]) * 1024
      }

      const gbMatch = normalized.match(/(\d+(?:\.\d+)?)\s*gb/)
      if (gbMatch) {
        return Number(gbMatch[1])
      }

      const match = normalized.match(/\d+(?:\.\d+)?/)
      return match ? Number(match[0]) : null
    }

    const ramValue = getSpec('RAM')
    const storageValue =
      getSpec('Internal storage') ??
      getSpec('Storage') ??
      getSpec('ROM')

    const networkValue =
      getSpec('Network') ??
      getSpec('Network technology') ??
      getSpec('Technology')

    const ramGB = extractNumber(ramValue)
    const storageGB = extractNumber(storageValue)

    const networkText = [
      networkValue,
      ...phoneSpecs
        .filter(spec =>
          /network|connectivity|sim/i.test(spec.label)
        )
        .map(spec => spec.value),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const supports5G = /5g/.test(networkText)
    const supports4G = /4g|lte/.test(networkText)

    return {
      ...phone,
      price_inr: phone.price_inr ?? null,
      image_url: phone.image_url ?? null,
      score,
      specCount: phoneSpecs.length,
      ramGB,
      storageGB,
      supports5G,
      supports4G,
      created_at:
        (phone as Phone & { created_at?: string | null }).created_at ?? null,
      view_count:
        (phone as Phone & { view_count?: number | null }).view_count ?? 0,
    }
  })

  // ------------------------------------------------------------
  // ItemList structured data
  // ------------------------------------------------------------

  const itemListSchema =
    phones.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: brand ? `${brand} Phones` : 'All Phones',
          description:
            'Browse smartphones available in India with specs, prices and reviews.',
          itemListElement: phones.slice(0, 50).map((phone, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: `https://avsurge.com/phones/${phone.slug}`,
            name: phone.name,
          })),
        }
      : null

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Schema */}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itemListSchema),
          }}
        />
      )}

      {/* Page header */}
      <section className="mb-10 space-y-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Smartphone Catalog
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
              {brand ? `${brand} Phones` : 'All Phones'}
            </h1>

            <p className="max-w-2xl text-base leading-7 text-gray-600">
              Browse and compare {phones.length} smartphones available in India. Find specs, prices, and make the best choice for your budget.
            </p>
          </div>

          <div className="flex shrink-0 gap-3">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-3.5 shadow-sm">
              <div className="text-2xl font-bold leading-none text-gray-900">
                {phones.length}
              </div>
              <div className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Phones
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Quick actions */}
      <section className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">

        <Link
          href="/leaderboard"
          className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-xl group-hover:scale-110 transition-transform">
            🔥
          </div>

          <div className="text-sm font-bold text-gray-900 group-hover:text-orange-600">
            Trending Phones
          </div>

          <div className="mt-1 text-xs text-gray-500">
            Check what's popular now
          </div>
        </Link>

        <Link
          href="/brands"
          className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl group-hover:scale-110 transition-transform">
            🏷️
          </div>

          <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600">
            Browse Brands
          </div>

          <div className="mt-1 text-xs text-gray-500">
            Explore by manufacturer
          </div>
        </Link>

        <Link
          href="/compare"
          className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-xl group-hover:scale-110 transition-transform">
            ⚖️
          </div>

          <div className="text-sm font-bold text-gray-900 group-hover:text-violet-600">
            Compare Phones
          </div>

          <div className="mt-1 text-xs text-gray-500">
            Compare side by side
          </div>
        </Link>

      </section>

      {/* Browse by use case */}
      <section className="mb-10 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Find phones for your needs
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Popular categories
            </p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">

          {[
            { label: '🎮 Gaming', href: '/best-phones-for/gaming' },
            { label: '📷 Camera', href: '/best-phones-for/camera' },
            { label: '🔋 Battery', href: '/best-phones-for/battery' },
            { label: '🎓 Students', href: '/best-phones-for/students' },
            { label: '📡 5G', href: '/best-phones-for/5g' },
            { label: '💼 Business', href: '/best-phones-for/business' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}

        </div>
      </section>

      {/* Brand selector */}
      <section className="mb-10">

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Browse by brand
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {brands.length} brands available
            </p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">

          <Link
            href="/phones"
            className={`shrink-0 rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
              !brand
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            All
          </Link>

          {brands.map(b => (
            <Link
              key={b}
              href={`/phones?brand=${encodeURIComponent(b)}`}
              className={`shrink-0 rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                brand === b
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {b}
            </Link>
          ))}

        </div>
      </section>

      {/* Catalog header */}
      <section className="mb-6 space-y-2">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {brand ? `${brand} smartphones` : 'Latest smartphones'}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Compare specs, prices and reviews
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            {phonesWithScores.length} results
          </span>

        </div>
      </section>

      {/* Phone filters + results */}
      <PhoneFilters
        devices={phonesWithScores}
      />

    </main>
  )
}
