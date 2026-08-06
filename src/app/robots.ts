import { MetadataRoute } from 'next'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/profile/', '/api/', '/login/', '/wishlist/'],
      },
    ],
    sitemap: 'https://avsurge.com/sitemap.xml',
  }
}
