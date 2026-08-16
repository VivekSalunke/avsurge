import type { Metadata } from 'next'
import Link from 'next/link'
import AILogo from '@/components/AILogo'

export const metadata: Metadata = {
  title: 'About AVSurge | India\'s Device Comparison Platform',
  description: 'AVSurge is India\'s comprehensive device comparison platform for phones, tablets and laptops. Compare specs, prices and find the best device for your budget.',
  alternates: { canonical: 'https://avsurge.com/about' },
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AVSurge',
  url: 'https://avsurge.com',
  logo: 'https://avsurge.com/favicon.svg',
  email: 'contact@avsurge.com',
  description: 'India\'s device comparison platform for phones, tablets and laptops.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
  sameAs: [
    'https://avsurge.com',
  ],
}

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-[var(--text)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      <div className="text-sm text-[rgba(255,255,255,0.4)] mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neon-cyan">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-[rgba(255,255,255,0.65)]">About</span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">About AVSurge</h1>
      <p className="text-[rgba(255,255,255,0.4)] text-sm mb-10">India&apos;s device comparison platform</p>

      {/* Stats band */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { value: '330+', label: 'Devices' },
          { value: '12+', label: 'Brands' },
          { value: '20+', label: 'Buying guides' },
          { value: '₹', label: 'Price tracking' },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] p-5 text-center card-hover">
            <div className="bg-gradient-to-r from-white to-[rgba(255,255,255,0.6)] bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
              {stat.value}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-dim">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-bold text-white mb-3">What is AVSurge?</h2>
          <p className="text-[rgba(255,255,255,0.65)] leading-relaxed">
            AVSurge is India&apos;s comprehensive device comparison and discovery platform. We help Indian consumers make informed decisions when buying smartphones, tablets and laptops by providing detailed specifications, price comparisons, user reviews and AI-powered recommendations — all in one place, for free.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Our Mission</h2>
          <p className="text-[rgba(255,255,255,0.65)] leading-relaxed">
            We believe every Indian consumer deserves access to accurate, unbiased device information. Our mission is to simplify the device buying process by providing all the information you need in one place — from detailed specs to price history to AI recommendations — so you can buy with confidence, not guesswork.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Why we started AVSurge</h2>
          <p className="text-[rgba(255,255,255,0.65)] leading-relaxed mb-3">
            Buying a phone, tablet or laptop in India usually means jumping between manufacturer sites, retailer listings, YouTube reviews and forum threads — and prices change almost weekly. AVSurge was built to end that chaos. We track specifications and prices in one structured database, so you can compare any two devices side by side in seconds and see the real price history before you buy.
          </p>
          <p className="text-[rgba(255,255,255,0.65)] leading-relaxed">
            We started small — manually cataloguing the phones that matter most to Indian buyers — and have grown into a database of hundreds of devices across phones, tablets and laptops, with tools like price alerts, an AI recommender and detailed buyer guides.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Our Values</h2>
          <div className="space-y-3">
            {[
              { icon: '🎯', title: 'Accuracy first', desc: 'Specs are sourced from official manufacturer data, never rumours or unverified leaks.' },
              { icon: '⚖️', title: 'Editorial independence', desc: 'Affiliate links and ads never influence rankings, comparisons or recommendations.' },
              { icon: '🔍', title: 'Transparency', desc: 'We show our sources, disclose affiliate links, and correct errors quickly when reported.' },
              { icon: '💸', title: 'Free for everyone', desc: 'AVSurge is free to use — no paywalls, no login required to browse or compare.' },
            ].map(item => (
              <div key={item.title} className="flex gap-3 p-4 bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-xl">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-white text-sm">{item.title}</p>
                  <p className="text-xs text-[rgba(255,255,255,0.4)] mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">What We Offer</h2>
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
              <div key={item.title} className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 flex gap-3">
                {item.title === 'AI Recommender' ? <AILogo size="sm" /> : <span className="text-2xl">{item.icon}</span>}
                <div>
                  <p className="font-semibold text-white text-sm">{item.title}</p>
                  <p className="text-xs text-[rgba(255,255,255,0.4)] mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">How We Make Money</h2>
          <p className="text-[rgba(255,255,255,0.65)] leading-relaxed">
            AVSurge is free to use. We earn revenue through affiliate commissions when you purchase a device through our Amazon links, and through display advertising. These commercial relationships do not influence our device data or comparisons — all specs and prices are independently sourced and verified. Read our <Link href="/editorial-policy" className="text-neon-cyan hover:underline">Editorial Policy</Link> for the full breakdown.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Contact Us</h2>
          <p className="text-[rgba(255,255,255,0.65)] leading-relaxed mb-4">
            Have feedback, suggestions or want to report incorrect data? We&apos;d love to hear from you.
          </p>
          <div className="bg-[var(--panel)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 text-sm text-[rgba(255,255,255,0.65)] neon-border">
            <p><strong>AVSurge</strong></p>
            <p>Website: <a href="https://avsurge.com" className="text-neon-cyan hover:underline">avsurge.com</a></p>
            <p>Email: <a href="mailto:contact@avsurge.com" className="text-neon-cyan hover:underline">contact@avsurge.com</a></p>
            <p className="mt-2 text-xs text-[rgba(255,255,255,0.4)]">Based in India 🇮🇳</p>
          </div>
        </section>

        <section className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 neon-border">
          <h2 className="text-base font-bold text-white mb-2">Start Exploring</h2>
          <p className="text-sm text-[rgba(255,255,255,0.65)] mb-4">Find your perfect device today.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/phones" className="bg-gradient-to-r from-neon-violet to-neon-cyan text-black px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition">Browse Phones</Link>
            <Link href="/tablets" className="border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.85)] px-4 py-2 rounded-xl text-sm font-semibold hover:border-neon-violet hover:text-white hover:glow transition">Browse Tablets</Link>
            <Link href="/laptops" className="border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.85)] px-4 py-2 rounded-xl text-sm font-semibold hover:border-neon-violet hover:text-white hover:glow transition">Browse Laptops</Link>
            <Link href="/ai-recommend" className="inline-flex items-center gap-2 border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-neon-violet px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[rgba(139,92,246,0.06)] hover:text-white transition"><AILogo size="xs" /> AI Recommender</Link>
          </div>
        </section>
      </div>
    </main>
  )
}
