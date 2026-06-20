'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function TabletWishlistButton({ tabletId }: { tabletId: number }) {
  const { user } = useAuth()
  const router = useRouter()
  const [wishlisted, setWishlisted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) checkWishlist()
  }, [user, tabletId])

  const checkWishlist = async () => {
    const { data } = await supabase
      .from('tablet_wishlist')
      .select('id')
      .eq('user_id', user?.id)
      .eq('tablet_id', tabletId)
      .single()
    setWishlisted(!!data)
  }

  const toggle = async () => {
    if (!user) { router.push('/login'); return }
    setLoading(true)
    if (wishlisted) {
      await supabase.from('tablet_wishlist').delete().eq('user_id', user.id).eq('tablet_id', tabletId)
      setWishlisted(false)
    } else {
      await supabase.from('tablet_wishlist').insert({ user_id: user.id, tablet_id: tabletId })
      setWishlisted(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition border ${
        wishlisted
          ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
          : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
      }`}>
      <span className="text-base">{wishlisted ? '❤️' : '🤍'}</span>
      {wishlisted ? 'Saved to wishlist' : 'Add to wishlist'}
    </button>
  )
}
