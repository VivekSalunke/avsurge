'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Tab = 'phones' | 'tablets' | 'laptops'

export default function WishlistPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('phones')
  const [phones, setPhones] = useState<any[]>([])
  const [tablets, setTablets] = useState<any[]>([])
  const [laptops, setLaptops] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (user) fetchAll()
  }, [user])

  const fetchAll = async () => {
    const [{ data: phoneWl }, { data: tabletWl }, { data: laptopWl }] = await Promise.all([
      supabase.from('wishlist').select('phone_id, phones(*)').eq('user_id', user?.id).order('created_at', { ascending: false }),
      supabase.from('tablet_wishlist').select('tablet_id, tablets(*)').eq('user_id', user?.id).order('created_at', { ascending: false }),
      supabase.from('laptop_wishlist').select('laptop_id, laptops(*)').eq('user_id', user?.id).order('created_at', { ascending: false }),
    ])
    setPhones((phoneWl || []).map((w: any) => w.phones))
    setTablets((tabletWl || []).map((w: any) => w.tablets))
    setLaptops((laptopWl || []).map((w: any) => w.laptops))
    setFetching(false)
  }

  const removePhone = async (id: number) => {
    await supabase.from('wishlist').delete().eq('user_id', user?.id).eq('phone_id', id)
    setPhones(prev => prev.filter(p => p.id !== id))
  }

  const removeTablet = async (id: number) => {
    await supabase.from('tablet_wishlist').delete().eq('user_id', user?.id).eq('tablet_id', id)
    setTablets(prev => prev.filter(t => t.id !== id))
  }

  const removeLaptop = async (id: number) => {
    await supabase.from('laptop_wishlist').delete().eq('user_id', user?.id).eq('laptop_id', id)
    setLaptops(prev => prev.filter(l => l.id !== id))
  }

  const items = tab === 'phones' ? phones : tab === 'tablets' ? tablets : laptops
  const removeItem = tab === 'phones' ? removePhone : tab === 'tablets' ? removeTablet : removeLaptop
  const itemBase = tab === 'phones' ? '/phones' : tab === 'tablets' ? '/tablets' : '/laptops'
  const itemEmoji = tab === 'phones' ? '📱' : tab === 'tablets' ? '📟' : '💻'

  if (loading || fetching) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-sm text-gray-400 mt-1">{phones.length + tablets.length + laptops.length} saved devices</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        <button onClick={() => setTab('phones')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'phones' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
          📱 Phones {phones.length > 0 && `(${phones.length})`}
        </button>
        <button onClick={() => setTab('tablets')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'tablets' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
          📟 Tablets {tablets.length > 0 && `(${tablets.length})`}
        </button>
        <button onClick={() => setTab('laptops')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'laptops' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
          💻 Laptops {laptops.length > 0 && `(${laptops.length})`}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-24 text-center">
          <p className="text-4xl mb-4">🤍</p>
          <p className="text-gray-500 font-medium mb-1">No {tab} saved yet</p>
          <p className="text-gray-400 text-sm mb-6">Browse {tab} and click Add to wishlist</p>
          <Link href={`/${tab}`} className="text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition">
            Browse {tab} →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: any) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-sm transition group">
              <Link href={`${itemBase}/${item.slug}`}>
                <div className="w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} className="object-contain w-full h-full p-4" />
                    : <span className="text-6xl">{itemEmoji}</span>}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-0.5">{item.brand}</p>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition mb-1">{item.name}</p>
                  {item.price_inr && (
                    <p className="text-blue-600 font-bold">₹{item.price_inr.toLocaleString('en-IN')}</p>
                  )}
                </div>
              </Link>
              <div className="px-4 pb-4 flex gap-2">
                <Link href={`${itemBase}/${item.slug}`}
                  className="flex-1 text-center text-xs bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700 transition">
                  View specs →
                </Link>
                <button onClick={() => removeItem(item.id)}
                  className="px-3 py-2 text-xs text-red-400 border border-red-200 rounded-xl hover:bg-red-50 transition">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
