'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <Link href="/" className="text-[#ff6b00] hover:underline mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-bold mt-4">Terms of Service</h1>
          <p className="text-gray-400 mt-2">Last updated: March 2026</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300">
              By accessing and using Porterful ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-gray-300">
              Porterful is a four-sided marketplace connecting Artists, Superfans, Small Businesses, and Brands. We enable:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li>Artists to sell merchandise and music</li>
              <li>Superfans to earn referral commissions</li>
              <li>Businesses to list products in our marketplace</li>
              <li>Brands to sponsor and partner with artists</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Account Registration</h2>
            <p className="text-gray-300">
              You must provide accurate, complete information when creating an account. You are responsible for maintaining the security of your account and all activities under it. You must be at least 18 years old to use the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Revenue Sharing</h2>
            <div className="bg-[#1a1a1a] rounded-lg p-6 mb-4">
              <h3 className="font-bold mb-2">Artist Merch Sales:</h3>
              <ul className="text-gray-300 text-sm">
                <li>• Artist receives: 80%</li>
                <li>• Superfan referrer: 5%</li>
                <li>• Processing fees: 15%</li>
              </ul>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-6">
              <h3 className="font-bold mb-2">Marketplace Sales:</h3>
              <ul className="text-gray-300 text-sm">
                <li>• Business receives: 67%</li>
                <li>• Artist share: 20%</li>
                <li>• Superfan referrer: 3%</li>
                <li>• Porterful: 10%</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. User Responsibilities</h2>
            <p className="text-gray-300 mb-2">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Violate any laws or regulations</li>
              <li>Submit false or misleading information</li>
              <li>Sell counterfeit or unauthorized merchandise</li>
              <li>Manipulate referral systems or gaming the platform</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass other users or Platform staff</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Content & Intellectual Property</h2>
            <p className="text-gray-300">
              You retain ownership of content you upload. By uploading, you grant Porterful a license to display, distribute, and promote your content on the Platform. You represent that you have the right to upload all content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Payments & Payouts</h2>
            <p className="text-gray-300">
              Payments are processed through Stripe. Payouts require a minimum balance of $10. We reserve the right to withhold payments in cases of suspected fraud or policy violations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Cancellations & Refunds</h2>
            <p className="text-gray-300">
              Refund policies are set by individual sellers. For disputes, contact the seller first, then Porterful support if unresolved. We mediate disputes in good faith.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-300">
              Porterful is provided "as is." We are not liable for any indirect, incidental, or consequential damages arising from use of the Platform. Our total liability is limited to the amount you paid us in the past 12 months.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Termination</h2>
            <p className="text-gray-300">
              We may suspend or terminate your account for violations of these Terms. You may close your account at any time. Upon termination, any pending payouts will be processed within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Changes to Terms</h2>
            <p className="text-gray-300">
              We may update these Terms periodically. Material changes will be communicated via email or Platform notification. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Contact</h2>
            <p className="text-gray-300">
              Questions? Contact us at{' '}
              <a href="mailto:legal@porterful.com" className="text-[#ff6b00] hover:underline">
                legal@porterful.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            These Terms of Service constitute the entire agreement between you and Porterful regarding use of the Platform.
          </p>
        </div>
      </div>
    </div>
  );
}