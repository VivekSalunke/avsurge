'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import HCaptcha from '@hcaptcha/react-hcaptcha'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [message, setMessage] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const captchaRef = useRef<HCaptcha>(null)

  const handleSubmit = async () => {
    if (!email || !password) { setMessage('Email and password required'); setStatus('error'); return }
    if (!captchaToken) { setMessage('Please complete the security check'); setStatus('error'); return }
    setStatus('loading'); setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken }
      })
      if (error) { setMessage(error.message); setStatus('error'); captchaRef.current?.resetCaptcha() }
      else router.push('/')
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { captchaToken }
      })
      if (error) { setMessage(error.message); setStatus('error'); captchaRef.current?.resetCaptcha() }
      else { setMessage('Check your email for a confirmation link!'); setStatus('success') }
    }
  }

  const handleModeSwitch = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setMessage('')
    setStatus('idle')
    setCaptchaToken('')
    captchaRef.current?.resetCaptcha()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">AV</div>
          <span className="font-bold text-gray-900">AVSurge</span>
        </Link>

        <h1 className="text-xl font-bold text-gray-900 mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          {mode === 'login' ? 'Sign in to your AVSurge account' : 'Join AVSurge today'}
        </p>

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2 mb-4">{message}</div>
        )}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-xs rounded-xl px-3 py-2 mb-4">{message}</div>
        )}

        <div className="flex flex-col gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        <div className="mb-4 flex justify-center">
          <HCaptcha
            ref={captchaRef}
            sitekey="e132f9ca-dae8-4486-920e-96d2e9e6b00e"
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken('')}
            onError={() => { setCaptchaToken(''); setMessage('Security check failed, please try again'); setStatus('error') }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={status === 'loading' || !captchaToken}
          className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 mb-4">
          {status === 'loading' ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p className="text-xs text-center text-gray-400">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={handleModeSwitch} className="text-blue-600 font-medium hover:underline">
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  )
}
