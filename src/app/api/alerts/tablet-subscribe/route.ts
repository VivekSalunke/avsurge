import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
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

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
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
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }
  const { email, tablet_id, target_price } = await req.json()
  if (!email || !tablet_id || !target_price) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const { data: existing } = await supabase
    .from('tablet_price_alerts')
    .select('id')
    .eq('email', email)
    .eq('tablet_id', tablet_id)
    .single()
  if (existing) {
    await supabase
      .from('tablet_price_alerts')
      .update({ target_price, is_active: true })
      .eq('id', existing.id)
    return NextResponse.json({ message: 'Alert updated' })
  }
  const { error } = await supabase
    .from('tablet_price_alerts')
    .insert({ email, tablet_id, target_price })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Alert created' })
}
