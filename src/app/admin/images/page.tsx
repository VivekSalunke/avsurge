'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type DeviceType = 'phones' | 'tablets' | 'laptops'

export default function AdminImagesPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<DeviceType>('phones')
  const [devices, setDevices] = useState<any[]>([])
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'missing'>('missing')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (loading) return
    if (!user) router.push('/login')
    if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading])

  useEffect(() => {
    if (user && isAdmin) fetchDevices()
  }, [user, isAdmin, mode])

  const fetchDevices = async () => {
    setFetching(true)
    const { data } = await supabase.from(mode).select('id, name, brand, slug, image_url, price_inr').order('brand')
    setDevices(data || [])
    setFetching(false)
  }

  const saveImage = async (id: number) => {
    setSaving(id)
    const { error } = await supabase.from(mode).update({ image_url: editUrl || null }).eq('id', id)
    if (!error) {
      setDevices(prev => prev.map(d => d.id === id ? { ...d, image_url: editUrl } : d))
      setMsg('Saved!')
      setEditingId(null)
      setEditUrl('')
      setTimeout(() => setMsg(''), 2000)
    }
    setSaving(null)
  }

  const startEdit = (device: any) => {
    setEditingId(device.id)
    setEditUrl(device.image_url || '')
  }

  const filtered = devices.filter(d => {
    if (filter === 'missing' && d.image_url) return false
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.brand.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const missingCount = devices.filter(d => !d.image_url).length
  const emoji = mode === 'phones' ? '📱' : mode === 'tablets' ? '📟' : '💻'

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Image Manager</h1>
          <p className="text-sm text-gray-400 mt-1">Add or update device images</p>
        </div>
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
      </div>

      {msg && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm text-green-700 mb-4">{msg}</div>}

      {/* Mode toggle */}
      <div className="flex gap-2 mb-5 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {(['phones', 'tablets', 'laptops'] as DeviceType[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === m ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            {m === 'phones' ? '📱' : m === 'tablets' ? '📟' : '💻'} {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats + filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-2">
          <button onClick={() => setFilter('missing')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${filter === 'missing' ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-500 hover:border-orange-400'}`}>
            ⚠️ Missing ({missingCount})
          </button>
          <button onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${filter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-400'}`}>
            All ({devices.length})
          </button>
        </div>
        <input
          placeholder="Search by name or brand..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 max-w-xs focus:outline-none focus:border-blue-400"
          style={{ color: '#111827', backgroundColor: '#ffffff' }}
        />
      </div>

      {fetching ? (
        <div className="text-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-sm text-gray-500">All {mode} have images!</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Device</th>
                <th className="px-4 py-3 text-left">Image URL</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((device, i) => (
                <tr key={device.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {device.image_url
                        ? <img src={device.image_url} alt={device.name} className="object-contain w-full h-full p-1" />
                        : <span className="text-xl">{emoji}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{device.name}</p>
                    <p className="text-xs text-gray-400">{device.brand}</p>
                  </td>
                  <td className="px-4 py-3">
                    {editingId === device.id ? (
                      <input
                        value={editUrl}
                        onChange={e => setEditUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full border border-blue-400 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                        style={{ color: '#111827', backgroundColor: '#ffffff' }}
                        onKeyDown={e => e.key === 'Enter' && saveImage(device.id)}
                        autoFocus
                      />
                    ) : (
                      <p className="text-xs text-gray-400 truncate max-w-xs">
                        {device.image_url || <span className="text-orange-400">No image</span>}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === device.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => saveImage(device.id)} disabled={saving === device.id}
                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                          {saving === device.id ? '...' : 'Save'}
                        </button>
                        <button onClick={() => { setEditingId(null); setEditUrl('') }}
                          className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-400 transition">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(device)}
                        className="text-xs text-blue-600 hover:underline">
                        {device.image_url ? 'Edit' : '+ Add image'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
