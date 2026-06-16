'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [status, setStatus] = useState<'idle'|'saving'|'success'|'error'>('idle')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.display_name || '')
    }
  }, [user])

  const handleSaveProfile = async () => {
    setStatus('saving'); setMessage('')
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName }
    })
    if (error) { setMessage(error.message); setStatus('error') }
    else { setMessage('Profile updated!'); setStatus('success') }
  }

  const handleChangePassword = async () => {
    if (!newPassword) { setMessage('Enter a new password'); setStatus('error'); return }
    if (newPassword.length < 6) { setMessage('Password must be at least 6 characters'); setStatus('error'); return }
    setStatus('saving'); setMessage('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setMessage(error.message); setStatus('error') }
    else { setMessage('Password updated!'); setStatus('success'); setNewPassword(''); setCurrentPassword('') }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) {
      setMessage('Email does not match'); setStatus('error'); return
    }
    setStatus('saving')
    const { error } = await supabase.functions.invoke('delete-user')
    if (error) {
      // Fallback: just sign out if delete function not available
      await signOut()
      router.push('/')
    } else {
      await signOut()
      router.push('/')
    }
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h1>
      <p className="text-sm text-gray-400 mb-8">Manage your AVSurge account</p>

      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm mb-6 border ${status === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Account info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Account info</h2>
        <div className="flex items-center gap-4 mb-6">
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
          <button
            onClick={handleSaveProfile}
            disabled={status === 'saving'}
            className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            Save profile
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Change password</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">New password</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="••••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={status === 'saving'}
            className="w-full bg-gray-900 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50">
            Update password
          </button>
        </div>
      </div>

      {/* Sign out */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Session</h2>
        <button
          onClick={() => { signOut(); router.push('/') }}
          className="w-full border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition">
          Sign out
        </button>
      </div>

      {/* Delete account */}
      <div className="bg-white border border-red-200 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-1">Danger zone</h2>
        <p className="text-xs text-gray-400 mb-4">Deleting your account is permanent and cannot be undone.</p>
        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
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
              <button
                onClick={handleDeleteAccount}
                disabled={status === 'saving'}
                className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50">
                Confirm delete
              </button>
              <button
                onClick={() => { setShowDelete(false); setDeleteConfirm('') }}
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
