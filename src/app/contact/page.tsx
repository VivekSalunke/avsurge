import type { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us | AVSurge',
  description: 'Contact AVSurge for feedback, suggestions or to report incorrect device data. Email us at contact@avsurge.com or use the contact form.',
  alternates: { canonical: 'https://avsurge.com/contact' },
}

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact AVSurge',
  url: 'https://avsurge.com/contact',
  mainEntity: {
    '@type': 'Organization',
    name: 'AVSurge',
    url: 'https://avsurge.com',
    email: 'contact@avsurge.com',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@avsurge.com',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi'],
    },
  },
}

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-[var(--text)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />

      <div className="text-sm text-[rgba(255,255,255,0.4)] mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neon-cyan">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-[rgba(255,255,255,0.65)]">Contact</span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
      <p className="text-[rgba(255,255,255,0.4)] text-sm mb-10">
        Have a question, found incorrect data, or want to partner with us? We&apos;d love to hear from you.
      </p>

      {/* Contact methods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { icon: '📧', title: 'Email', value: 'contact@avsurge.com', href: 'mailto:contact@avsurge.com', desc: 'Best for detailed queries' },
          { icon: '⏱️', title: 'Response time', value: '1–2 business days', desc: 'We reply to every message' },
          { icon: '🌐', title: 'Website', value: 'avsurge.com', href: 'https://avsurge.com', desc: 'Device specs & prices' },
          { icon: '📍', title: 'Location', value: 'India', desc: 'Serving the Indian market' },
        ].map(card => (
          <div key={card.title} className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 neon-border">
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-xs uppercase tracking-wider text-dim mb-0.5">{card.title}</p>
            {card.href ? (
              <a href={card.href} className="text-sm font-semibold text-neon-cyan hover:underline break-all">{card.value}</a>
            ) : (
              <p className="text-sm font-semibold text-white">{card.value}</p>
            )}
            <p className="text-xs text-dim mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
        {/* Contact Query Form */}
        <div className="lg:col-span-3">
          <ContactForm />
        </div>

        {/* Why contact us */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 neon-border">
            <h2 className="text-base font-bold text-white mb-4">Reasons to contact us</h2>
            <div className="space-y-3">
              {[
                { icon: '📊', title: 'Incorrect device data', desc: 'Found wrong specs or prices? Let us know and we\'ll fix it.' },
                { icon: '💡', title: 'Feature suggestions', desc: 'Have an idea to improve AVSurge? We\'d love to hear it.' },
                { icon: '🤝', title: 'Brand partnerships', desc: 'Interested in partnering with AVSurge? Reach out to us.' },
                { icon: '📱', title: 'Missing devices', desc: 'Can\'t find a device in our database? Request it.' },
                { icon: '🐛', title: 'Bug reports', desc: 'Found a bug or technical issue? Report it to us.' },
              ].map(item => (
                <div key={item.title} className="flex gap-3 p-3 bg-[var(--panel)] rounded-xl">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="font-medium text-white text-sm">{item.title}</p>
                    <p className="text-xs text-[rgba(255,255,255,0.4)] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 neon-border">
            <h2 className="text-base font-bold text-white mb-2">Quick links</h2>
            <p className="text-sm text-dim mb-4">Looking for something specific?</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/about" className="text-sm text-neon-cyan border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-xl hover:bg-[rgba(6,182,212,0.06)] hover:text-white transition">About AVSurge</Link>
              <Link href="/privacy" className="text-sm text-neon-cyan border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-xl hover:bg-[rgba(6,182,212,0.06)] hover:text-white transition">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-neon-cyan border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-xl hover:bg-[rgba(6,182,212,0.06)] hover:text-white transition">Terms & Conditions</Link>
              <Link href="/disclaimer" className="text-sm text-neon-cyan border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-xl hover:bg-[rgba(6,182,212,0.06)] hover:text-white transition">Disclaimer</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
