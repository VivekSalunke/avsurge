'use client'
import { useState } from 'react'

export default function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const text = `${title} — full specs and price in India`

    // Phones and most mobile browsers: open the system share sheet
    // (WhatsApp, Telegram, Instagram, etc.)
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url })
        return
      } catch (err) {
        // The user closed the share sheet: nothing to do
        if (err instanceof DOMException && err.name === 'AbortError') return
        // Any other failure falls through to copying the link
      }
    }

    // Desktop browsers without a share sheet: copy the link instead
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.85)] hover:border-neon-cyan hover:text-neon-cyan"
    >
      <span className="text-base">{copied ? '✅' : '🔗'}</span>
      {copied ? 'Link copied' : 'Share'}
    </button>
  )
}
