import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`alerts-laptop-subscribe:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }
  const { email, laptop_id, target_price } = await req.json()
  if (!email || !laptop_id || !target_price) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const { data: existing } = await supabase
    .from('laptop_price_alerts')
    .select('id')
    .eq('email', email)
    .eq('laptop_id', laptop_id)
    .single()
  if (existing) {
    await supabase
      .from('laptop_price_alerts')
      .update({ target_price, is_active: true })
      .eq('id', existing.id)
    return NextResponse.json({ message: 'Alert updated' })
  }
  const { error } = await supabase
    .from('laptop_price_alerts')
    .insert({ email, laptop_id, target_price })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Alert created' })
}
