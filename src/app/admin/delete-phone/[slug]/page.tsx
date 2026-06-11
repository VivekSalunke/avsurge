'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DeletePhonePage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [phone, setPhone] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    supabase.from('phones').select('*').eq('slug', params.slug).single()
      .then(({ data }) => { setPhone(data); setLoading(false) })
  }, [params.slug])

  const handleDelete = async () => {
    setDeleting(true)
    await supabase.from('phone_specs').delete().eq('phone_id', phone.id)
    await supabase.from('phones').delete().eq('id', phone.id)
    router.push('/admin')
  }

  if (loading) return <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-400">Loading…</div>
  if (!phone) return <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-400">Phone not found.</div>

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🗑️</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Delete phone</h1>
        <p className="text-sm text-gray-500 mb-2">Are you sure you want to delete</p>
        <p className="text-base font-semibold text-gray-900 mb-1">{phone.name}</p>
        <p className="text-sm text-gray-400 mb-8">This will also delete all specs. This cannot be undone.</p>

        <div className="flex gap-3">
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 bg-red-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50">
            {deleting ? 'Deleting…' : 'Yes, delete'}
          </button>
          <Link href="/admin"
            className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition text-center">
            Cancel
          </Link>
        </div>
      </div>
    </main>
  )
}
