import { NextRequest, NextResponse } from 'next/server'

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'contact@avsurge.com'
const FROM_EMAIL = process.env.RESEND_FROM || 'AVSurge <contact@avsurge.com>'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const maxRequests = 5
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= maxRequests) return false
  entry.count++
  return true
}

async function verifyCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  const res = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
  })
  const data = await res.json()
  return data.success === true
}

function buildContactHtml(name: string, email: string, subject: string, message: string) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
      <div style="background:#2563eb;padding:24px;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:18px;">📩 New contact query — ${subject}</h1>
      </div>
      <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
        <p style="color:#6b7280;margin:0 0 4px;font-size:13px;"><strong style="color:#111827;">Name:</strong> ${name}</p>
        <p style="color:#6b7280;margin:0 0 4px;font-size:13px;"><strong style="color:#111827;">Email:</strong> <a href="mailto:${email}" style="color:#2563eb;">${email}</a></p>
        <p style="color:#6b7280;margin:0 0 16px;font-size:13px;"><strong style="color:#111827;">Subject:</strong> ${subject}</p>
        <div style="background:white;border:1px solid #e5e7eb;border-radius:10px;padding:16px;color:#374151;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</div>
        <p style="color:#9ca3af;font-size:12px;margin-top:20px;">Sent from the AVSurge contact form — avsurge.com</p>
      </div>
    </div>
  `
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { name, email, subject, message, captchaToken } = body

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (name.trim().length > 100 || subject.trim().length > 150 || message.trim().length > 5000) {
    return NextResponse.json({ error: 'One or more fields are too long.' }, { status: 400 })
  }

  const valid = await verifyCaptcha(captchaToken || '')
  if (!valid) {
    return NextResponse.json({ error: 'Security check failed. Please try again.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Contact form is not configured yet. Please email us at contact@avsurge.com.', configNeeded: true }, { status: 503 })
  }

  const html = buildContactHtml(name.trim(), email.trim(), subject.trim(), message.trim())

  const results = await Promise.allSettled([
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: CONTACT_EMAIL,
        reply_to: email.trim(),
        subject: `[AVSurge Contact] ${subject.trim()}`,
        html,
      }),
    }),
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email.trim(),
        subject: `We received your message — AVSurge`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <div style="background:#2563eb;padding:24px;border-radius:12px 12px 0 0;">
              <h1 style="color:white;margin:0;font-size:18px;">Thanks for reaching out, ${name.trim()}!</h1>
            </div>
            <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
              <p style="color:#374151;margin-top:0;">We've received your message and usually reply within 1–2 business days.</p>
              <p style="color:#6b7280;font-size:13px;margin:0 0 16px;">Your query: <strong>${subject.trim()}</strong></p>
              <a href="https://avsurge.com" style="display:inline-block;background:#2563eb;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;">Visit AVSurge →</a>
            </div>
          </div>
        `,
      }),
    }),
  ])

  if (results[0].status !== 'fulfilled' || !results[0].value.ok) {
    return NextResponse.json({ error: 'Failed to send your message. Please try again or email us at contact@avsurge.com.' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Message sent successfully!' })
}
