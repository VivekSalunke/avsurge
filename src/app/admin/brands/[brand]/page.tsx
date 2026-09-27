'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function EditBrandPage() {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const brandName = decodeURIComponent(params?.brand as string)

  const [form, setForm] = useState({ logo_url: '', description: '' })
  const [existingId, setExistingId] = useState<number | null>(null)
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) router.push('/login')
    else if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading, profileLoading, router])

  useEffect(() => {
    if (!user || !isAdmin || !brandName) return
    supabase.from('brand_logos').select('*').eq('brand', brandName).single().then(({ data }) => {
      if (data) {
        setExistingId(data.id)
        setForm({ logo_url: data.logo_url || '', description: data.description || '' })
      }
      setFetching(false)
    })
  }, [user, isAdmin, brandName])

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    const { error } = await supabase.from('brand_logos').upsert(
      { brand: brandName, logo_url: form.logo_url || null, description: form.description || null },
      { onConflict: 'brand' }
    )
    setSaving(false)
    if (error) { setMsg('Error: ' + error.message); return }
    router.push('/admin/brands')
  }

  const handleDelete = async () => {
    if (!existingId) return
    if (!confirm(`Delete the logo/description for ${brandName}?`)) return
    await supabase.from('brand_logos').delete().eq('id', existingId)
    router.push('/admin/brands')
  }

  const inputStyle = { color: '#111827', backgroundColor: '#ffffff' }

  if (loading || fetching) return <div className="flex items-center justify-center min-h-screen text-[var(--text)]"><div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 text-[var(--text)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Edit Brand: {brandName}</h1>
        <Link href="/admin/brands" className="text-sm text-neon-cyan hover:underline">← Back to brands</Link>
      </div>

      <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 neon-border">
        <div className="mb-5">
          <label className="text-xs text-dim mb-1 block">Logo URL</label>
          <input
            placeholder="https://example.com/logo.png"
            value={form.logo_url}
            onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
            className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
            style={inputStyle}
          />
        </div>

        {form.logo_url && (
          <div className="mb-5 bg-[rgba(255,255,255,0.02)] rounded-xl p-6 flex flex-col items-center gap-3">
            <Image
              src={form.logo_url}
              alt="Preview"
              unoptimized
              width={400}
              height={160}
              className="max-h-40 w-auto object-contain"
              onError={e => (e.target as HTMLImageElement).style.display = 'none'}
            />
            <span className="text-xs text-[rgba(255,255,255,0.4)]">Logo preview</span>
          </div>
        )}

        <div className="mb-5">
          <label className="text-xs text-dim mb-1 block">Description <span className="text-[rgba(255,255,255,0.3)]">(optional — shown on the brand's page)</span></label>
          <textarea
            placeholder={`A short description of ${brandName}...`}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={5}
            className="w-full border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan resize-none"
            style={inputStyle}
          />
        </div>

        {msg && <p className={`text-sm mb-4 ${msg.startsWith('Error') ? 'text-[#f87171]' : 'text-[#34d399]'}`}>{msg}</p>}

        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className="bg-gradient-to-r from-neon-violet to-neon-cyan text-black font-semibold rounded-xl px-5 py-2 text-sm transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <Link href="/admin/brands"
            className="border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2 text-sm text-dim hover:border-neon-violet hover:text-white transition">
            Cancel
          </Link>
          {existingId && (
            <button onClick={handleDelete}
              className="ml-auto text-xs text-red-400 hover:text-red-600 hover:underline">
              Delete
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
