export default function LaptopJsonLd({ laptop, specs }: { laptop: any, specs: any[] }) {
  const getSpec = (label: string) => specs.find(s => s.label === label)?.value || null
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: laptop.name,
    brand: {
      '@type': 'Brand',
      name: laptop.brand,
    },
    description: `${laptop.name} full specifications and price in India. ${getSpec('Processor') ? `Powered by ${getSpec('Processor')}.` : ''} ${getSpec('RAM') ? `${getSpec('RAM')} RAM.` : ''} ${getSpec('Battery Life') ? `${getSpec('Battery Life')} battery life.` : ''}`.trim(),
    image: laptop.image_url || undefined,
    url: `https://avsurge.com/laptops/${laptop.slug}`,
    ...(laptop.price_inr && {
      offers: {
        '@type': 'Offer',
        price: laptop.price_inr,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `https://avsurge.com/laptops/${laptop.slug}`,
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
