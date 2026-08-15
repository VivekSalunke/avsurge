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
    <span key={i} className={i <= n ? 'text-yellow-400' : 'text-[rgba(255,255,255,0.2)]'}>★</span>
  ))

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center text-[var(--text)]">
      <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 text-[var(--text)]">
      <h1 className="text-2xl font-bold text-white mb-1">My Profile</h1>
      <p className="text-sm text-[rgba(255,255,255,0.4)] mb-6">Manage your AVSurge account</p>

      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm mb-6 border ${status === 'success' ? 'bg-[rgba(6,182,212,0.06)] border-[rgba(6,182,212,0.2)] text-neon-cyan' : 'bg-[rgba(239,68,68,0.06)] border-[rgba(239,68,68,0.2)] text-red-400'}`}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-neon-cyan">{stats.wishlist}</p>
          <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">Wishlisted</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-neon-cyan">{stats.reviews}</p>
          <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">Reviews</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">{stats.avgRating || '—'}</p>
          <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">Avg rating</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/wishlist" className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-xl p-3 flex items-center gap-3 hover:border-neon-cyan transition">
          <span className="text-2xl">❤️</span>
          <div>
            <p className="text-sm font-semibold text-white">My Wishlist</p>
            <p className="text-xs text-[rgba(255,255,255,0.4)]">{stats.wishlist} devices saved</p>
          </div>
        </Link>
        <Link href="/search" className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-xl p-3 flex items-center gap-3 hover:border-neon-cyan transition">
          <span className="text-2xl">🔍</span>
          <div>
            <p className="text-sm font-semibold text-white">Search & Discover</p>
            <p className="text-xs text-[rgba(255,255,255,0.4)]">Filter & find devices</p>
          </div>
        </Link>
        <Link href="/ai-recommend" className="bg-[var(--card-bg)] border border-[rgba(139,92,246,0.2)] rounded-xl p-3 flex items-center gap-3 hover:border-neon-violet transition">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="text-sm font-semibold text-white">AI Recommender</p>
            <p className="text-xs text-[rgba(255,255,255,0.4)]">Get AI suggestions</p>
          </div>
        </Link>
      </div>

      {/* Account info */}
      <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 mb-4 neon-border">
        <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-4">Account info</h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-[rgba(6,182,212,0.12)] rounded-full flex items-center justify-center text-neon-cyan text-xl font-bold">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{displayName || 'No name set'}</p>
            <p className="text-sm text-[rgba(255,255,255,0.4)]">{user?.email}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-dim mb-1">Display name</label>
            <input
              className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              placeholder="Your name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>
          <button onClick={handleSaveProfile} disabled={status === 'saving'}
            className="w-full bg-gradient-to-r from-neon-violet to-neon-cyan text-black rounded-xl py-2.5 text-sm font-semibold hover:brightness-110 transition disabled:opacity-50">
            Save profile
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 mb-4 neon-border">
        <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-4">Change password</h2>
        <div className="flex flex-col gap-3">
          <input
            type="password"
            className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <button onClick={handleChangePassword} disabled={status === 'saving'}
            className="w-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-white rounded-xl py-2.5 text-sm font-semibold hover:border-neon-cyan transition disabled:opacity-50">
            Update password
          </button>
        </div>
      </div>

      {/* Review history */}
      {reviews.length > 0 && (
        <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 mb-4 neon-border">
          <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-4">My reviews</h2>
          <div className="flex flex-col gap-3">
            {reviews.map(review => (
              <div key={review.id} className="flex items-start gap-3 border border-[rgba(255,255,255,0.04)] rounded-xl p-3">
                <div className="w-10 h-10 bg-[rgba(255,255,255,0.02)] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {review.device?.image_url
                    ? <img src={review.device.image_url} alt={review.device.name} className="object-contain w-full h-full" />
                    : <span>{review.deviceType === 'tablet' ? '📟' : review.deviceType === 'laptop' ? '💻' : '📱'}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/${review.deviceType === 'phone' ? 'phones' : review.deviceType + 's'}/${review.device?.slug}`} className="text-sm font-semibold text-white hover:text-neon-cyan truncate block">
                    {review.device?.name}
                  </Link>
                  <p className="text-xs text-[rgba(255,255,255,0.4)] mb-0.5 capitalize">{review.deviceType}</p>
                  <div className="flex text-xs gap-0.5 my-0.5">{stars(review.rating)}</div>
                  {review.body && <p className="text-xs text-dim line-clamp-2">{review.body}</p>}
                  <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
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
      <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 mb-4 neon-border">
        <button onClick={() => { signOut(); router.push('/') }}
          className="w-full border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.65)] rounded-xl py-2.5 text-sm font-semibold hover:bg-[rgba(255,255,255,0.03)] transition">
          Sign out
        </button>
      </div>

      {/* Delete account */}
      <div className="bg-[var(--card-bg)] border border-[rgba(239,68,68,0.2)] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-1">Danger zone</h2>
        <p className="text-xs text-[rgba(255,255,255,0.4)] mb-4">Deleting your account is permanent and cannot be undone.</p>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)}
            className="w-full border border-[rgba(239,68,68,0.2)] text-red-400 rounded-xl py-2.5 text-sm font-semibold hover:bg-[rgba(239,68,68,0.06)] transition">
            Delete account
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-dim">Type your email <span className="font-semibold text-[rgba(255,255,255,0.85)]">{user?.email}</span> to confirm:</p>
            <input
              className="w-full border border-[rgba(239,68,68,0.2)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
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
                className="flex-1 border border-[rgba(255,255,255,0.06)] text-dim rounded-xl py-2.5 text-sm font-semibold hover:bg-[rgba(255,255,255,0.03)] transition">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
