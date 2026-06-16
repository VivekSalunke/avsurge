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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (loading) return <div className="w-16 h-7 bg-gray-100 rounded-lg animate-pulse" />

  if (!user) {
    return (
      <Link href="/login"
        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium">
        Sign in
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {isAdmin && (
        <Link href="/admin/add-phone"
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium">
          + Add phone
        </Link>
      )}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold hover:bg-blue-200 transition">
          {user.email?.[0].toUpperCase()}
        </button>
        {open && (
          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg p-2 w-48 z-50">
            <p className="text-xs text-gray-400 px-2 py-1 truncate">{user.email}</p>
            {isAdmin && <p className="text-xs text-blue-600 font-semibold px-2 py-1">Admin</p>}
            <hr className="my-1 border-gray-100" />
            {isAdmin && (
              <button
                onMouseDown={() => { setOpen(false); router.push('/admin') }}
                className="w-full text-left text-xs text-gray-700 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition">
                Admin Panel
              </button>
            )}
            <button
              onMouseDown={() => { setOpen(false); signOut() }}
              className="w-full text-left text-xs text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-lg transition">
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
