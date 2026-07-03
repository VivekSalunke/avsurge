import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import Script from 'next/script'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AVSurge — Phone Specs, Reviews & Prices in India',
    template: '%s | AVSurge'
  },
  description: 'Compare specs, prices and reviews for phones, tablets and laptops in India. Find the best device for your budget with AVSurge.',
  keywords: ['phone specs', 'tablet specs', 'laptop specs', 'device comparison India', 'best phone India', 'best laptop India'],
  authors: [{ name: 'AVSurge' }],
  creator: 'AVSurge',
  publisher: 'AVSurge',
  metadataBase: new URL('https://avsurge.com'),
  alternates: { canonical: 'https://avsurge.com' },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://avsurge.com',
    siteName: 'AVSurge',
    title: 'AVSurge — Phone Specs, Reviews & Prices in India',
    description: 'Compare specs, prices and reviews for phones, tablets and laptops in India.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AVSurge' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AVSurge — Phone Specs & Reviews',
    description: 'Compare specs and prices for phones, tablets and laptops in India.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' }
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3714977957944203"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${geist.className} bg-gray-50 text-gray-900`}>
        <AuthProvider>
          <Navbar />
          {children}
          <footer className="border-t border-gray-200 bg-white mt-16 py-8">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">AV</div>
                <span className="text-sm font-semibold text-gray-700">AVSurge</span>
                <span className="text-xs text-gray-400">Phone specs & reviews for India</span>
              </div>
              <div className="flex gap-5 text-xs text-gray-400">
                <Link href="/phones" className="hover:text-blue-600">Phones</Link>
                <Link href="/tablets" className="hover:text-blue-600">Tablets</Link>
                <Link href="/laptops" className="hover:text-blue-600">Laptops</Link>
                <Link href="/search" className="hover:text-blue-600">Search</Link>
                <Link href="/brands" className="hover:text-blue-600">Brands</Link>
                <Link href="/news" className="hover:text-blue-600">News</Link>
                <Link href="/site-map" className="hover:text-blue-600">Sitemap</Link>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
