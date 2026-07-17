import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Secure with a secret token
  const token = req.nextUrl.searchParams.get('token')
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all active alerts
  const { data: alerts } = await supabase
    .from('price_alerts')
    .select('*, phones(id, name, slug, price_inr, image_url)')
    .eq('is_active', true)

  if (!alerts || alerts.length === 0) {
    return NextResponse.json({ message: 'No active alerts' })
  }

  let sent = 0

  for (const alert of alerts) {
    const phone = alert.phones as any
    if (!phone || !phone.price_inr) continue

    // Check if current price is at or below target
    if (phone.price_inr <= alert.target_price) {
      // Send email via Resend
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AVSurge <avector134@gmail.com>',
          to: alert.email,
          subject: `Price drop alert: ${phone.name}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
              <div style="background:#2563eb;padding:24px;border-radius:12px 12px 0 0;">
                <h1 style="color:white;margin:0;font-size:20px;">📉 Price Drop Alert</h1>
              </div>
              <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
                <p style="color:#374151;margin-top:0;">Good news! The price of <strong>${phone.name}</strong> has dropped to your target.</p>
                <div style="background:white;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin:16px 0;">
                  ${phone.image_url ? `<img src="${phone.image_url}" alt="${phone.name}" style="height:120px;object-fit:contain;display:block;margin:0 auto 12px;" />` : ''}
                  <p style="margin:0 0 4px;font-weight:bold;color:#111827;">${phone.name}</p>
                  <p style="margin:0;color:#2563eb;font-size:20px;font-weight:bold;">Rs.${phone.price_inr.toLocaleString('en-IN')}</p>
                  <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Your target: Rs.${alert.target_price.toLocaleString('en-IN')}</p>
                </div>
                <a href="https://avsurge.com/phones/${phone.slug}" 
                  style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
                  View phone →
                </a>
                <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
                  You're receiving this because you set a price alert on AVSurge.<br/>
                  <a href="https://avsurge.com" style="color:#9ca3af;">avsurge.com</a>
                </p>
              </div>
            </div>
          `,
        }),
      })

      if (res.ok) {
        // Update last_notified_at
        await supabase
          .from('price_alerts')
          .update({ last_notified_at: new Date().toISOString() })
          .eq('id', alert.id)
        sent++
      }
    }
  }

  return NextResponse.json({ message: `Checked ${alerts.length} alerts, sent ${sent} emails` })
}
