import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

function similarity(a: string, b: string): number {
  a = a.toLowerCase().trim()
  b = b.toLowerCase().trim()
  if (a === b) return 1
  const longer = a.length > b.length ? a : b
  const shorter = a.length > b.length ? b : a
  if (longer.length === 0) return 1
  let matches = 0
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++
  }
  return matches / longer.length
}

export async function POST(req: NextRequest) {
  const { tablets } = await req.json()
  if (!tablets || !Array.isArray(tablets)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const { data: existingTablets } = await supabase.from('tablets').select('id, name, slug')
  const existing = existingTablets || []

  let imported = 0
  let duplicates = 0
  const duplicateNames: string[] = []
  const errors: string[] = []

  for (const tablet of tablets) {
    // Exact slug match
    const exactSlug = existing.find(e => e.slug === tablet.slug)
    if (exactSlug) {
      duplicates++
      duplicateNames.push(`Exact "${tablet.name}" → "${exactSlug.name}"`)
      continue
    }

    // Fuzzy name match (>90% similarity)
    const fuzzyMatch = existing.find(e => {
      const sim = similarity(e.name, tablet.name)
      const lenDiff = Math.abs(e.name.length - tablet.name.length) / Math.max(e.name.length, tablet.name.length)
      return sim > 0.9 && lenDiff < 0.1
    })
    if (fuzzyMatch) {
      duplicates++
      duplicateNames.push(`Similar "${tablet.name}" → "${fuzzyMatch.name}"`)
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

    if (error || !newTablet) {
      errors.push(tablet.name)
      continue
    }

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

    // Add to existing list so subsequent tablets in same batch are also checked
    existing.push({ id: newTablet.id, name: newTablet.name, slug: newTablet.slug })
    imported++
  }

  return NextResponse.json({ imported, duplicates, duplicateNames, errors })
}
