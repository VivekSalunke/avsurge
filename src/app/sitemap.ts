import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'
export const revalidate = 3600
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [{ data: phones }, { data: tablets }, { data: brands }, { data: laptops }, { data: newsArticles }] = await Promise.all([
    supabase.from('phones').select('slug'),
    supabase.from('tablets').select('slug'),
    supabase.from('phones').select('brand'),
    supabase.from('laptops').select('slug'),
    supabase.from('news').select('slug, updated_at').eq('published', true),
  ])

  const seenBrands = new Map<string, string>()
  for (const b of (brands || [])) {
    const key = b.brand.toLowerCase()
    if (!seenBrands.has(key)) seenBrands.set(key, b.brand)
  }
  const uniqueBrands = [...seenBrands.values()]

  const BUDGETS = [10000, 15000, 20000, 30000, 50000, 100000]
  const TABLET_BUDGETS = [10000, 20000, 30000, 50000, 100000, 150000]
  const LAPTOP_BUDGETS = [30000, 50000, 70000, 100000, 150000, 200000]

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

  const laptopUrls = (laptops || []).map(laptop => ({
    url: `https://avsurge.com/laptops/${laptop.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const brandUrls = uniqueBrands.map(brand => ({
    url: `https://avsurge.com/brands/${encodeURIComponent(brand)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const budgetUrls = BUDGETS.map(budget => ({
    url: `https://avsurge.com/best-phones/${budget}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: 'https://avsurge.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://avsurge.com/phones', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://avsurge.com/tablets', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://avsurge.com/laptops', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://avsurge.com/compare', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://avsurge.com/compare-tablets', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://avsurge.com/compare-laptops', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://avsurge.com/finder', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://avsurge.com/brands', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://avsurge.com/ai-recommend', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: 'https://avsurge.com/news', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: 'https://avsurge.com/contact', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: 'https://avsurge.com/about', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    ...['gaming', 'video-editing', 'students', 'business', 'programming', 'lightweight'].map(uc => ({
      url: `https://avsurge.com/best-laptops-for/${uc}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...['drawing', 'students', 'gaming', 'kids', 'entertainment', 'work'].map(uc => ({
      url: `https://avsurge.com/best-tablets-for/${uc}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...['gaming', 'camera', 'battery', 'students', '5g', 'business'].map(uc => ({
      url: `https://avsurge.com/best-phones-for/${uc}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...budgetUrls,
    ...TABLET_BUDGETS.map(budget => ({
      url: `https://avsurge.com/best-tablets/${budget}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...LAPTOP_BUDGETS.map(budget => ({
      url: `https://avsurge.com/best-laptops/${budget}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...phoneUrls,
    ...tabletUrls,
    ...laptopUrls,
    ...(newsArticles || []).map(a => ({
      url: `https://avsurge.com/news/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...brandUrls,
  ]
}
