export default function TabletJsonLd({ tablet, specs }: { tablet: any, specs: any[] }) {
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
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
