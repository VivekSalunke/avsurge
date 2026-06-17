import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// Chipset tier scoring
const CHIPSET_TIERS: Record<string, number> = {
  'snapdragon 8 elite gen 2': 10, 'snapdragon 8 elite': 10,
  'snapdragon 8 gen 3': 9, 'dimensity 9400': 9,
  'snapdragon 8 gen 2': 8, 'dimensity 9300': 8, 'apple a18 pro': 9, 'apple a18': 8,
  'snapdragon 8 gen 1': 7, 'dimensity 9000': 7, 'apple a17 pro': 8, 'apple a16 bionic': 7,
  'snapdragon 8s gen 3': 7, 'snapdragon 8+ gen 1': 7,
  'snapdragon 7+ gen 3': 6, 'snapdragon 7 gen 3': 6, 'dimensity 7200': 6,
  'snapdragon 7s gen 2': 5, 'dimensity 7050': 5, 'exynos 1380': 5,
  'snapdragon 7 gen 1': 5, 'dimensity 8300 ultra': 6,
  'snapdragon 695': 4, 'dimensity 6100+': 3, 'helio g99': 4,
}

function getChipsetTier(chipset: string): number {
  const normalized = chipset.toLowerCase()
  for (const [key, tier] of Object.entries(CHIPSET_TIERS)) {
    if (normalized.includes(key)) return tier
  }
  return 5 // default mid
}

function getCategory(price: number): string {
  if (price < 15000) return 'budget'
  if (price < 30000) return 'mid'
  if (price < 60000) return 'upper-mid'
  if (price < 100000) return 'premium'
  return 'flagship'
}

function scorePhones(
  target: any,
  targetSpecs: any[],
  candidate: any,
  candidateSpecs: any[],
  viewCount: number
): number {
  let score = 0

  // 1. Category match (budget/mid/flagship) — 30 points
  const targetCat = getCategory(target.price_inr || 0)
  const candidateCat = getCategory(candidate.price_inr || 0)
  if (targetCat === candidateCat) score += 30
  else if (Math.abs(['budget','mid','upper-mid','premium','flagship'].indexOf(targetCat) -
    ['budget','mid','upper-mid','premium','flagship'].indexOf(candidateCat)) === 1) score += 15

  // 2. Price similarity — up to 20 points
  if (target.price_inr && candidate.price_inr) {
    const priceDiff = Math.abs(target.price_inr - candidate.price_inr) / target.price_inr
    score += Math.max(0, 20 - priceDiff * 100)
  }

  // 3. Chipset tier similarity — up to 20 points
  const targetChipset = targetSpecs.find(s => s.label === 'Chipset')?.value || ''
  const candidateChipset = candidateSpecs.find(s => s.label === 'Chipset')?.value || ''
  const tierDiff = Math.abs(getChipsetTier(targetChipset) - getChipsetTier(candidateChipset))
  score += Math.max(0, 20 - tierDiff * 5)

  // 4. RAM similarity — up to 10 points
  const targetRAM = parseInt(targetSpecs.find(s => s.label === 'RAM')?.value || '0')
  const candidateRAM = parseInt(candidateSpecs.find(s => s.label === 'RAM')?.value || '0')
  if (targetRAM && candidateRAM) {
    const ramDiff = Math.abs(targetRAM - candidateRAM)
    score += Math.max(0, 10 - ramDiff * 2)
  }

  // 5. Camera MP similarity — up to 10 points
  const targetCam = parseInt(targetSpecs.find(s => s.label === 'Main camera')?.value || '0')
  const candidateCam = parseInt(candidateSpecs.find(s => s.label === 'Main camera')?.value || '0')
  if (targetCam && candidateCam) {
    const camDiff = Math.abs(targetCam - candidateCam) / Math.max(targetCam, candidateCam)
    score += Math.max(0, 10 - camDiff * 20)
  }

  // 6. Same brand bonus — 5 points
  if (target.brand === candidate.brand) score += 5

  // 7. User behavior — view count bonus — up to 5 points
  score += Math.min(5, viewCount * 0.5)

  return score
}

export default async function RelatedPhones({ phoneId, brand, priceInr }: {
  phoneId: number
  brand: string
  priceInr: number | null
}) {
  // Get target phone specs
  const { data: targetSpecs } = await supabase
    .from('phone_specs')
    .select('*')
    .eq('phone_id', phoneId)

  // Get all other phones (limit to reasonable range for performance)
  const minPrice = priceInr ? Math.floor(priceInr * 0.4) : 0
  const maxPrice = priceInr ? Math.ceil(priceInr * 2.5) : 9999999

  const { data: candidates } = await supabase
    .from('phones')
    .select('*')
    .neq('id', phoneId)
    .gte('price_inr', minPrice)
    .lte('price_inr', maxPrice)
    .limit(30)

  if (!candidates || candidates.length === 0) return null

  // Get specs for all candidates
  const candidateIds = candidates.map(p => p.id)
  const { data: allSpecs } = await supabase
    .from('phone_specs')
    .select('*')
    .in('phone_id', candidateIds)

  // Get view counts from reviews as proxy for popularity
  const { data: reviewCounts } = await supabase
    .from('reviews')
    .select('phone_id')

  const viewMap: Record<number, number> = {}
  for (const r of reviewCounts || []) {
    viewMap[r.phone_id] = (viewMap[r.phone_id] || 0) + 1
  }

  // Score each candidate
  const scored = candidates.map(candidate => {
    const candidateSpecs = (allSpecs || []).filter(s => s.phone_id === candidate.id)
    const score = scorePhones(
      { price_inr: priceInr, brand },
      targetSpecs || [],
      candidate,
      candidateSpecs,
      viewMap[candidate.id] || 0
    )
    return { ...candidate, score }
  })

  // Sort by score and take top 4
  const related = scored.sort((a, b) => b.score - a.score).slice(0, 4)

  if (related.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">Similar phones</span>
        <span className="text-xs text-gray-400">Based on specs, price & popularity</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
        {related.map(phone => (
          <Link key={phone.id} href={`/phones/${phone.slug}`}
            className="p-4 text-center hover:bg-blue-50 transition group">
            <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-3 overflow-hidden">
              {phone.image_url
                ? <img src={phone.image_url} alt={phone.name} className="object-contain w-full h-full p-2" />
                : <span className="text-3xl">📱</span>}
            </div>
            <p className="text-xs text-gray-400 mb-0.5">{phone.brand}</p>
            <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2 leading-tight mb-1">{phone.name}</p>
            {phone.price_inr && (
              <p className="text-xs text-blue-600 font-medium">Rs.{phone.price_inr.toLocaleString('en-IN')}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
