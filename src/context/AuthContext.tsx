'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  loading: boolean
  profileLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ user: null, isAdmin: false, loading: true, profileLoading: true, signOut: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true)
    const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()
    setIsAdmin(data?.is_admin ?? false)
    setProfileLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfileLoading(false)
      }
      setLoading(false)
    })

    let knownUserId: string | null = null

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Only re-fetch (and thus re-trigger profileLoading) when the signed-in user actually
        // changes. Supabase fires this event on token refresh too (e.g. on tab focus), which
        // would otherwise flip profileLoading -> true repeatedly and unmount pages that gate
        // on it, wiping their local state (open edit forms, etc.) for no real reason.
        if (session.user.id !== knownUserId) {
          knownUserId = session.user.id
          fetchProfile(session.user.id)
        }
      } else {
        knownUserId = null
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, profileLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
