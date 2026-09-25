import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase.from('news').select('*').eq('slug', slug).single()
  if (!data) return { title: 'Article not found' }
  return {
    title: `${data.title} | AVSurge`,
    description: data.excerpt || data.title,
    alternates: { canonical: `https://avsurge.com/news/${slug}` },
    openGraph: {
      title: data.title,
      description: data.excerpt || '',
      images: data.image_url ? [{ url: data.image_url }] : [],
    },
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  'Phones': 'neon-badge',
  'Tablets': 'badge-green',
  'Laptops': 'badge-blue',
  'Reviews': 'badge-red',
  'Tips': 'badge-green',
  'Industry News': 'badge-blue',
  'General': 'neon-badge',
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: article } = await supabase.from('news').select('*').eq('slug', slug).eq('published', true).single()
  if (!article) notFound()

  const { data: related } = await supabase.from('news')
    .select('id, title, slug, excerpt, image_url, category, created_at')
    .eq('published', true)
    .eq('category', article.category)
    .neq('id', article.id)
    .limit(3)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.image_url ? [article.image_url] : undefined,
    datePublished: article.created_at,
    dateModified: article.updated_at || article.created_at,
    author: {
      '@type': 'Organization',
      name: 'AVSurge',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AVSurge',
      logo: {
        '@type': 'ImageObject',
        url: 'https://avsurge.com/icon-512.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://avsurge.com/news/${slug}`,
    },
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 text-[var(--text)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="text-sm text-[rgba(255,255,255,0.4)] mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neon-cyan">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/news" className="hover:text-neon-cyan">News</Link>
        <span>&rsaquo;</span>
        <span className="text-[rgba(255,255,255,0.65)] truncate">{article.title}</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[article.category] || CATEGORY_COLORS['General']}`}>
          {article.category}
        </span>
        <span className="text-xs text-[rgba(255,255,255,0.4)]">
          {new Date(article.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{article.title}</h1>

      {article.excerpt && (
        <p className="text-lg text-dim mb-6 leading-relaxed">{article.excerpt}</p>
      )}

      {article.image_url && (
        <div className="relative w-full h-64 sm:h-96 overflow-hidden rounded-2xl mb-8 bg-[rgba(255,255,255,0.02)]">
          <Image src={article.image_url} alt={article.title} fill preload sizes="(max-width: 768px) 100vw, 736px" className="object-cover" />
        </div>
      )}

      {article.content && (
        <div className="prose prose-gray max-w-none">
          {article.content.split('\n').map((para: string, i: number) => {
            if (!para.trim()) return null
            // Image syntax: ![alt](url)
            const imgMatch = para.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
            if (imgMatch) {
              return (
                <div key={i} className="my-6">
                  <Image src={imgMatch[2]} alt={imgMatch[1]} width={1200} height={675} sizes="(max-width: 768px) 100vw, 736px" className="w-full h-auto rounded-2xl object-cover" />
                  {imgMatch[1] && <p className="text-xs text-[rgba(255,255,255,0.4)] text-center mt-2">{imgMatch[1]}</p>}
                </div>
              )
            }
            // Heading syntax: ## Heading
            if (para.startsWith('## ')) {
              return <h2 key={i} className="text-xl font-bold text-white mt-8 mb-3">{para.slice(3)}</h2>
            }
            if (para.startsWith('# ')) {
              return <h1 key={i} className="text-2xl font-bold text-white mt-8 mb-3">{para.slice(2)}</h1>
            }
            // Bold: **text**  |  Link: [text](url)
            const tokenRegex = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
            const nodes: React.ReactNode[] = []
            let lastIndex = 0
            let match: RegExpExecArray | null
            let key = 0
            while ((match = tokenRegex.exec(para)) !== null) {
              if (match.index > lastIndex) {
                nodes.push(para.slice(lastIndex, match.index))
              }
              if (match[1] !== undefined) {
                // bold match
                nodes.push(<strong key={key++}>{match[1]}</strong>)
              } else {
                // link match: match[2] = text, match[3] = url
                nodes.push(
                  <a key={key++} href={match[3]} target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline">
                    {match[2]}
                  </a>
                )
              }
              lastIndex = tokenRegex.lastIndex
            }
            if (lastIndex < para.length) {
              nodes.push(para.slice(lastIndex))
            }
            return (
              <p key={i} className="text-[rgba(255,255,255,0.85)] leading-relaxed mb-4">
                {nodes}
              </p>
            )
          })}
        </div>
      )}

      {related && related.length > 0 && (
        <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.04)]">
          <h2 className="text-base font-bold text-white mb-4">Related articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map(r => (
              <Link key={r.id} href={`/news/${r.slug}`}
                className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 hover:border-neon-cyan transition group">
                {r.image_url && (
                  <div className="relative w-full h-24 overflow-hidden rounded-lg mb-3">
                    <Image src={r.image_url} alt={r.title} fill sizes="(max-width: 640px) 100vw, 30vw" className="object-cover" />
                  </div>
                )}
                <p className="text-sm font-semibold text-white group-hover:text-neon-cyan transition line-clamp-2">{r.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/news" className="text-sm text-neon-cyan hover:underline">← Back to all news</Link>
      </div>
    </main>
  )
}
