import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About AVSurge | India\'s Device Comparison Platform',
  description: 'AVSurge is India\'s comprehensive device comparison platform for phones, tablets and laptops. Compare specs, prices and find the best device for your budget.',
  alternates: { canonical: 'https://avsurge.com/about' },
}

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">About</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">About AVSurge</h1>
      <p className="text-gray-400 text-sm mb-10">India's device comparison platform</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">What is AVSurge?</h2>
          <p className="text-gray-600 leading-relaxed">
            AVSurge is India's comprehensive device comparison and discovery platform. We help Indian consumers make informed decisions when buying smartphones, tablets and laptops by providing detailed specifications, price comparisons, user reviews and AI-powered recommendations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            We believe every Indian consumer deserves access to accurate, unbiased device information. Our mission is to simplify the device buying process by providing all the information you need in one place — from detailed specs to price history to AI recommendations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '📱', title: '250+ Phones', desc: 'Comprehensive database of smartphones available in India' },
              { icon: '📟', title: '60+ Tablets', desc: 'All major tablets with full specifications and prices' },
              { icon: '💻', title: '40+ Laptops', desc: 'Laptops from all major brands with detailed specs' },
              { icon: '⚖️', title: 'Compare Tools', desc: 'Side by side comparison for phones, tablets and laptops' },
              { icon: '🤖', title: 'AI Recommender', desc: 'Get personalized device recommendations using AI' },
              { icon: '🔔', title: 'Price Alerts', desc: 'Get notified when a device drops to your target price' },
              { icon: '📊', title: 'Price History', desc: 'Track price changes over time for any device' },
              { icon: '⭐', title: 'User Reviews', desc: 'Read and write reviews for any device' },
            ].map(item => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">How We Make Money</h2>
          <p className="text-gray-600 leading-relaxed">
            AVSurge is free to use. We earn revenue through affiliate commissions when you purchase a device through our Amazon links, and through display advertising. These commercial relationships do not influence our device data or comparisons — all specs and prices are independently sourced and verified.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Contact Us</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Have feedback, suggestions or want to report incorrect data? We'd love to hear from you.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p><strong>AVSurge</strong></p>
            <p>Website: <a href="https://avsurge.com" className="text-blue-600 hover:underline">avsurge.com</a></p>
            <p>Email: <a href="mailto:avector134@gmail.com" className="text-blue-600 hover:underline">avector134@gmail.com</a></p>
            <p className="mt-2 text-xs text-gray-400">Based in India 🇮🇳</p>
          </div>
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">Start Exploring</h2>
          <p className="text-sm text-gray-600 mb-4">Find your perfect device today.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/phones" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">Browse Phones</Link>
            <Link href="/tablets" className="bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition">Browse Tablets</Link>
            <Link href="/laptops" className="bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition">Browse Laptops</Link>
            <Link href="/ai-recommend" className="bg-white text-purple-600 border border-purple-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-50 transition">🤖 AI Recommender</Link>
          </div>
        </section>
      </div>
    </main>
  )
}
