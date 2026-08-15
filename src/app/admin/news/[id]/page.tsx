'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const CATEGORIES = ['General', 'Phones', 'Tablets', 'Laptops', 'Reviews', 'Tips', 'Industry News']

export default function EditArticlePage() {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', image_url: '', category: 'General', published: false
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const inputStyle = { color: '#111827', backgroundColor: '#ffffff' }

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) router.push('/login')
    else if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading, profileLoading])

  useEffect(() => {
    if (isAdmin && id) fetchArticle()
  }, [isAdmin, id])

  const fetchArticle = async () => {
    const { data } = await supabase.from('news').select('*').eq('id', id).single()
    if (data) setForm({
      title: data.title, slug: data.slug, excerpt: data.excerpt || '',
      content: data.content || '', image_url: data.image_url || '',
      category: data.category || 'General', published: data.published
    })
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('news').update({
      title: form.title, slug: form.slug, excerpt: form.excerpt,
      content: form.content, image_url: form.image_url || null,
      category: form.category, published: form.published,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) setMsg('Error: ' + error.message)
    else setMsg('Saved!')
    setSaving(false)
    setTimeout(() => setMsg(''), 2000)
  }

  if (loading || profileLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 text-[var(--text)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Edit Article</h1>
        <div className="flex gap-3">
          <Link href={`/news/${form.slug}`} target="_blank" className="text-sm text-neon-cyan hover:underline">View →</Link>
          <Link href="/admin/news" className="text-sm text-neon-cyan hover:underline">← Back</Link>
        </div>
      </div>

      {msg && <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${msg.startsWith('Error') ? 'bg-[rgba(239,68,68,0.08)] text-red-400' : 'bg-[rgba(16,185,129,0.08)] text-green-400'}`}>{msg}</div>}

      <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4 neon-border">
        <div>
          <label className="text-xs text-dim mb-1 block">Title</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs text-dim mb-1 block">Slug</label>
          <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan" style={inputStyle} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-dim mb-1 block">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan" style={inputStyle}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-dim mb-1 block">Cover Image URL</label>
            <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan" style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="text-xs text-dim mb-1 block">Excerpt</label>
          <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            rows={2} className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan resize-none" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs text-dim mb-1 block">Content</label>
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={16} className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan resize-none font-mono" style={inputStyle} />
        </div>
        <div className="flex items-center gap-4 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="bg-gradient-to-r from-neon-violet to-neon-cyan text-black rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:brightness-110 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
              className="accent-neon-cyan w-4 h-4" />
            <span className="text-sm text-[rgba(255,255,255,0.65)]">Published</span>
          </label>
        </div>
      </div>
    </main>
  )
}
