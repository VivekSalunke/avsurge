'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function WishlistPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [phones, setPhones] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (user) fetchWishlist()
  }, [user])

  const fetchWishlist = async () => {
    const { data } = await supabase
      .from('wishlist')
      .select('phone_id, created_at, phones(*)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
    setPhones((data || []).map((w: any) => w.phones))
    setFetching(false)
  }

  const remove = async (phoneId: number) => {
    await supabase.from('wishlist').delete().eq('user_id', user?.id).eq('phone_id', phoneId)
    setPhones(prev => prev.filter(p => p.id !== phoneId))
  }

  if (loading || fetching) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-sm text-gray-400 mt-1">{phones.length} saved phone{phones.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/phones" className="text-sm text-blue-600 hover:underline">Browse phones →</Link>
      </div>

      {phones.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-24 text-center">
          <p className="text-4xl mb-4">🤍</p>
          <p className="text-gray-500 font-medium mb-1">Your wishlist is empty</p>
          <p className="text-gray-400 text-sm mb-6">Save phones you like by clicking Add to wishlist</p>
          <Link href="/phones" className="text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition">
            Browse phones →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {phones.map(phone => (
            <div key={phone.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-sm transition group">
              <Link href={`/phones/${phone.slug}`}>
                <div className="w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {phone.image_url
                    ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full p-4" />
                    : <span className="text-6xl">📱</span>}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-0.5">{phone.brand}</p>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition mb-1">{phone.name}</p>
                  {phone.price_inr && (
                    <p className="text-blue-600 font-bold">Rs.{phone.price_inr.toLocaleString('en-IN')}</p>
                  )}
                </div>
              </Link>
              <div className="px-4 pb-4 flex gap-2">
                <Link href={`/phones/${phone.slug}`}
                  className="flex-1 text-center text-xs bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700 transition">
                  View specs →
                </Link>
                <button
                  onClick={() => remove(phone.id)}
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
