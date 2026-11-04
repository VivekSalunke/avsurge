import { supabase } from '@/lib/supabase'
import { escapeXml } from '@/lib/xml'

// Rebuild the feed at most every 10 minutes
export const revalidate = 600

const SITE = 'https://avsurge.com'

interface FeedArticle {
  title: string
  slug: string
  excerpt: string | null
  image_url: string | null
  category: string | null
  created_at: string
}

export async function GET() {
  const { data, error } = await supabase
    .from('news')
    .select('title, slug, excerpt, image_url, category, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) console.error('[news rss] query failed:', error.message)
  const articles = (data || []) as FeedArticle[]

  const items = articles.map(a => {
    const url = `${SITE}/news/${a.slug}`
    return [
      '    <item>',
      `      <title>${escapeXml(a.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${new Date(a.created_at).toUTCString()}</pubDate>`,
      a.excerpt ? `      <description>${escapeXml(a.excerpt)}</description>` : '',
      a.category ? `      <category>${escapeXml(a.category)}</category>` : '',
      a.image_url ? `      <enclosure url="${escapeXml(a.image_url)}" type="image/jpeg" length="0" />` : '',
      '    </item>',
    ].filter(Boolean).join('\n')
  })

  const lastBuild = articles[0] ? new Date(articles[0].created_at).toUTCString() : new Date().toUTCString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AVSurge News</title>
    <link>${SITE}/news</link>
    <description>Phone, tablet and laptop news for India from AVSurge</description>
    <language>en-in</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE}/news/rss.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>
`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
