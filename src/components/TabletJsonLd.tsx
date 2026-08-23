interface TabletLike {
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

export default function TabletJsonLd({ tablet, specs }: { tablet: TabletLike, specs: SpecEntry[] }) {
  const getSpec = (label: string) => specs.find(s => s.label === label)?.value || null
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tablet.name,
    brand: {
      '@type': 'Brand',
      name: tablet.brand,
    },
    description: `${tablet.name} full specifications and price in India. ${getSpec('Chipset') ? `Powered by ${getSpec('Chipset')}.` : ''} ${getSpec('Display') ? `${getSpec('Display')} display.` : ''} ${getSpec('Capacity') ? `${getSpec('Capacity')} battery.` : ''}`.trim(),
    image: tablet.image_url || undefined,
    url: `https://avsurge.com/tablets/${tablet.slug}`,
    ...(tablet.price_inr && {
      offers: {
        '@type': 'Offer',
        price: tablet.price_inr,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `https://avsurge.com/tablets/${tablet.slug}`,
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
      { '@type': 'ListItem', position: 2, name: 'Tablets', item: `https://avsurge.com/tablets` },
      { '@type': 'ListItem', position: 3, name: tablet.name, item: `https://avsurge.com/tablets/${tablet.slug}` },
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
