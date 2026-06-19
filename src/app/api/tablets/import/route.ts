import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { tablets } = await req.json()
  if (!tablets || !Array.isArray(tablets)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  let imported = 0
  let duplicates = 0
  const duplicateNames: string[] = []

  for (const tablet of tablets) {
    const { data: existing } = await supabase
      .from('tablets')
      .select('id, name')
      .eq('slug', tablet.slug)
      .single()

    if (existing) {
      duplicates++
      duplicateNames.push(existing.name)
      continue
    }

    const { data: newTablet, error } = await supabase
      .from('tablets')
      .insert({
        name: tablet.name,
        brand: tablet.brand,
        slug: tablet.slug,
        price_inr: tablet.price_inr,
        image_url: tablet.image_url,
        released_at: tablet.released_at,
      })
      .select()
      .single()

    if (error || !newTablet) continue

    if (tablet.specs && tablet.specs.length > 0) {
      await supabase.from('tablet_specs').insert(
        tablet.specs.map((s: any) => ({
          tablet_id: newTablet.id,
          category: s.category,
          label: s.label,
          value: s.value,
        }))
      )
    }

    imported++
  }

  return NextResponse.json({ imported, duplicates, duplicateNames })
}
