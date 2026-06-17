import { supabase } from '@/lib/supabase'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: phones } = await supabase.from('phones').select('slug')

  const phoneUrls = (phones || []).map(phone => ({
    url: `https://avsurge.com/phones/${phone.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: 'https://avsurge.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://avsurge.com/phones', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://avsurge.com/compare', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://avsurge.com/finder', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://avsurge.com/news', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    ...phoneUrls,
  ]
}
