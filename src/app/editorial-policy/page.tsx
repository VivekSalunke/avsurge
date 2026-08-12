import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Editorial Policy | AVSurge',
  alternates: { canonical: 'https://avsurge.com/editorial-policy' },
  description: 'How AVSurge sources, verifies, and presents device specifications, pricing, and recommendations — and how we handle affiliate relationships and corrections.',
  robots: 'index, follow',
}

export default function EditorialPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">Editorial Policy</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Editorial Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: August 2026</p>

      <div className="prose prose-sm max-w-none space-y-8">

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            AVSurge exists to help people in India make informed decisions when buying phones, tablets, and laptops. Every specification, comparison, and recommendation on this site is built around one goal: giving you accurate, useful information you can actually rely on — not marketing copy dressed up as an article.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. How We Source Specifications</h2>
          <p className="text-gray-600 leading-relaxed">
            Device specifications published on AVSurge are compiled from official manufacturer sources — brand websites, press materials, and official product listings. We do not publish unconfirmed leaks or rumors as verified specifications. When a device's data is corrected or updated after publication, we update the listing directly rather than leaving outdated information live.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. Editorial Independence</h2>
          <p className="text-gray-600 leading-relaxed">
            AVSurge earns revenue through Amazon affiliate commissions and advertising. This revenue does not influence which devices we cover, how we rank them, or what our comparison tools and AI-generated explanations say about them. A device is never included, excluded, or ranked differently because of its potential commission value.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">4. Affiliate Disclosure</h2>
          <p className="text-gray-600 leading-relaxed">
            AVSurge is a participant in the Amazon Associates Program, an affiliate advertising program. Some links on this site — including "Check on Amazon" buttons on device pages — are affiliate links. If you make a purchase through one of these links, AVSurge may earn a commission at no additional cost to you. This is clearly the case across the site and does not affect the specifications or comparisons shown.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">5. AI-Generated Content</h2>
          <p className="text-gray-600 leading-relaxed">
            AVSurge uses AI tools to help generate spec explanations and personalized device recommendations based on structured specification data. These features are labeled as AI-assisted where they appear. They are designed to help you understand technical specifications more easily, not to replace factual specification data, which remains sourced from official manufacturer information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">6. Pricing Accuracy</h2>
          <p className="text-gray-600 leading-relaxed">
            Prices shown on AVSurge are collected periodically and may not reflect real-time changes on the retailer's site. Always confirm the final price on the retailer's page before completing a purchase. Price history and price drop alerts are provided as a convenience tool and should not be treated as a guarantee of future pricing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">7. User Reviews</h2>
          <p className="text-gray-600 leading-relaxed">
            User reviews and ratings on device pages are submitted directly by site visitors and reflect their individual opinions and experiences, not AVSurge's own editorial judgment. We reserve the right to remove reviews that are spam, abusive, or clearly not based on genuine product experience.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">8. Corrections</h2>
          <p className="text-gray-600 leading-relaxed">
            If you spot an error in a device's specifications, pricing, or any other content on AVSurge, we want to know. We correct confirmed errors as quickly as possible after verification. You can report an issue through our <Link href="/contact" className="text-blue-600 hover:underline">Contact page</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">9. Who Runs AVSurge</h2>
          <p className="text-gray-600 leading-relaxed">
            AVSurge is built and maintained by a small, independent team based in India. We don't have a large newsroom, but every piece of specification data, comparison, and article published on this site is reviewed for accuracy before it goes live. Read more on our <Link href="/about" className="text-blue-600 hover:underline">About page</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">10. Questions</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have questions about how we source information, handle affiliate relationships, or make editorial decisions, reach out via our <Link href="/contact" className="text-blue-600 hover:underline">Contact page</Link>.
          </p>
        </section>

      </div>
    </main>
  )
}
