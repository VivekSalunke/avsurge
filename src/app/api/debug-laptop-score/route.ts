import '@/lib/force-ipv4'
import { supabase } from '@/lib/supabase'
import { parseLaptopSpecs, computeLaptopSpecScore } from '@/lib/laptopSpecScore'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data: laptops, error } = await supabase
    .from('laptops')
    .select('id, name, price_inr')
    .not('price_inr', 'is', null)
    .order('price_inr', { ascending: true })

  if (error || !laptops || laptops.length === 0) {
    return NextResponse.json({ error: error?.message ?? 'no laptops found' })
  }

  const cheapest = laptops[0]
  const mid = laptops[Math.floor(laptops.length / 2)]
  const flagship = laptops[laptops.length - 1]

  const results = []
  for (const laptop of [cheapest, mid, flagship]) {
    const { data: specs } = await supabase
      .from('laptop_specs')
      .select('category, label, value')
      .eq('laptop_id', laptop.id)

    results.push({
      name: laptop.name,
      price_inr: laptop.price_inr,
      parsed: parseLaptopSpecs(specs || []),
      score: computeLaptopSpecScore(specs || []),
    })
  }

  return NextResponse.json({ results })
}
