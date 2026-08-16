'use client'

import { useState, useRef } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const captchaRef = useRef<HCaptcha>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'loading') return

    setStatus('loading')
    setMessage('')

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, captchaToken }),
    })

    const data = await res.json().catch(() => ({}))

    if (res.ok) {
      setStatus('success')
      setMessage(data.message || 'Message sent successfully!')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setCaptchaToken('')
      captchaRef.current?.resetCaptcha()
    } else {
      setStatus('error')
      setMessage(data.error || 'Something went wrong. Please try again.')
      captchaRef.current?.resetCaptcha()
      setCaptchaToken('')
    }
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 neon-border">
      <h2 className="text-base font-bold text-white mb-4">Send us a message</h2>

      {status === 'success' && (
        <div className="mb-4 p-4 bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] rounded-xl text-sm text-green-400">
          ✅ {message}
        </div>
      )}
      {status === 'error' && (
        <div className="mb-4 p-4 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-xl text-sm text-red-400">
          ⚠️ {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.85)] mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-4 py-2.5 border border-[rgba(255,255,255,0.06)] rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-cyan text-white"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgba(255,255,255,0.85)] mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              maxLength={150}
              className="w-full px-4 py-2.5 border border-[rgba(255,255,255,0.06)] rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-cyan text-white"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgba(255,255,255,0.85)] mb-2">Subject *</label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-[rgba(255,255,255,0.06)] rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-cyan text-white"
          >
            <option value="">Select a subject...</option>
            <option value="Incorrect device data">Incorrect device data</option>
            <option value="Feature suggestion">Feature suggestion</option>
            <option value="Brand partnership">Brand partnership</option>
            <option value="Missing device">Missing device</option>
            <option value="AdSense / Advertising">AdSense / Advertising</option>
            <option value="Bug report">Bug report</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgba(255,255,255,0.85)] mb-2">Message *</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            maxLength={5000}
            className="w-full px-4 py-2.5 border border-[rgba(255,255,255,0.06)] rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-cyan text-white resize-none"
            placeholder="Tell us what you think..."
          />
        </div>

        {HCAPTCHA_SITE_KEY && (
          <HCaptcha
            ref={captchaRef}
            sitekey={HCAPTCHA_SITE_KEY}
            onVerify={token => setCaptchaToken(token)}
            theme="dark"
          />
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-gradient-to-r from-neon-violet to-neon-cyan text-black font-semibold py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      <p className="text-xs text-dim mt-4">
        * Required fields. We usually reply within 1–2 business days. Prefer email? Reach us directly at{' '}
        <a href="mailto:contact@avsurge.com" className="text-neon-cyan hover:underline">contact@avsurge.com</a>
      </p>
    </div>
  )
}
