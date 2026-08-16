'use client'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NavAuth() {
  const { user, isAdmin, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Profile'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (loading) return <div className="w-8 h-7 bg-[var(--card-bg)] rounded-lg animate-pulse" />

  if (!user) {
    return (
      <Link href="/login"
        className="text-xs bg-gradient-to-r from-neon-violet to-neon-cyan text-black px-3 py-1.5 rounded-lg transition font-medium">
        Sign in
      </Link>
    )
  }

  return (
    <div ref={ref} className="flex items-center gap-2">
      {isAdmin && (
        <Link href="/admin"
          className="group flex items-center gap-0 overflow-hidden bg-[rgba(6,182,212,0.1)] hover:bg-blue-500 text-neon-cyan hover:text-white rounded-xl transition-all duration-200 h-9 px-2.5 hover:px-3">
          <span className="font-bold text-lg leading-none">+</span>
          <span className="max-w-0 group-hover:max-w-xs overflow-hidden whitespace-nowrap transition-all duration-200 text-xs font-medium group-hover:ml-1.5">
            Admin panel
          </span>
        </Link>
      )}

      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="group flex items-center gap-0 overflow-hidden bg-[rgba(6,182,212,0.1)] hover:bg-blue-500 text-neon-cyan hover:text-white rounded-xl transition-all duration-200 h-9 px-2.5 hover:px-3">
          <span className="text-xs font-bold leading-none">{user.email?.[0].toUpperCase()}</span>
          <span className="max-w-0 group-hover:max-w-xs overflow-hidden whitespace-nowrap transition-all duration-200 text-xs font-medium group-hover:ml-1.5">
            {displayName}
          </span>
        </button>

        {open && (
          <div className="absolute right-0 top-11 bg-[var(--panel)] border border-[rgba(255,255,255,0.09)] rounded-xl shadow-2xl shadow-black/40 p-2 w-52 z-50">
            <p className="text-xs text-dim px-2 py-1 truncate">{user.email}</p>
            {isAdmin && <p className="text-xs text-neon-cyan font-semibold px-2 py-1">Admin</p>}
            <hr className="my-1 border-[rgba(255,255,255,0.04)]" />
            {isAdmin && (
              <button
                onMouseDown={() => { setOpen(false); router.push('/admin') }}
                className="w-full text-left text-xs text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.03)] px-2 py-1.5 rounded-lg transition">
                Admin Panel
              </button>
            )}
            <button
              onMouseDown={() => { setOpen(false); router.push('/wishlist') }}
              className="w-full text-left text-xs text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.03)] px-2 py-1.5 rounded-lg transition">
              ❤️ My Wishlist
            </button>
            <button
              onMouseDown={() => { setOpen(false); router.push('/profile') }}
              className="w-full text-left text-xs text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.03)] px-2 py-1.5 rounded-lg transition">
              My Profile
            </button>
            <hr className="my-1 border-[rgba(255,255,255,0.04)]" />
            <button
              onMouseDown={() => { setOpen(false); signOut(); router.push('/') }}
              className="w-full text-left text-xs text-red-400 hover:bg-[rgba(239,68,68,0.08)] px-2 py-1.5 rounded-lg transition">
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
