import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'

const FROM_EMAIL = process.env.RESEND_ALERTS_FROM || 'AVSurge <alerts@avsurge.com>'
const SITE_URL = 'https://avsurge.com'
const NOTIFY_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000
// Resend's default limit is 2 requests/second
const SEND_DELAY_MS = 600

interface Category {
  key: 'phones' | 'tablets' | 'laptops'
  alertTable: string
  idColumn: string
  deviceTable: string
  label: string
}

const CATEGORIES: Category[] = [
  { key: 'phones', alertTable: 'price_alerts', idColumn: 'phone_id', deviceTable: 'phones', label: 'phone' },
  { key: 'tablets', alertTable: 'tablet_price_alerts', idColumn: 'tablet_id', deviceTable: 'tablets', label: 'tablet' },
  { key: 'laptops', alertTable: 'laptop_price_alerts', idColumn: 'laptop_id', deviceTable: 'laptops', label: 'laptop' },
]

interface AlertRow {
  id: number
  email: string
  target_price: number
  last_notified_at: string | null
  [key: string]: unknown
}

interface Device {
  id: number
  name: string
  slug: string
  price_inr: number | null
  image_url: string | null
}

interface CategoryResult {
  checked: number
  sent: number
  failed: number
  error?: string
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

function buildEmail(device: Device, targetPrice: number, category: Category): string {
  const name = escapeHtml(device.name)
  const url = `${SITE_URL}/${category.key}/${encodeURIComponent(device.slug)}`
  const image = device.image_url
    ? `<img src="${escapeHtml(device.image_url)}" alt="${name}" style="height:120px;object-fit:contain;display:block;margin:0 auto 12px;" />`
    : ''
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <div style="background:#2563eb;padding:24px;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:20px;">📉 Price Drop Alert</h1>
      </div>
      <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
        <p style="color:#374151;margin-top:0;">Good news! The price of <strong>${name}</strong> has dropped to your target.</p>
        <div style="background:white;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin:16px 0;">
          ${image}
          <p style="margin:0 0 4px;font-weight:bold;color:#111827;">${name}</p>
          <p style="margin:0;color:#2563eb;font-size:20px;font-weight:bold;">${inr(device.price_inr!)}</p>
          <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Your target: ${inr(targetPrice)}</p>
        </div>
        <a href="${url}"
          style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          View ${category.label} →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
          You're receiving this because you set a price alert on AVSurge.<br/>
          <a href="${SITE_URL}" style="color:#9ca3af;">avsurge.com</a>
        </p>
      </div>
    </div>
  `
}

async function processCategory(category: Category): Promise<CategoryResult> {
  const result: CategoryResult = { checked: 0, sent: 0, failed: 0 }

  const { data: alertData, error: alertError } = await supabase
    .from(category.alertTable)
    .select(`id, email, target_price, last_notified_at, ${category.idColumn}`)
    .eq('is_active', true)

  if (alertError) {
    console.error(`[alerts/check] ${category.key} alerts query failed:`, alertError.message)
    return { ...result, error: alertError.message }
  }

  const alerts = (alertData || []) as unknown as AlertRow[]
  result.checked = alerts.length
  if (alerts.length === 0) return result

  // Fetch the devices separately instead of using an embedded join,
  // so this works even where the alert table has no foreign key.
  const deviceIds = [...new Set(alerts.map(a => a[category.idColumn] as number))]
  const { data: deviceData, error: deviceError } = await supabase
    .from(category.deviceTable)
    .select('id, name, slug, price_inr, image_url')
    .in('id', deviceIds)

  if (deviceError) {
    console.error(`[alerts/check] ${category.key} devices query failed:`, deviceError.message)
    return { ...result, error: deviceError.message }
  }

  const devices = new Map((deviceData as Device[] || []).map(d => [d.id, d]))

  for (const alert of alerts) {
    const device = devices.get(alert[category.idColumn] as number)
    if (!device || !device.price_inr) continue
    if (device.price_inr > alert.target_price) continue
    if (alert.last_notified_at && Date.now() - new Date(alert.last_notified_at).getTime() < NOTIFY_COOLDOWN_MS) continue

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: alert.email,
        subject: `Price drop alert: ${device.name}`,
        html: buildEmail(device, alert.target_price, category),
      }),
    })

    if (res.ok) {
      const { error: updateError } = await supabase
        .from(category.alertTable)
        .update({ last_notified_at: new Date().toISOString() })
        .eq('id', alert.id)
      if (updateError) {
        console.error(`[alerts/check] ${category.key} alert ${alert.id} sent but last_notified_at update failed:`, updateError.message)
      }
      result.sent++
    } else {
      console.error(`[alerts/check] ${category.key} alert ${alert.id} send failed:`, res.status, await res.text())
      result.failed++
    }

    await sleep(SEND_DELAY_MS)
  }

  return result
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 503 })
  }

  const results: Record<string, CategoryResult> = {}
  for (const category of CATEGORIES) {
    results[category.key] = await processCategory(category)
  }

  const totalSent = Object.values(results).reduce((sum, r) => sum + r.sent, 0)
  const hasErrors = Object.values(results).some(r => r.error || r.failed > 0)

  return NextResponse.json({
    success: !hasErrors,
    sent: totalSent,
    results,
    timestamp: new Date().toISOString(),
  })
}
