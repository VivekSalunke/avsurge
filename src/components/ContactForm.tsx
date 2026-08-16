'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Prepare mailto link
    const subject = encodeURIComponent(formData.subject || 'AVSurge Contact Form')
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    )
    window.location.href = `mailto:contact@avsurge.com?subject=${subject}&body=${body}`
    
    // Show success message
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 neon-border">
      <h2 className="text-base font-bold text-white mb-4">Send us a message</h2>
      
      {submitted && (
        <div className="mb-4 p-4 bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] rounded-xl text-sm text-green-400">
          ✅ Thank you! Your message has been sent. We'll get back to you soon.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[rgba(255,255,255,0.85)] mb-2">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
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
            className="w-full px-4 py-2.5 border border-[rgba(255,255,255,0.06)] rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-cyan text-white"
            placeholder="your@email.com"
          />
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
            className="w-full px-4 py-2.5 border border-[rgba(255,255,255,0.06)] rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-cyan text-white resize-none"
            placeholder="Tell us what you think..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-neon-violet to-neon-cyan text-black font-semibold py-2.5 rounded-lg transition"
        >
          Send Message
        </button>
      </form>

      <p className="text-xs text-dim mt-4">
        * Required fields. Your message will open your email client to send directly.
      </p>
    </div>
  )
}
