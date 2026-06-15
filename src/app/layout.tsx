import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
const geist = Geist({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'AVSurge — Phone Specs & Reviews',
  description: 'Phone specifications, reviews, comparisons and prices for India',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 text-gray-900`}>
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
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SearchBar />
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
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
