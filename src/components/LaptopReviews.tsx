'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function LaptopReviews({ laptopId }: { laptopId: number }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<any[]>([])
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hover, setHover] = useState(0)

  useEffect(() => { fetchReviews() }, [laptopId])

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('laptop_reviews')
      .select('*, profiles(display_name)')
      .eq('laptop_id', laptopId)
      .order('created_at', { ascending: false })
    setReviews(data || [])
  }

  const submit = async () => {
    if (!user || !rating) return
    setSubmitting(true)
    const { error } = await supabase.from('laptop_reviews').upsert({
      laptop_id: laptopId, user_id: user.id, rating, body: body.trim() || null
    }, { onConflict: 'laptop_id,user_id' })
    if (!error) { setBody(''); fetchReviews() }
    setSubmitting(false)
  }

  const deleteReview = async (id: number) => {
    await supabase.from('laptop_reviews').delete().eq('id', id)
    fetchReviews()
  }

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const stars = (n: number, interactive = false) => [1,2,3,4,5].map(i => (
    <button key={i} type="button"
      onClick={() => interactive && setRating(i)}
      onMouseEnter={() => interactive && setHover(i)}
      onMouseLeave={() => interactive && setHover(0)}
      className={interactive ? 'cursor-pointer' : 'cursor-default'}>
      <span className={(interactive ? (i <= (hover || rating)) : i <= n) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
    </button>
  ))

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">Reviews</span>
        {avgRating && (
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-sm font-bold text-gray-800">{avgRating}</span>
            <span className="text-xs text-gray-400">({reviews.length})</span>
          </div>
        )}
      </div>

      {user && (
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">Write a review</p>
          <div className="flex gap-1 mb-3 text-xl">{stars(rating, true)}</div>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Share your experience with this laptop..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none mb-3"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
          />
          <button onClick={submit} disabled={submitting}
            className="bg-blue-600 text-white rounded-xl px-5 py-2 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit review'}
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-gray-400">
          No reviews yet. {user ? 'Be the first to review!' : 'Sign in to write a review.'}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {reviews.map(review => (
            <div key={review.id} className="px-5 py-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="flex text-sm">{stars(review.rating)}</div>
                  <span className="text-xs text-gray-400">
                    {review.profiles?.display_name || 'User'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {user?.id === review.user_id && (
                    <button onClick={() => deleteReview(review.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition">
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {review.body && <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
