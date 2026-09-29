interface PhoneLike {
  name: string
  brand: string
  slug: string
  image_url?: string | null
  price_inr?: number | null
}

interface SpecEntry {
  label: string
  value: string
}

interface ReviewEntry {
  rating: number
  body: string | null
  user_email: string | null
  created_at: string
}

export default function PhoneJsonLd({ phone, specs, reviews = [] }: { phone: PhoneLike, specs: SpecEntry[], reviews?: ReviewEntry[] }) {
  const getSpec = (label: string) => specs.find(s => s.label === label)?.value || null

  const reviewCount = reviews.length
  const averageRating = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: phone.name,
    brand: {
      '@type': 'Brand',
      name: phone.brand,
    },
    description: `${phone.name} full specifications and price in India. ${getSpec('Chipset') ? `Powered by ${getSpec('Chipset')}.` : ''} ${getSpec('Main camera') ? `${getSpec('Main camera')} camera.` : ''} ${getSpec('Capacity') ? `${getSpec('Capacity')} battery.` : ''}`.trim(),
    image: phone.image_url || 'https://avsurge.com/avsurge_logo.png',
    url: `https://avsurge.com/phones/${phone.slug}`,
    ...(averageRating !== null && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Math.round(averageRating * 10) / 10,
        reviewCount,
      },
      review: reviews.slice(0, 10).map(r => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
        },
        author: {
          '@type': 'Person',
          name: r.user_email ? r.user_email.split('@')[0] : 'Anonymous',
        },
        datePublished: r.created_at,
        ...(r.body && { reviewBody: r.body }),
      })),
    }),
    ...(phone.price_inr && {
      offers: {
        '@type': 'Offer',
        price: phone.price_inr,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `https://avsurge.com/phones/${phone.slug}`,
        seller: {
          '@type': 'Organization',
          name: 'AVSurge',
        },
      },
    }),
    additionalProperty: specs.map(s => ({
      '@type': 'PropertyValue',
      name: s.label,
      value: s.value,
    })),
  }


  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avsurge.com' },
      { '@type': 'ListItem', position: 2, name: 'Phones', item: `https://avsurge.com/phones` },
      { '@type': 'ListItem', position: 3, name: phone.name, item: `https://avsurge.com/phones/${phone.slug}` },
    ],
  }
  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
    </>
  )
}
