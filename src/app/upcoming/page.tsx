import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { safeJsonLd } from '@/lib/jsonLd'
import UpcomingList from '@/components/UpcomingList'
import { addDays, monthLabel, RECENT_DAYS, todayIST, type UpcomingLaunch } from '@/lib/upcoming'

// 5 min: admin edits show up quickly; the query is tiny
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const month = monthLabel(todayIST())
  return {
    title: `Upcoming Phones, Tablets & Laptops in India — ${month} | AVSurge`,
    description: `Brand-confirmed upcoming smartphone, tablet and laptop launches in India for ${month}, with launch dates and official sources.`,
    alternates: { canonical: 'https://avsurge.com/upcoming' },
    openGraph: {
      title: `Upcoming launches in India — ${month}`,
      description: 'Brand-confirmed launch dates for phones, tablets and laptops in India.',
      url: 'https://avsurge.com/upcoming',
    },
  }
}

async function getLaunches() {
  const today = todayIST()
  const { data, error } = await supabase
    .from('upcoming_launches')
    .select('*')
    .gte('launch_date', addDays(today, -RECENT_DAYS))
    .order('launch_date', { ascending: true })
  if (error) console.error('[upcoming] query failed:', error.message)
  const all = (data || []) as UpcomingLaunch[]
  return {
    upcoming: all.filter(i => i.launch_date >= today),
    recent: all.filter(i => i.launch_date < today).reverse(),
  }
}

export default async function UpcomingPage() {
  const { upcoming, recent } = await getLaunches()
  const month = monthLabel(todayIST())

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Upcoming launches in India — ${month}`,
    itemListElement: upcoming.slice(0, 50).map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${item.name} — launching ${item.launch_date}`,
      ...(item.device_slug ? { url: `https://avsurge.com/${item.category}s/${item.device_slug}` } : {}),
    })),
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 text-[var(--text)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Upcoming launches in India</h1>
      <p className="text-sm text-[rgba(255,255,255,0.55)] mb-6">
        Phones, tablets and laptops with launch dates confirmed by the brand. Each entry links to the official
        announcement. Updated {month}.
      </p>
      <UpcomingList upcoming={upcoming} recent={recent} />
    </main>
  )
}
