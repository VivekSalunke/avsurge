import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [{ data: phones }, { data: tablets }, { data: brands }] = await Promise.all([
    supabase.from('phones').select('slug'),
    supabase.from('tablets').select('slug'),
    supabase.from('phones').select('brand'),
  ])

  const uniqueBrands = [...new Set((brands || []).map(b => b.brand))]

  const phoneUrls = (phones || []).map(phone => ({
    url: `https://avsurge.com/phones/${phone.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const tabletUrls = (tablets || []).map(tablet => ({
    url: `https://avsurge.com/tablets/${tablet.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const brandUrls = uniqueBrands.map(brand => ({
    url: `https://avsurge.com/brands/${encodeURIComponent(brand)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    { url: 'https://avsurge.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://avsurge.com/phones', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://avsurge.com/tablets', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://avsurge.com/compare', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://avsurge.com/compare-tablets', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://avsurge.com/finder', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://avsurge.com/brands', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://avsurge.com/ai-recommend', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: 'https://avsurge.com/news', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    ...phoneUrls,
    ...tabletUrls,
    ...brandUrls,
  ]
}
