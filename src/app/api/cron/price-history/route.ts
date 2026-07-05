import { supabase } from '@/lib/supabase'
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

  if (phones && phones.length > 0) {
    const { error } = await supabase.from('price_history').insert(
      phones.map(p => ({ phone_id: p.id, price_inr: p.price_inr, store: 'India' }))
    )
    if (!error) count += phones.length
  }

  if (tablets && tablets.length > 0) {
    const { error } = await supabase.from('tablet_price_history').insert(
      tablets.map(t => ({ tablet_id: t.id, price_inr: t.price_inr, store: 'India' }))
    )
    if (!error) count += tablets.length
  }

  if (laptops && laptops.length > 0) {
    const { error } = await supabase.from('laptop_price_history').insert(
      laptops.map(l => ({ laptop_id: l.id, price_inr: l.price_inr, store: 'India' }))
    )
    if (!error) count += laptops.length
  }

  return NextResponse.json({ success: true, logged: count, timestamp: new Date().toISOString() })
}
