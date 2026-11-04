import { supabase } from '@/lib/supabase'
import { escapeXml } from '@/lib/xml'

// Google News sitemap: only articles from the last 2 days belong here (Google's rule)
export const revalidate = 600

const SITE = 'https://avsurge.com'

export async function GET() {
  const since = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('news')
    .select('title, slug, created_at')
    .eq('published', true)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1000)
  if (error) console.error('[news sitemap] query failed:', error.message)

  // Google rejects a <urlset> with no <url> ("Missing XML tag"), so when nothing is
  // from the last 2 days, list the single newest article instead.
  let articles = data || []
  if (articles.length === 0) {
    const { data: latest } = await supabase
      .from('news')
      .select('title, slug, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(1)
    articles = latest || []
  }

  const urls = articles.map(a => [
    '  <url>',
    `    <loc>${SITE}/news/${a.slug}</loc>`,
    '    <news:news>',
    '      <news:publication>',
    '        <news:name>AVSurge</news:name>',
    '        <news:language>en</news:language>',
    '      </news:publication>',
    `      <news:publication_date>${new Date(a.created_at).toISOString()}</news:publication_date>`,
    `      <news:title>${escapeXml(a.title)}</news:title>`,
    '    </news:news>',
    '  </url>',
  ].join('\n'))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join('\n')}
</urlset>
`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
