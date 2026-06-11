import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const { data } = await supabase
    .from('phones')
    .select('id, name, brand, slug, price_inr, image_url')
    .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
    .limit(6)

  return NextResponse.json(data || [])
}
