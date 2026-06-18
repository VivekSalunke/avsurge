export default function PhoneJsonLd({ phone, specs }: { phone: any, specs: any[] }) {
  const getSpec = (label: string) => specs.find(s => s.label === label)?.value || null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: phone.name,
    brand: {
      '@type': 'Brand',
      name: phone.brand,
    },
    description: `${phone.name} full specifications and price in India. ${getSpec('Chipset') ? `Powered by ${getSpec('Chipset')}.` : ''} ${getSpec('Main camera') ? `${getSpec('Main camera')} camera.` : ''} ${getSpec('Capacity') ? `${getSpec('Capacity')} battery.` : ''}`.trim(),
    image: phone.image_url || undefined,
    url: `https://avsurge.com/phones/${phone.slug}`,
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
