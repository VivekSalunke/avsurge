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
    <main className="min-h-screen flex items-center justify-center bg-[var(--card-bg)] px-4 text-[var(--text)]">
      <div className="bg-[var(--panel)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 w-full max-w-sm shadow-sm neon-border">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-gradient-to-r from-neon-violet to-neon-cyan rounded-xl flex items-center justify-center text-black font-bold text-sm">AV</div>
          <span className="font-bold text-white">AVSurge</span>
        </Link>

        <h1 className="text-xl font-bold text-white mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-sm text-[rgba(255,255,255,0.4)] mb-6">
          {mode === 'login' ? 'Sign in to your AVSurge account' : 'Join AVSurge today'}
        </p>

        {status === 'error' && (
          <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)] text-red-400 text-xs rounded-xl px-3 py-2 mb-4">{message}</div>
        )}
        {status === 'success' && (
          <div className="bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.2)] text-neon-cyan text-xs rounded-xl px-3 py-2 mb-4">{message}</div>
        )}

        <div className="flex flex-col gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-dim mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan"
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
          className="w-full bg-gradient-to-r from-neon-violet to-neon-cyan text-black rounded-xl py-2.5 text-sm font-semibold hover:brightness-110 transition disabled:opacity-50 mb-4">
          {status === 'loading' ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p className="text-xs text-center text-[rgba(255,255,255,0.4)]">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={handleModeSwitch} className="text-neon-cyan font-medium hover:underline">
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  )
}
