'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <Link href="/" className="text-[#ff6b00] hover:underline mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-bold mt-4">Privacy Policy</h1>
          <p className="text-gray-400 mt-2">Last updated: March 2026</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p className="text-gray-300 mb-4">
              We collect information you provide directly, such as:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Account information (name, email, phone)</li>
              <li>Payment information (processed via Stripe)</li>
              <li>Content you upload (products, images, music)</li>
              <li>Communications with support</li>
            </ul>
            <p className="text-gray-300 mt-4">
              We also collect automatically:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Usage data (pages visited, interactions)</li>
              <li>Device information (browser, OS)</li>
              <li>Referral data (how you found us)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-300">
              We use your information to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li>Provide and improve our services</li>
              <li>Process transactions and payouts</li>
              <li>Send relevant communications (order updates, earnings)</li>
              <li>Protect against fraud</li>
              <li>Personalize your experience</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
            <p className="text-gray-300">
              We do NOT sell your personal data. We share only:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li>With sellers: transaction details needed to fulfill orders</li>
              <li>With Stripe: payment processing data</li>
              <li>With analytics providers: anonymized usage data</li>
              <li>When required by law: legal compliance</li>
            </ul>
            <div className="bg-[#ff6b00]/10 border border-[#ff6b00]/30 rounded-lg p-4 mt-4">
              <p className="text-[#ff6b00] font-semibold">
                🔒 Your data is never sold to third parties for marketing purposes.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
            <p className="text-gray-300">
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li>End-to-end encryption for all data transmission</li>
              <li>Encrypted databases (AES-256)</li>
              <li>Regular security audits</li>
              <li>Two-factor authentication available</li>
              <li>Stripe for PCI-compliant payment processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
            <p className="text-gray-300">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of marketing communications</li>
            </ul>
            <p className="text-gray-300 mt-4">
              To exercise these rights, email us at{' '}
              <a href="mailto:privacy@porterful.com" className="text-[#ff6b00] hover:underline">
                privacy@porterful.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Cookies & Tracking</h2>
            <p className="text-gray-300">
              We use cookies for:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li>Authentication (keeping you logged in)</li>
              <li>Preferences (theme, language)</li>
              <li>Analytics (understanding usage patterns)</li>
            </ul>
            <p className="text-gray-300 mt-4">
              You can disable cookies in your browser settings, but some features may not work properly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
            <p className="text-gray-300">
              We retain data as long as your account is active. After account deletion:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li>Account data: deleted within 30 days</li>
              <li>Transaction records: retained 7 years (legal requirement)</li>
              <li>Anonymized analytics: retained indefinitely</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Third-Party Services</h2>
            <p className="text-gray-300">
              We use these third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li>Stripe (payments) — <a href="https://stripe.com/privacy" className="text-[#ff6b00] hover:underline">Privacy Policy</a></li>
              <li>Supabase (database) — <a href="https://supabase.com/privacy" className="text-[#ff6b00] hover:underline">Privacy Policy</a></li>
              <li>Vercel (hosting) — <a href="https://vercel.com/legal/privacy-policy" className="text-[#ff6b00] hover:underline">Privacy Policy</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
            <p className="text-gray-300">
              Porterful is not intended for users under 18. We do not knowingly collect data from children. If you believe we have, contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. International Users</h2>
            <p className="text-gray-300">
              Porterful operates from the United States. By using our service, you consent to data transfer to and processing in the United States. We comply with GDPR and other applicable regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this policy. Material changes will be notified via email or Platform banner. Continued use constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Contact</h2>
            <p className="text-gray-300">
              For privacy questions or requests:
            </p>
            <div className="bg-[#1a1a1a] rounded-lg p-4 mt-2">
              <p className="text-gray-300">
                📧 <a href="mailto:privacy@porterful.com" className="text-[#ff6b00] hover:underline">privacy@porterful.com</a>
              </p>
              <p className="text-gray-300 mt-2">
                📧 <a href="mailto:legal@porterful.com" className="text-[#ff6b00] hover:underline">legal@porterful.com</a>
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            This Privacy Policy is effective as of March 2026 and applies to all users of Porterful.
          </p>
        </div>
      </div>
    </div>
  );
}