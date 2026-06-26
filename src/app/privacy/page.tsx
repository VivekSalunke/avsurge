import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | AVSurge',
  description: 'Privacy Policy for AVSurge - Learn how we collect, use and protect your data.',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">Privacy Policy</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: June 2025</p>

      <div className="prose prose-sm max-w-none space-y-8">

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. Introduction</h2>
          <p className="text-gray-600 leading-relaxed">
            Welcome to AVSurge ("we", "our", or "us"). AVSurge is a device comparison and discovery platform for the Indian market, available at avsurge.com. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed mb-3">We collect information you provide directly to us, including:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li><strong>Email address</strong> — when you sign up for price drop alerts or create an account</li>
            <li><strong>Target price preferences</strong> — when you set price drop notifications</li>
            <li><strong>Wishlist data</strong> — devices you save to your wishlist</li>
            <li><strong>Reviews and ratings</strong> — content you submit on device pages</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">We also collect certain information automatically when you visit our site, including:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>Browser type and version</li>
            <li>Pages visited and time spent</li>
            <li>Referring URL</li>
            <li>Device type and operating system</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
          <p className="text-gray-600 leading-relaxed mb-3">We use the information we collect to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>Send price drop alert emails when a device reaches your target price</li>
            <li>Maintain your account, wishlist and preferences</li>
            <li>Improve our website and add new features</li>
            <li>Display relevant advertisements via Google AdSense</li>
            <li>Analyse site usage and performance</li>
            <li>Respond to your inquiries or support requests</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">4. Cookies and Tracking</h2>
          <p className="text-gray-600 leading-relaxed">
            We use cookies and similar tracking technologies to enhance your experience on AVSurge. This includes remembering recently viewed devices (stored in your browser's local storage), maintaining your login session, and enabling Google AdSense to display relevant ads. You can control cookie settings through your browser preferences. Disabling cookies may affect some features of the site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">5. Third-Party Services</h2>
          <p className="text-gray-600 leading-relaxed mb-3">We use the following third-party services that may collect data:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li><strong>Google AdSense</strong> — for displaying advertisements. Google may use cookies to serve ads based on your visits to our site and other sites.</li>
            <li><strong>Supabase</strong> — our backend database provider, which stores your account data and preferences securely.</li>
            <li><strong>Resend</strong> — our email delivery service, used to send price alert notifications.</li>
            <li><strong>Cloudflare</strong> — for DNS, CDN, and security services.</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            We are not responsible for the privacy practices of these third-party services. We encourage you to review their privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">6. Data Sharing</h2>
          <p className="text-gray-600 leading-relaxed">
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances: with service providers who assist us in operating the website (under strict confidentiality obligations), when required by law or to protect our legal rights, or in connection with a business transfer or acquisition.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">7. Data Retention</h2>
          <p className="text-gray-600 leading-relaxed">
            We retain your personal data for as long as your account is active or as needed to provide services. Price alert subscriptions are retained until you unsubscribe or the alert is fulfilled. You may request deletion of your data at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">8. Your Rights</h2>
          <p className="text-gray-600 leading-relaxed mb-3">You have the right to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your personal data</li>
            <li>Opt out of marketing emails at any time</li>
            <li>Withdraw consent for data processing</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            To exercise any of these rights, please contact us at the email below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">9. Children's Privacy</h2>
          <p className="text-gray-600 leading-relaxed">
            AVSurge is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">10. Changes to This Policy</h2>
          <p className="text-gray-600 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated date. Your continued use of AVSurge after changes are posted constitutes your acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">11. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have any questions about this Privacy Policy or how we handle your data, please contact us at:
          </p>
          <div className="mt-3 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p><strong>AVSurge</strong></p>
            <p>Website: <a href="https://avsurge.com" className="text-blue-600 hover:underline">avsurge.com</a></p>
          </div>
        </section>

      </div>
    </main>
  )
}
