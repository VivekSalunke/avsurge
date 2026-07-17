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
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">Contact</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-400 text-sm mb-10">We'd love to hear from you</p>

      <div className="space-y-6">
        {/* Contact Form */}
        <ContactForm />

        {/* Contact Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Get in touch</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="text-xl">📧</span>
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <a href="mailto:avector134@gmail.com" className="text-blue-600 hover:underline">avector134@gmail.com</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-900">Website</p>
                <a href="https://avsurge.com" className="text-blue-600 hover:underline">avsurge.com</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📍</span>
              <div>
                <p className="font-medium text-gray-900">Location</p>
                <p>India 🇮🇳</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reasons to Contact */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Reasons to contact us</h2>
          <div className="space-y-3">
            {[
              { icon: '📊', title: 'Incorrect device data', desc: 'Found wrong specs or prices? Let us know and we\'ll fix it.' },
              { icon: '💡', title: 'Feature suggestions', desc: 'Have an idea to improve AVSurge? We\'d love to hear it.' },
              { icon: '🤝', title: 'Brand partnerships', desc: 'Interested in partnering with AVSurge? Reach out to us.' },
              { icon: '📱', title: 'Missing devices', desc: 'Can\'t find a device in our database? Request it.' },
              { icon: '🐛', title: 'Bug reports', desc: 'Found a bug or technical issue? Report it to us.' },
            ].map(item => (
              <div key={item.title} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">Quick links</h2>
          <p className="text-sm text-gray-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/about" className="text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition">About AVSurge</Link>
            <Link href="/privacy" className="text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
