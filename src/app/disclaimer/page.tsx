import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Disclaimer | AVSurge',
  alternates: { canonical: 'https://avsurge.com/disclaimer' },
  description: 'Disclaimer for AVSurge - Important information about device specifications and reviews.',
  robots: 'index, follow',
}

export default function DisclaimerPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-600">Disclaimer</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Disclaimer</h1>
      <p className="text-gray-400 text-sm mb-10">Last updated: July 2026</p>

      <div className="space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">General Disclaimer</h2>
          <p>
            The information provided on AVSurge (avsurge.com) is for general informational purposes only. While we strive to provide accurate and up-to-date information, we make no warranties, express or implied, regarding the accuracy, completeness, or reliability of the information contained on our website.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Device Specifications</h2>
          <p>
            Device specifications, prices, and availability information on AVSurge are sourced from manufacturer websites, official retailers, and public databases. While we take reasonable steps to ensure accuracy, specifications may change without notice. Prices fluctuate constantly based on market conditions and are indicative only.
          </p>
          <p className="mt-3">
            <strong>You should always verify specifications and prices directly with the manufacturer or retailer before making a purchase decision.</strong> We are not responsible for any inaccuracies in device specifications or pricing information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">User Reviews and Ratings</h2>
          <p>
            Reviews and ratings on AVSurge are submitted by users and represent their personal opinions only. We do not endorse or guarantee the accuracy of user reviews. AVSurge reserves the right to remove reviews that violate our policies, including false, defamatory, or harmful content.
          </p>
          <p className="mt-3">
            <strong>User reviews are not necessarily representative of the device's actual performance or quality.</strong> We recommend reading multiple reviews and conducting your own research before making purchase decisions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Affiliate Links and Commissions</h2>
          <p>
            AVSurge includes affiliate links to Amazon and other retailers. When you purchase through these links, we earn a commission at no extra cost to you. Our affiliate relationships may create a potential conflict of interest, as we may be incentivized to recommend products from affiliate partners.
          </p>
          <p className="mt-3">
            However, our device data and comparisons are based on publicly available specifications and user feedback. Our recommendations are intended to provide genuine value based on price, performance, and user needs, not solely on affiliate potential.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Third-Party Links</h2>
          <p>
            AVSurge contains links to third-party websites, including manufacturer websites, retail sites, and social media platforms. We are not responsible for the accuracy, content, or practices of these third-party sites. Your use of third-party sites is subject to their own terms of service and privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, AVSurge and its founders, employees, and agents shall not be liable for any indirect, incidental, special, or consequential damages arising out of or related to:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>Your use or inability to use the website</li>
            <li>Reliance on information provided on the website</li>
            <li>Any purchase decisions made based on information on AVSurge</li>
            <li>Device performance, defects, or recalls</li>
            <li>Price fluctuations or availability changes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Warranty Disclaimer</h2>
          <p>
            THE INFORMATION AND MATERIALS ON THIS WEBSITE ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Medical and Safety Disclaimer</h2>
          <p>
            Information about device specifications, including radiation levels (SAR values), battery safety, or health-related concerns is provided for informational purposes only and does not constitute medical or safety advice. If you have specific health or safety concerns about a device, please consult appropriate professionals or the device manufacturer.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Price and Availability</h2>
          <p>
            Prices and availability of devices change frequently and are subject to market conditions. Product availability may vary by location and retailer. Prices shown on AVSurge are indicative and may not reflect current prices on retail sites.
          </p>
          <p className="mt-3">
            Always check the retailer's website for the most current pricing and availability before making a purchase.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Changes to This Disclaimer</h2>
          <p>
            AVSurge reserves the right to modify this disclaimer at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website following the posting of changes constitutes your acceptance of the updated disclaimer.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Contact for Corrections</h2>
          <p>
            If you find inaccurate information on our website, please report it to us immediately. We will investigate and correct any errors promptly.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mt-4">
            <p className="font-semibold text-gray-900">Report an Issue:</p>
            <p className="text-sm mt-2">Email: <a href="mailto:corrections@avsurge.com" className="text-blue-600 hover:underline">corrections@avsurge.com</a></p>
            <p className="text-sm">Website: <a href="https://avsurge.com/contact" className="text-blue-600 hover:underline">Contact Us</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Intellectual Property</h2>
          <p>
            All content on AVSurge, including text, graphics, logos, and images, is the property of AVSurge or its content suppliers and is protected by international copyright laws. You may not reproduce, distribute, or transmit any content without our prior written permission.
          </p>
          <p className="mt-3">
            Device names, logos, and trademarks are the property of their respective manufacturers and are used for identification purposes only.
          </p>
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
          <h2 className="text-base font-bold text-gray-900 mb-2">Questions?</h2>
          <p className="text-sm text-gray-600 mb-4">Check our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>, <Link href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link>, or <Link href="/contact" className="text-blue-600 hover:underline">contact us</Link> for more information.</p>
        </section>
      </div>
    </main>
  )
}
