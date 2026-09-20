import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [{ data: phones }, { data: tablets }, { data: laptops }] = await Promise.all([
    supabase.from('phones').select('id, price_inr').not('price_inr', 'is', null),
    supabase.from('tablets').select('id, price_inr').not('price_inr', 'is', null),
    supabase.from('laptops').select('id, price_inr').not('price_inr', 'is', null),
  ])

  let count = 0
  const errors: Record<string, string> = {}

  if (phones && phones.length > 0) {
    const { error } = await supabase.from('price_history').insert(
      phones.map(p => ({ phone_id: p.id, price_inr: p.price_inr, store: 'India' }))
    )
    if (!error) count += phones.length
    else { console.error('[cron/price-history] phones insert failed:', error.message); errors.phones = error.message }
  }

  if (tablets && tablets.length > 0) {
    const { error } = await supabase.from('tablet_price_history').insert(
      tablets.map(t => ({ tablet_id: t.id, price_inr: t.price_inr, store: 'India' }))
    )
    if (!error) count += tablets.length
    else { console.error('[cron/price-history] tablets insert failed:', error.message); errors.tablets = error.message }
  }

  if (laptops && laptops.length > 0) {
    const { error } = await supabase.from('laptop_price_history').insert(
      laptops.map(l => ({ laptop_id: l.id, price_inr: l.price_inr, store: 'India' }))
    )
    if (!error) count += laptops.length
    else { console.error('[cron/price-history] laptops insert failed:', error.message); errors.laptops = error.message }
  }

  return NextResponse.json({
    success: Object.keys(errors).length === 0,
    logged: count,
    ...(Object.keys(errors).length > 0 && { errors }),
    timestamp: new Date().toISOString(),
  })
}
