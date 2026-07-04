'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [status, setStatus] = useState<'idle'|'saving'|'success'|'error'>('idle')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const [stats, setStats] = useState({ reviews: 0, wishlist: 0, avgRating: 0 })

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.display_name || '')
      fetchStats()
      fetchReviews()
    }
  }, [user])

  const fetchStats = async () => {
    const [{ data: wl }, { data: twl }, { data: lwl }, { data: rv }] = await Promise.all([
      supabase.from('wishlist').select('id').eq('user_id', user?.id),
      supabase.from('tablet_wishlist').select('id').eq('user_id', user?.id),
      supabase.from('laptop_wishlist').select('id').eq('user_id', user?.id),
      supabase.from('reviews').select('rating').eq('user_id', user?.id),
    ])
    const totalWishlist = (wl?.length || 0) + (twl?.length || 0) + (lwl?.length || 0)
    const avgRating = rv?.length ? (rv.reduce((a, r) => a + r.rating, 0) / rv.length).toFixed(1) : 0
    setStats({ reviews: rv?.length || 0, wishlist: totalWishlist, avgRating: Number(avgRating) })
  }

  const fetchReviews = async () => {
    const [{ data: phoneReviews }, { data: tabletReviews }, { data: laptopReviews }] = await Promise.all([
      supabase.from('reviews').select('*, phones(name, slug, image_url)').eq('user_id', user?.id).order('created_at', { ascending: false }),
      supabase.from('tablet_reviews').select('*, tablets(name, slug, image_url)').eq('user_id', user?.id).order('created_at', { ascending: false }),
      supabase.from('laptop_reviews').select('*, laptops(name, slug, image_url)').eq('user_id', user?.id).order('created_at', { ascending: false }),
    ])
    const all = [
      ...(phoneReviews || []).map(r => ({ ...r, deviceType: 'phone', device: r.phones })),
      ...(tabletReviews || []).map(r => ({ ...r, deviceType: 'tablet', device: r.tablets })),
      ...(laptopReviews || []).map(r => ({ ...r, deviceType: 'laptop', device: r.laptops })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setReviews(all)
  }

  const handleSaveProfile = async () => {
    setStatus('saving'); setMessage('')
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } })
    if (error) { setMessage(error.message); setStatus('error') }
    else { setMessage('Profile updated!'); setStatus('success') }
  }

  const handleChangePassword = async () => {
    if (!newPassword) { setMessage('Enter a new password'); setStatus('error'); return }
    if (newPassword.length < 6) { setMessage('Password must be at least 6 characters'); setStatus('error'); return }
    setStatus('saving'); setMessage('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setMessage(error.message); setStatus('error') }
    else { setMessage('Password updated!'); setStatus('success'); setNewPassword('') }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) { setMessage('Email does not match'); setStatus('error'); return }
    await signOut()
    router.push('/')
  }

  const deleteReview = async (id: number, deviceType: string) => {
    const table = deviceType === 'tablet' ? 'tablet_reviews' : deviceType === 'laptop' ? 'laptop_reviews' : 'reviews'
    await supabase.from(table).delete().eq('id', id)
    fetchReviews()
    fetchStats()
  }

  const stars = (n: number) => [1,2,3,4,5].map(i => (
    <span key={i} className={i <= n ? 'text-yellow-400' : 'text-gray-200'}>★</span>
  ))

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h1>
      <p className="text-sm text-gray-400 mb-6">Manage your AVSurge account</p>

      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm mb-6 border ${status === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.wishlist}</p>
          <p className="text-xs text-gray-400 mt-1">Wishlisted</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.reviews}</p>
          <p className="text-xs text-gray-400 mt-1">Reviews</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">{stats.avgRating || '—'}</p>
          <p className="text-xs text-gray-400 mt-1">Avg rating</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/wishlist" className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:border-blue-300 transition">
          <span className="text-2xl">❤️</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">My Wishlist</p>
            <p className="text-xs text-gray-400">{stats.wishlist} devices saved</p>
          </div>
        </Link>
        <Link href="/search" className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:border-blue-300 transition">
          <span className="text-2xl">🔍</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">Search & Discover</p>
            <p className="text-xs text-gray-400">Filter & find devices</p>
          </div>
        </Link>
        <Link href="/ai-recommend" className="bg-white border border-purple-200 rounded-xl p-3 flex items-center gap-3 hover:border-purple-300 transition">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">AI Recommender</p>
            <p className="text-xs text-gray-400">Get AI suggestions</p>
          </div>
        </Link>
      </div>

      {/* Account info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Account info</h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{displayName || 'No name set'}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Display name</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="Your name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>
          <button onClick={handleSaveProfile} disabled={status === 'saving'}
            className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            Save profile
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Change password</h2>
        <div className="flex flex-col gap-3">
          <input
            type="password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <button onClick={handleChangePassword} disabled={status === 'saving'}
            className="w-full bg-gray-900 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50">
            Update password
          </button>
        </div>
      </div>

      {/* Review history */}
      {reviews.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">My reviews</h2>
          <div className="flex flex-col gap-3">
            {reviews.map(review => (
              <div key={review.id} className="flex items-start gap-3 border border-gray-100 rounded-xl p-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {review.device?.image_url
                    ? <img src={review.device.image_url} alt={review.device.name} className="object-contain w-full h-full" />
                    : <span>{review.deviceType === 'tablet' ? '📟' : review.deviceType === 'laptop' ? '💻' : '📱'}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/${review.deviceType === 'phone' ? 'phones' : review.deviceType + 's'}/${review.device?.slug}`} className="text-sm font-semibold text-gray-900 hover:text-blue-600 truncate block">
                    {review.device?.name}
                  </Link>
                  <p className="text-xs text-gray-400 mb-0.5 capitalize">{review.deviceType}</p>
                  <div className="flex text-xs gap-0.5 my-0.5">{stars(review.rating)}</div>
                  {review.body && <p className="text-xs text-gray-500 line-clamp-2">{review.body}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <button onClick={() => deleteReview(review.id, review.deviceType)}
                  className="text-xs text-red-400 hover:text-red-600 flex-shrink-0">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sign out */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <button onClick={() => { signOut(); router.push('/') }}
          className="w-full border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition">
          Sign out
        </button>
      </div>

      {/* Delete account */}
      <div className="bg-white border border-red-200 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-1">Danger zone</h2>
        <p className="text-xs text-gray-400 mb-4">Deleting your account is permanent and cannot be undone.</p>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)}
            className="w-full border border-red-200 text-red-500 rounded-xl py-2.5 text-sm font-semibold hover:bg-red-50 transition">
            Delete account
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-500">Type your email <span className="font-semibold text-gray-700">{user?.email}</span> to confirm:</p>
            <input
              className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
              placeholder={user?.email}
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={handleDeleteAccount} disabled={status === 'saving'}
                className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50">
                Confirm delete
              </button>
              <button onClick={() => { setShowDelete(false); setDeleteConfirm('') }}
                className="flex-1 border border-gray-200 text-gray-500 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
