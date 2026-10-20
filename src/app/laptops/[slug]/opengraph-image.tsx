import { supabase } from '@/lib/supabase'
import { getFinalLaptopSpecScore } from '@/lib/laptopSpecScore'
import { renderDeviceOgImage, OG_SIZE } from '@/lib/ogImage'

export const alt = 'Laptop specs and price in India on AVSurge'
export const size = OG_SIZE
export const contentType = 'image/png'
export const revalidate = 3600

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: laptop } = await supabase
    .from('laptops')
    .select('id, name, brand, price_inr, image_url, spec_score_override')
    .eq('slug', slug)
    .single()

  if (!laptop) {
    return new Response('Not found', { status: 404 })
  }

  const { data: specs } = await supabase
    .from('laptop_specs')
    .select('category, label, value')
    .eq('laptop_id', laptop.id)

  return renderDeviceOgImage({
    name: laptop.name,
    brand: laptop.brand,
    priceInr: laptop.price_inr,
    score: getFinalLaptopSpecScore(specs || [], laptop.spec_score_override),
    imageUrl: laptop.image_url,
    category: 'Laptop',
  })
}
