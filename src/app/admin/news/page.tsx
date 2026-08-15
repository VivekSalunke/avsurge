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
      <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 text-[var(--text)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">News Manager</h1>
          <p className="text-sm text-[rgba(255,255,255,0.4)] mt-1">{articles.length} articles</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="text-sm text-neon-cyan hover:underline">← Admin</Link>
          <Link href="/admin/news/new"
            className="bg-gradient-to-r from-neon-violet to-neon-cyan text-black px-4 py-2 rounded-xl text-sm font-semibold transition hover:brightness-110">
            + New Article
          </Link>
        </div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search articles..."
        className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-2.5 text-sm mb-6 focus:outline-none focus:border-neon-cyan"
        style={{ color: '#111827', backgroundColor: '#ffffff' }} />

      {filtered.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-dashed border-[rgba(255,255,255,0.06)] rounded-2xl py-20 text-center">
          <p className="text-4xl mb-3">📰</p>
          <p className="text-sm text-[rgba(255,255,255,0.4)]">No articles yet. Create your first one!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(article => (
            <div key={article.id} className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-neon-cyan transition">
              {article.image_url && (
                <img src={article.image_url} alt={article.title} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${article.published ? 'badge-green' : 'bg-[rgba(255,255,255,0.04)] text-dim'}`}>
                    {article.published ? 'Published' : 'Draft'}
                  </span>
                  {article.category && (
                    <span className="text-xs text-[rgba(255,255,255,0.4)]">{article.category}</span>
                  )}
                </div>
                <p className="font-semibold text-white truncate">{article.title}</p>
                <p className="text-xs text-[rgba(255,255,255,0.4)] mt-0.5">{new Date(article.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/news/${article.slug}`} target="_blank"
                  className="text-xs border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] px-3 py-1.5 rounded-lg hover:border-neon-cyan hover:text-neon-cyan transition">
                  View
                </Link>
                <Link href={`/admin/news/${article.id}`}
                  className="text-xs border border-[rgba(6,182,212,0.25)] text-neon-cyan px-3 py-1.5 rounded-lg hover:bg-[rgba(6,182,212,0.06)] transition">
                  Edit
                </Link>
                <button onClick={() => togglePublished(article.id, article.published)}
                  className={`text-xs border px-3 py-1.5 rounded-lg transition ${article.published ? 'border-[rgba(249,115,22,0.3)] text-orange-400 hover:bg-[rgba(249,115,22,0.08)]' : 'border-[rgba(16,185,129,0.3)] text-green-400 hover:bg-[rgba(16,185,129,0.08)]'}`}>
                  {article.published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => deleteArticle(article.id, article.title)}
                  className="text-xs border border-[rgba(239,68,68,0.3)] text-red-400 px-3 py-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.08)] transition">
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
