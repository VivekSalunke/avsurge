import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const [{ data: phones }, { data: tablets }, { data: laptops }] = await Promise.all([
    supabase.from('phones').select('id, name, brand, slug, price_inr, image_url').or(`name.ilike.%${q}%,brand.ilike.%${q}%`).limit(4),
    supabase.from('tablets').select('id, name, brand, slug, price_inr, image_url').or(`name.ilike.%${q}%,brand.ilike.%${q}%`).limit(3),
    supabase.from('laptops').select('id, name, brand, slug, price_inr, image_url').or(`name.ilike.%${q}%,brand.ilike.%${q}%`).limit(3),
  ])

  const results = [
    ...(phones || []).map(p => ({ ...p, type: 'phone' })),
    ...(tablets || []).map(t => ({ ...t, type: 'tablet' })),
    ...(laptops || []).map(l => ({ ...l, type: 'laptop' })),
  ]

  return NextResponse.json(results)
}
