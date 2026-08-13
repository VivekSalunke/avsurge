import { supabase } from '@/lib/supabase'
import { computeSpecScore, parseSpecs } from '@/lib/specScore'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data: phones, error } = await supabase
    .from('phones')
    .select('id, name, price_inr')
    .not('price_inr', 'is', null)
    .order('price_inr', { ascending: true })

  if (error || !phones || phones.length === 0) {
    return NextResponse.json({ error: error?.message ?? 'no phones found' })
  }

  const cheapest = phones[0]
  const mid = phones[Math.floor(phones.length / 2)]
  const flagship = phones[phones.length - 1]

  const results = []
  for (const phone of [cheapest, mid, flagship]) {
    const { data: specs } = await supabase
      .from('phone_specs')
      .select('category, label, value')
      .eq('phone_id', phone.id)

    results.push({
      name: phone.name,
      price_inr: phone.price_inr,
      parsed: parseSpecs(specs || []),
      score: computeSpecScore(specs || []),
    })
  }

  return NextResponse.json({ results })
}
