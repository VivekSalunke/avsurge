import type { Metadata } from 'next'
import BackToTop from '@/components/BackToTop'
import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'

const geist = Geist({ subsets: ['latin'] })

export const viewport = {
  themeColor: '#2563eb',
}

export const metadata: Metadata = {
  manifest: '/manifest.json',
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
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3714977957944203" crossOrigin="anonymous"></script>
      </head>
      <meta name="theme-color" content="#2563eb" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="AVSurge" />
      <link rel="apple-touch-icon" href="/icon-192.png" />
      <body className={`${geist.className} bg-[var(--bg)] text-[var(--text)]`}>
        <AuthProvider>
          <Navbar />
          {children}
        <BackToTop />
          <footer className="border-t border-[rgba(255,255,255,0.04)] bg-[var(--card-bg)] mt-16 py-8 neon-border">
            <div className="max-w-6xl mx-auto px-4 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-neon-cyan to-neon-violet rounded flex items-center justify-center text-black text-xs font-bold">AV</div>
                  <span className="text-sm font-semibold text-white">AVSurge</span>
                  <span className="text-xs text-[rgba(255,255,255,0.65)]">Device specs & prices for India</span>
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-[rgba(255,255,255,0.65)]">
                  <Link href="/phones" className="hover:text-neon-cyan">Phones</Link>
                  <Link href="/tablets" className="hover:text-neon-cyan">Tablets</Link>
                  <Link href="/laptops" className="hover:text-neon-cyan">Laptops</Link>
                  <Link href="/search" className="hover:text-neon-cyan">Search</Link>
                  <Link href="/brands" className="hover:text-neon-cyan">Brands</Link>
                  <Link href="/news" className="hover:text-neon-cyan">News</Link>
                  <Link href="/glossary" className="hover:text-neon-cyan">Glossary</Link>
                  <Link href="/site-map" className="hover:text-neon-cyan">Sitemap</Link>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-[rgba(255,255,255,0.65)] border-t border-[rgba(255,255,255,0.03)] pt-4">
                <Link href="/about" className="hover:text-neon-cyan">About</Link>
                <Link href="/contact" className="hover:text-neon-cyan">Contact</Link>
                <Link href="/privacy" className="hover:text-neon-cyan">Privacy Policy</Link>
                <Link href="/disclaimer" className="hover:text-neon-cyan">Disclaimer</Link>
                <Link href="/editorial-policy" className="hover:text-neon-cyan">Editorial Policy</Link>
                <Link href="/glossary" className="hover:text-neon-cyan">Glossary</Link>
                <Link href="/terms" className="hover:text-neon-cyan">Terms & Conditions</Link>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}
