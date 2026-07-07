import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
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
  'Phones': 'bg-blue-100 text-blue-700',
  'Tablets': 'bg-teal-100 text-teal-700',
  'Laptops': 'bg-indigo-100 text-indigo-700',
  'Reviews': 'bg-yellow-100 text-yellow-700',
  'Tips': 'bg-green-100 text-green-700',
  'Industry News': 'bg-purple-100 text-purple-700',
  'General': 'bg-gray-100 text-gray-700',
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

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/news" className="hover:text-blue-600">News</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600 truncate">{article.title}</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[article.category] || CATEGORY_COLORS['General']}`}>
          {article.category}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(article.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{article.title}</h1>

      {article.excerpt && (
        <p className="text-lg text-gray-500 mb-6 leading-relaxed">{article.excerpt}</p>
      )}

      {article.image_url && (
        <div className="w-full h-64 sm:h-96 overflow-hidden rounded-2xl mb-8 bg-gray-100">
          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}

      {article.content && (
        <div className="prose prose-gray max-w-none">
          {article.content.split('\n').map((para: string, i: number) => (
            para.trim() ? <p key={i} className="text-gray-700 leading-relaxed mb-4">{para}</p> : null
          ))}
        </div>
      )}

      {related && related.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Related articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map(r => (
              <Link key={r.id} href={`/news/${r.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition group">
                {r.image_url && <img src={r.image_url} alt={r.title} className="w-full h-24 object-cover rounded-lg mb-3" />}
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">{r.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/news" className="text-sm text-blue-600 hover:underline">← Back to all news</Link>
      </div>
    </main>
  )
}
