import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms and Conditions | AVSurge',
  description: 'Terms and Conditions for using AVSurge - India\'s device comparison platform.',
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">Terms and Conditions</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: June 2025</p>

      <div className="prose prose-sm max-w-none space-y-8">

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing and using AVSurge (avsurge.com), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website. These terms apply to all visitors, users, and others who access or use the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. Description of Service</h2>
          <p className="text-gray-600 leading-relaxed">
            AVSurge is a device comparison and discovery platform for the Indian market. We provide specifications, prices, comparisons, and reviews for smartphones, tablets, and laptops available in India. All device information is provided for informational purposes only. We are not a retailer and do not sell devices directly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. Accuracy of Information</h2>
          <p className="text-gray-600 leading-relaxed">
            We strive to provide accurate and up-to-date device specifications and pricing information. However, we make no warranties or representations regarding the accuracy, completeness, or timeliness of any information on this site. Device prices and availability are subject to change at any time. We recommend verifying all information directly with retailers before making a purchase decision.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">4. Price Alerts</h2>
          <p className="text-gray-600 leading-relaxed">
            Our price alert service is provided on a best-effort basis. By subscribing to price alerts, you consent to receive email notifications from AVSurge. We do not guarantee the accuracy or timeliness of price data. Price alerts are informational only and do not constitute a guarantee of any specific price. You can unsubscribe from price alerts at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">5. User Accounts</h2>
          <p className="text-gray-600 leading-relaxed">
            When you create an account on AVSurge, you are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. You agree to provide accurate information and to update it as necessary. We reserve the right to terminate accounts that violate these terms or engage in fraudulent activity.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">6. User-Generated Content</h2>
          <p className="text-gray-600 leading-relaxed">
            By submitting reviews, ratings, or other content on AVSurge, you grant us a non-exclusive, royalty-free licence to use, display, and distribute that content on our platform. You represent that your content is accurate, does not infringe any third-party rights, and does not contain harmful, offensive, or illegal material. We reserve the right to remove any content that violates these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">7. Affiliate Links and Advertising</h2>
          <p className="text-gray-600 leading-relaxed">
            AVSurge may contain affiliate links to third-party retailers such as Amazon India and Flipkart. When you click these links and make a purchase, we may earn a commission at no additional cost to you. We also display advertisements through Google AdSense. These commercial relationships do not influence our editorial content or device comparisons.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">8. Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed">
            All content on AVSurge, including but not limited to text, graphics, logos, and software, is the property of AVSurge or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission. Device specifications and product names are the property of their respective manufacturers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">9. Third-Party Links</h2>
          <p className="text-gray-600 leading-relaxed">
            Our website may contain links to third-party websites, including retailers and manufacturers. These links are provided for your convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">10. Disclaimer of Warranties</h2>
          <p className="text-gray-600 leading-relaxed">
            AVSurge is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or free of viruses or other harmful components. We disclaim all warranties, including implied warranties of merchantability and fitness for a particular purpose.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">11. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            To the fullest extent permitted by law, AVSurge shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the service. This includes damages for loss of profits, data, or other intangible losses, even if we have been advised of the possibility of such damages.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">12. Prohibited Activities</h2>
          <p className="text-gray-600 leading-relaxed mb-3">You agree not to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>Use the site for any unlawful purpose or in violation of any regulations</li>
            <li>Scrape, crawl, or extract data from our site without written permission</li>
            <li>Submit false, misleading, or fraudulent reviews or ratings</li>
            <li>Attempt to gain unauthorized access to any part of the site</li>
            <li>Use automated tools to interact with the site without our consent</li>
            <li>Impersonate any person or entity or misrepresent your affiliation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">13. Governing Law</h2>
          <p className="text-gray-600 leading-relaxed">
            These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in India.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">14. Changes to Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to the website. Your continued use of AVSurge after any changes constitutes your acceptance of the new terms. We encourage you to review these terms periodically.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">15. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have any questions about these Terms and Conditions, please contact us at:
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
