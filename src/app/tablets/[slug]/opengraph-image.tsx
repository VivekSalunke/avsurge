import { supabase } from '@/lib/supabase'
import { getFinalSpecScore } from '@/lib/specScore'
import { renderDeviceOgImage, OG_SIZE } from '@/lib/ogImage'

export const alt = 'Tablet specs and price in India on AVSurge'
export const size = OG_SIZE
export const contentType = 'image/png'
export const revalidate = 3600

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: tablet } = await supabase
    .from('tablets')
    .select('id, name, brand, price_inr, image_url, spec_score_override')
    .eq('slug', slug)
    .single()

  if (!tablet) {
    return new Response('Not found', { status: 404 })
  }

  const { data: specs } = await supabase
    .from('tablet_specs')
    .select('category, label, value')
    .eq('tablet_id', tablet.id)

  return renderDeviceOgImage({
    name: tablet.name,
    brand: tablet.brand,
    priceInr: tablet.price_inr,
    score: getFinalSpecScore(specs || [], tablet.spec_score_override),
    imageUrl: tablet.image_url,
    category: 'Tablet',
  })
}
