import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Tech News & Reviews | AVSurge',
  description: 'Latest smartphone, tablet and laptop news, reviews and updates from India.',
  alternates: { canonical: 'https://avsurge.com/news' },
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

export default async function NewsPage() {
  const { data: articles } = await supabase
    .from('news')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 text-[var(--text)]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Tech News & Reviews</h1>
        <p className="text-sm text-[rgba(255,255,255,0.4)]">Latest updates from the world of phones, tablets and laptops</p>
      </div>

      {(!articles || articles.length === 0) ? (
        <div className="bg-[var(--card-bg)] border border-dashed border-[rgba(255,255,255,0.06)] rounded-2xl py-24 text-center">
          <p className="text-4xl mb-3">📰</p>
          <p className="text-[rgba(255,255,255,0.4)] text-sm">No articles published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link key={article.id} href={`/news/${article.slug}`}
              className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden card-hover hover:border-neon-cyan hover:glow transition group">
              {article.image_url && (
                <div className="w-full h-48 overflow-hidden bg-[rgba(255,255,255,0.02)]">
                  <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[article.category] || CATEGORY_COLORS['General']}`}>
                    {article.category}
                  </span>
                  <span className="text-xs text-[rgba(255,255,255,0.4)]">
                    {new Date(article.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="font-bold text-white group-hover:text-neon-cyan transition mb-2 line-clamp-2">{article.title}</h2>
                {article.excerpt && <p className="text-sm text-dim line-clamp-2">{article.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
