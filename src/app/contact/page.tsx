import type { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us | AVSurge',
  description: 'Contact AVSurge for feedback, suggestions or to report incorrect device data.',
  alternates: { canonical: 'https://avsurge.com/contact' },
}

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 text-[var(--text)]">
      <div className="text-sm text-[rgba(255,255,255,0.4)] mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neon-cyan">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-[rgba(255,255,255,0.65)]">Contact</span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
      <p className="text-[rgba(255,255,255,0.4)] text-sm mb-10">We'd love to hear from you</p>

      <div className="space-y-6">
        {/* Contact Form */}
        <ContactForm />

        {/* Contact Info */}
        <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 neon-border">
          <h2 className="text-base font-bold text-white mb-4">Get in touch</h2>
          <div className="space-y-4 text-sm text-[rgba(255,255,255,0.65)]">
            <div className="flex items-start gap-3">
              <span className="text-xl">📧</span>
              <div>
                <p className="font-medium text-white">Email</p>
                <a href="mailto:avector134@gmail.com" className="text-neon-cyan hover:underline">avector134@gmail.com</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-white">Website</p>
                <a href="https://avsurge.com" className="text-neon-cyan hover:underline">avsurge.com</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📍</span>
              <div>
                <p className="font-medium text-white">Location</p>
                <p>India 🇮🇳</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reasons to Contact */}
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

        {/* Quick Links */}
        <div className="bg-[var(--card-bg)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 neon-border">
          <h2 className="text-base font-bold text-white mb-2">Quick links</h2>
          <p className="text-sm text-dim mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/about" className="text-sm text-neon-cyan border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-xl hover:bg-[rgba(6,182,212,0.06)] hover:text-white transition">About AVSurge</Link>
            <Link href="/privacy" className="text-sm text-neon-cyan border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-xl hover:bg-[rgba(6,182,212,0.06)] hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-neon-cyan border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-xl hover:bg-[rgba(6,182,212,0.06)] hover:text-white transition">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
