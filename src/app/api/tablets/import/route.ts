import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'

interface TabletSpecInput {
  category: string
  label: string
  value: string
}

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
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAuthed = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user } } = await supabaseAuthed.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { tablets } = await req.json()
  if (!tablets || !Array.isArray(tablets)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const { data: existingTablets } = await supabaseAdmin.from('tablets').select('id, name, slug')
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

    const { data: newTablet, error } = await supabaseAdmin
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
      await supabaseAdmin.from('tablet_specs').insert(
        tablet.specs.map((s: TabletSpecInput) => ({
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
