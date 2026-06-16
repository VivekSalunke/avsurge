'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (!loading && user && !isAdmin) router.push('/')
  }, [user, isAdmin, loading])

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Panel</h1>
      <p className="text-sm text-gray-400 mb-8">Manage AVSurge content</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/add-phone"
          className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-sm transition group">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4">📱</div>
          <h2 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600">Add Phone</h2>
          <p className="text-xs text-gray-400">Add a new phone with full specs to the database</p>
        </Link>

        <Link href="/admin/phones"
          className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-sm transition group">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-2xl mb-4">📋</div>
          <h2 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600">Manage Phones</h2>
          <p className="text-xs text-gray-400">Edit or delete existing phones in the database</p>
        </Link>

        <Link href="/admin/bulk"
          className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-sm transition group">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-4">⚡</div>
          <h2 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600">Bulk Import</h2>
          <p className="text-xs text-gray-400">Import multiple phones at once via JSON</p>
        </Link>
      </div>
    </main>
  )
}
