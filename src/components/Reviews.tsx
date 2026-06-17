'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface Review {
  id: number
  user_email: string
  rating: number
  title: string
  body: string
  created_at: string
}

export default function Reviews({ phoneId }: { phoneId: number }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle'|'saving'|'success'|'error'>('idle')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchReviews() }, [phoneId])

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('phone_id', phoneId)
      .order('created_at', { ascending: false })
    setReviews(data || [])
  }

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const handleSubmit = async () => {
    if (!rating) { setError('Please select a rating'); setStatus('error'); return }
    if (!title.trim()) { setError('Please add a title'); setStatus('error'); return }
    if (!body.trim()) { setError('Please write a review'); setStatus('error'); return }
    setStatus('saving'); setError('')

    const { error: e } = await supabase.from('reviews').insert({
      phone_id: phoneId,
      user_id: user?.id,
      user_email: user?.email,
      rating,
      title: title.trim(),
      body: body.trim(),
    })

    if (e) { setError(e.message); setStatus('error'); return }

    setStatus('success')
    setRating(0); setTitle(''); setBody('')
    setShowForm(false)
    fetchReviews()
  }

  const deleteReview = async (id: number) => {
    await supabase.from('reviews').delete().eq('id', id)
    fetchReviews()
  }

  const stars = (n: number, size = 'text-xl') => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`${size} ${i <= n ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">⭐ Reviews</span>
          {avgRating && (
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-yellow-500">{avgRating}</span>
              {stars(Math.round(Number(avgRating)), 'text-sm')}
              <span className="text-xs text-gray-400">({reviews.length})</span>
            </div>
          )}
        </div>
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
            Write a review
          </button>
        )}
        {!user && (
          <a href="/login" className="text-xs text-blue-600 hover:underline">Sign in to review</a>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <div className="px-5 py-5 border-b border-gray-100 bg-blue-50/30">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Your review</h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 mb-3">{error}</div>
          )}

          {/* Star rating */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">Rating *</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <button
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(i)}
                  className={`text-3xl transition ${i <= (hovered || rating) ? 'text-yellow-400' : 'text-gray-200'}`}>
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Title *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                placeholder="Summarize your experience"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Review *</label>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Share your experience with this phone..."
                rows={4}
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={status === 'saving'}
              className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {status === 'saving' ? 'Posting…' : 'Post review'}
            </button>
            <button
              onClick={() => { setShowForm(false); setRating(0); setTitle(''); setBody(''); setError('') }}
              className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="px-5 py-12 text-center text-gray-400 text-sm">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {reviews.map(review => (
            <div key={review.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                    {review.user_email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">{review.user_email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stars(review.rating, 'text-sm')}
                  {(user?.email === review.user_email) && (
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="text-xs text-red-400 hover:text-red-600 ml-2">
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{review.title}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
