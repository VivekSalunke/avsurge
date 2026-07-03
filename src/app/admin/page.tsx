'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminPage() {
  const { user, isAdmin, loading, profileLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) router.push('/login')
    else if (!isAdmin) router.push('/')
  }, [user, isAdmin, loading, profileLoading])

  if (loading || profileLoading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )
  if (!user || !isAdmin) return null

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Panel</h1>
      <p className="text-sm text-gray-400 mb-8">Manage AVSurge content</p>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">📱 Phones</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
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
          <h2 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600">Bulk Import Phones</h2>
          <p className="text-xs text-gray-400">Import multiple phones at once via JSON</p>
        </Link>
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">📟 Tablets</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/add-tablet"
          className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-sm transition group">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4">📟</div>
          <h2 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600">Add Tablet</h2>
          <p className="text-xs text-gray-400">Add a new tablet with full specs to the database</p>
        </Link>
        <Link href="/admin/tablets"
          className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-sm transition group">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-2xl mb-4">📋</div>
          <h2 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600">Manage Tablets</h2>
          <p className="text-xs text-gray-400">Edit or delete existing tablets in the database</p>
        </Link>
        <Link href="/admin/import-tablets"
          className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-sm transition group">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-4">⚡</div>
          <h2 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600">Bulk Import Tablets</h2>
          <p className="text-xs text-gray-400">Import multiple tablets at once via JSON</p>
        </Link>
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">🖼️ Images</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link href="/admin/images"
          className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group">
          <h2 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600">Image Manager</h2>
          <p className="text-xs text-gray-400">Add or update images for phones, tablets and laptops</p>
        </Link>
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">🏷️ Brands</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link href="/admin/brands"
          className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group">
          <h2 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600">Manage Brand Logos</h2>
          <p className="text-xs text-gray-400">Add or edit brand logos for the brands page</p>
        </Link>
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">💻 Laptops</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link href="/admin/laptops"
          className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group">
          <h2 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600">Manage Laptops</h2>
          <p className="text-xs text-gray-400">Add or delete laptops in the database</p>
        </Link>
        <Link href="/admin/laptops/bulk-import"
          className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition group">
          <h2 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600">Bulk Import Laptops</h2>
          <p className="text-xs text-gray-400">Import multiple laptops at once</p>
        </Link>
      </div>
    </main>
  )
}
