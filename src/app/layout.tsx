import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import { AuthProvider } from '@/context/AuthContext'
import NavAuth from '@/components/NavAuth'
import Script from 'next/script'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AVSurge — Phone Specs, Reviews & Prices in India',
    template: '%s | AVSurge'
  },
  description: 'Compare phone specifications, prices, and reviews for every smartphone in India. Find the best phone for your budget with AVSurge.',
  keywords: ['phone specs', 'mobile comparison', 'smartphone prices India', 'best phone India', 'phone finder'],
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
    description: 'Compare phone specifications, prices, and reviews for every smartphone in India.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AVSurge' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AVSurge — Phone Specs & Reviews',
    description: 'Compare phone specifications and prices for every smartphone in India.',
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
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">AV</div>
                  <span className="font-bold text-gray-900 text-lg">AVSurge</span>
                </Link>
                <div className="hidden md:flex gap-5 text-sm text-gray-500">
                  <Link href="/phones" className="hover:text-blue-600 transition">Phones</Link>
                  <Link href="/compare" className="hover:text-blue-600 transition">Compare</Link>
                  <Link href="/finder" className="hover:text-blue-600 transition">Finder</Link>
                  <Link href="/news" className="hover:text-blue-600 transition">News</Link>
                  <Link href="/brands" className="hover:text-blue-600 transition">Brands</Link>
                  <Link href="/tablets" className="hover:text-blue-600 transition">Tablets</Link>
                  <Link href="/compare-tablets" className="hover:text-blue-600 transition">Compare Tablets</Link>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SearchBar />
                <NavAuth />
              </div>
            </div>
          </nav>
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
                <Link href="/compare" className="hover:text-blue-600">Compare</Link>
                <Link href="/finder" className="hover:text-blue-600">Finder</Link>
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
