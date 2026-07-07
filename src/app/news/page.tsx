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
  'Phones': 'bg-blue-100 text-blue-700',
  'Tablets': 'bg-teal-100 text-teal-700',
  'Laptops': 'bg-indigo-100 text-indigo-700',
  'Reviews': 'bg-yellow-100 text-yellow-700',
  'Tips': 'bg-green-100 text-green-700',
  'Industry News': 'bg-purple-100 text-purple-700',
  'General': 'bg-gray-100 text-gray-700',
}

export default async function NewsPage() {
  const { data: articles } = await supabase
    .from('news')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tech News & Reviews</h1>
        <p className="text-sm text-gray-400">Latest updates from the world of phones, tablets and laptops</p>
      </div>

      {(!articles || articles.length === 0) ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-24 text-center">
          <p className="text-4xl mb-3">📰</p>
          <p className="text-gray-400 text-sm">No articles published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link key={article.id} href={`/news/${article.slug}`}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-sm transition group">
              {article.image_url && (
                <div className="w-full h-48 overflow-hidden bg-gray-100">
                  <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[article.category] || CATEGORY_COLORS['General']}`}>
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(article.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="font-bold text-gray-900 group-hover:text-blue-600 transition mb-2 line-clamp-2">{article.title}</h2>
                {article.excerpt && <p className="text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
