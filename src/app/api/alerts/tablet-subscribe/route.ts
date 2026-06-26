import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
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
