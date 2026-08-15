'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface Review {
  id: number
  user_email: string
  rating: number
  body: string
  created_at: string
}

export default function TabletReviews({ tabletId }: { tabletId: number }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchReviews() }, [tabletId])

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('tablet_reviews')
      .select('*')
      .eq('tablet_id', tabletId)
      .order('created_at', { ascending: false })
    setReviews(data || [])
  }

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const handleSubmit = async () => {
    if (!rating) { setError('Please select a rating'); setStatus('error'); return }
    setStatus('saving'); setError('')

    const { error: e } = await supabase.from('tablet_reviews').insert({
      tablet_id: tabletId,
      user_id: user?.id,
      user_email: user?.email,
      rating,
      title: '',
      body: body.trim() || null,
    })

    if (e) { setError(e.message); setStatus('error'); return }

    setStatus('success')
    setRating(0); setBody('')
    setShowForm(false)
    fetchReviews()
  }

  const deleteReview = async (id: number) => {
    await supabase.from('tablet_reviews').delete().eq('id', id)
    fetchReviews()
  }

  const stars = (n: number, size = 'text-xl') => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`${size} ${i <= n ? 'text-yellow-400' : 'text-[rgba(255,255,255,0.15)]'}`}>★</span>
      ))}
    </div>
  )

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden neon-border text-[var(--text)]">
      <div className="flex items-center justify-between px-5 py-4 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[rgba(255,255,255,0.85)]">⭐ Reviews</span>
          {avgRating && (
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-yellow-500">{avgRating}</span>
              {stars(Math.round(Number(avgRating)), 'text-sm')}
              <span className="text-xs text-[rgba(255,255,255,0.4)]">({reviews.length})</span>
            </div>
          )}
        </div>
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs bg-gradient-to-r from-neon-violet to-neon-cyan text-black px-3 py-1.5 rounded-lg hover:opacity-90 transition">
            Write a review
          </button>
        )}
        {!user && (
          <a href="/login" className="text-xs text-neon-cyan hover:underline">Sign in to review</a>
        )}
      </div>

      {showForm && (
        <div className="px-5 py-5 border-b border-[rgba(255,255,255,0.04)] bg-[rgba(6,182,212,0.02)]">
          <h3 className="text-sm font-semibold text-white mb-4">Your review</h3>

          {error && (
            <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)] text-red-400 text-xs rounded-lg px-3 py-2 mb-3">{error}</div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-medium text-dim mb-2">Rating *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(i)}
                  className={`text-3xl transition ${i <= (hovered || rating) ? 'text-yellow-400' : 'text-[rgba(255,255,255,0.15)]'}`}>
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-dim mb-1">Review <span className="text-[rgba(255,255,255,0.3)]">(optional)</span></label>
            <textarea
              className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan resize-none"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              placeholder="Share your experience with this tablet..."
              rows={4}
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={status === 'saving'}
              className="flex-1 bg-gradient-to-r from-neon-violet to-neon-cyan text-black rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50">
              {status === 'saving' ? 'Posting…' : 'Post review'}
            </button>
            <button
              onClick={() => { setShowForm(false); setRating(0); setBody(''); setError('') }}
              className="px-4 py-2.5 border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.85)] rounded-xl text-sm hover:border-neon-violet hover:text-white hover:glow transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="px-5 py-12 text-center text-[rgba(255,255,255,0.4)] text-sm">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        <div className="divide-y divide-[rgba(255,255,255,0.06)]">
          {reviews.map(review => (
            <div key={review.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[rgba(6,182,212,0.12)] rounded-full flex items-center justify-center text-neon-cyan text-xs font-bold flex-shrink-0">
                    {review.user_email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[rgba(255,255,255,0.85)]">{review.user_email?.split('@')[0]}</p>
                    <p className="text-xs text-[rgba(255,255,255,0.4)]">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stars(review.rating, 'text-sm')}
                  {user?.email === review.user_email && (
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="text-xs text-red-400 hover:text-red-300 ml-2">
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {review.body && (
                <p className="text-sm text-[rgba(255,255,255,0.65)] leading-relaxed">{review.body}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
