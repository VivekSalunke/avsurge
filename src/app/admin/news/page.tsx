'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminNewsPage() {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) router.push('/login')
    else if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading, profileLoading])

  useEffect(() => {
    if (isAdmin) fetchArticles()
  }, [isAdmin])

  const fetchArticles = async () => {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false })
    setArticles(data || [])
    setFetching(false)
  }

  const togglePublished = async (id: number, published: boolean) => {
    await supabase.from('news').update({ published: !published }).eq('id', id)
    setArticles(prev => prev.map(a => a.id === id ? { ...a, published: !published } : a))
  }

  const deleteArticle = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    await supabase.from('news').delete().eq('id', id)
    setArticles(prev => prev.filter(a => a.id !== id))
  }

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.category || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading || profileLoading || fetching) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">News Manager</h1>
          <p className="text-sm text-gray-400 mt-1">{articles.length} articles</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
          <Link href="/admin/news/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
            + New Article
          </Link>
        </div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search articles..."
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-6 focus:outline-none focus:border-blue-400"
        style={{ color: '#111827', backgroundColor: '#ffffff' }} />

      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center">
          <p className="text-4xl mb-3">📰</p>
          <p className="text-sm text-gray-400">No articles yet. Create your first one!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(article => (
            <div key={article.id} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-blue-200 transition">
              {article.image_url && (
                <img src={article.image_url} alt={article.title} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${article.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {article.published ? 'Published' : 'Draft'}
                  </span>
                  {article.category && (
                    <span className="text-xs text-gray-400">{article.category}</span>
                  )}
                </div>
                <p className="font-semibold text-gray-900 truncate">{article.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(article.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/news/${article.slug}`} target="_blank"
                  className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-blue-400 hover:text-blue-600 transition">
                  View
                </Link>
                <Link href={`/admin/news/${article.id}`}
                  className="text-xs border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                  Edit
                </Link>
                <button onClick={() => togglePublished(article.id, article.published)}
                  className={`text-xs border px-3 py-1.5 rounded-lg transition ${article.published ? 'border-orange-200 text-orange-500 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                  {article.published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => deleteArticle(article.id, article.title)}
                  className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
