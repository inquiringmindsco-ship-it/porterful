'use client';

import Link from 'next/link';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <Link href="/" className="text-[#ff6b00] hover:underline mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-bold mt-4">Refund Policy</h1>
          <p className="text-gray-400 mt-2">Last updated: March 2026</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Our Refund Commitment</h2>
            <p className="text-gray-300">
              We want you to be happy with your purchase. If you're not, we're here to help.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Artist Products (Merch, Music)</h2>
            <p className="text-gray-300 mb-4">
              Each artist sets their own refund policy for physical and digital products. Here's what applies:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li><strong>Damaged or defective items:</strong> Full refund or replacement, no questions asked</li>
              <li><strong>Wrong item received:</strong> Full refund or correct item shipped</li>
              <li><strong>Never arrived:</strong> Full refund if tracking shows no delivery after 14 days</li>
              <li><strong>Changed mind:</strong> Refunds at artist's discretion (contact the artist first)</li>
            </ul>
            <div className="bg-[#ff6b00]/10 border border-[#ff6b00]/30 rounded-lg p-4 mt-4">
              <p className="text-gray-300">
                <strong className="text-[#ff6b00]">Tip:</strong> Always reach out to the artist directly first — they want to make it right and keep you happy.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Marketplace Products</h2>
            <p className="text-gray-300 mb-4">
              For products sold by small businesses through our marketplace:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li><strong>Damaged in shipping:</strong> Full refund including shipping costs</li>
              <li><strong>Not as described:</strong> Full refund</li>
              <li><strong>Digital products:</strong> Refund within 14 days if unused</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">How to Request a Refund</h2>
            <p className="text-gray-300 mb-4">Here's how to get your refund started:</p>
            <ol className="list-decimal list-inside text-gray-300 space-y-2">
              <li>Contact the artist or seller directly via their profile page</li>
              <li>If unresolved after 48 hours, contact Porterful support</li>
              <li>Provide your order number and reason for the request</li>
              <li>We'll review and process within 3-5 business days</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Refund Timeline</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li><strong>Approval:</strong> 3-5 business days after review</li>
              <li><strong>Credit card / debit:</strong> 5-10 business days to appear</li>
              <li><strong>Store credit:</strong> Processed immediately</li>
              <li><strong>Crypto / other:</strong> 1-3 business days</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Exceptions</h2>
            <p className="text-gray-300 mb-4">We cannot offer refunds for:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Digital products that have been downloaded or streamed</li>
              <li>Customized or personalized items</li>
              <li>Items marked "final sale" at purchase</li>
              <li>Refunds for artists after 30 days of order (contact Stripe directly)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Disputes</h2>
            <p className="text-gray-300">
              If you and the seller can't agree, Porterful will step in to mediate. We review order details, communication history, and evidence before making a final decision. Our goal is fairness for everyone.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Contact</h2>
            <p className="text-gray-300 mb-4">
              For refund requests or disputes:
            </p>
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <p className="text-gray-300">
                📧 <a href="mailto:support@porterful.com" className="text-[#ff6b00] hover:underline">support@porterful.com</a>
              </p>
              <p className="text-gray-400 text-sm mt-2">We typically respond within 24 hours.</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            This Refund Policy is effective as of March 2026 for all Porterful users.
          </p>
        </div>
      </div>
    </div>
  );
}
