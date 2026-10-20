import { supabase } from '@/lib/supabase'
import { getFinalSpecScore } from '@/lib/specScore'
import { renderDeviceOgImage, OG_SIZE } from '@/lib/ogImage'

export const alt = 'Phone specs and price in India on AVSurge'
export const size = OG_SIZE
export const contentType = 'image/png'
export const revalidate = 3600

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: phone } = await supabase
    .from('phones')
    .select('id, name, brand, price_inr, image_url, spec_score_override')
    .eq('slug', slug)
    .single()

  if (!phone) {
    return new Response('Not found', { status: 404 })
  }

  const { data: specs } = await supabase
    .from('phone_specs')
    .select('category, label, value')
    .eq('phone_id', phone.id)

  return renderDeviceOgImage({
    name: phone.name,
    brand: phone.brand,
    priceInr: phone.price_inr,
    score: getFinalSpecScore(specs || [], phone.spec_score_override),
    imageUrl: phone.image_url,
    category: 'Phone',
  })
}
