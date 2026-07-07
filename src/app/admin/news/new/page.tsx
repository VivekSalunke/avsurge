'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const CATEGORIES = ['General', 'Phones', 'Tablets', 'Laptops', 'Reviews', 'Tips', 'Industry News']

export default function NewArticlePage() {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()
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

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSave = async (publish = false) => {
    if (!form.title || !form.slug) { setMsg('Title and slug are required'); return }
    setSaving(true)
    const { data, error } = await supabase.from('news').insert({
      title: form.title, slug: form.slug, excerpt: form.excerpt,
      content: form.content, image_url: form.image_url || null,
      category: form.category, published: publish,
    }).select().single()
    if (error) { setMsg('Error: ' + error.message); setSaving(false); return }
    router.push(`/admin/news/${data.id}`)
  }

  if (loading || profileLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">New Article</h1>
        <Link href="/admin/news" className="text-sm text-blue-600 hover:underline">← Back</Link>
      </div>

      {msg && <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${msg.startsWith('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{msg}</div>}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Title *</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: autoSlug(e.target.value) }))}
            placeholder="Article title" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Slug *</label>
          <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            placeholder="article-slug" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" style={inputStyle} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" style={inputStyle}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Cover Image URL</label>
            <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Excerpt (shown in listing)</label>
          <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            placeholder="Brief description of the article..." rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Content</label>
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Write your article content here..." rows={16}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none font-mono" style={inputStyle} />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => handleSave(true)} disabled={saving}
            className="bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Publish'}
          </button>
          <button onClick={() => handleSave(false)} disabled={saving}
            className="border border-gray-200 text-gray-600 rounded-xl px-5 py-2.5 text-sm font-semibold hover:border-gray-400 transition disabled:opacity-50">
            Save as Draft
          </button>
        </div>
      </div>
    </main>
  )
}
