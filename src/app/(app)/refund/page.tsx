import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refunds',
  description: 'How Porterful handles refund requests.',
}

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[var(--pf-bg)] text-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="text-[var(--pf-orange)] hover:underline mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-bold mt-4">Refunds</h1>
          <p className="text-[var(--pf-text-muted)] mt-2">Last updated: May 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-4 text-[var(--pf-text-secondary)]">
          <p>
            Refund requests are reviewed according to the product type, fulfillment status, and applicable platform policies.
          </p>
          <p>
            Digital goods, physical merchandise, and access products may follow different refund timelines. We aim to respond to every refund request, but a request is not a guarantee of a refund.
          </p>
          <p>
            To request a refund, contact{' '}
            <Link href="/contact" className="text-[var(--pf-orange)] hover:underline">
              support
            </Link>{' '}
            with your order details and the reason for the request.
          </p>
        </div>
      </div>
    </div>
  )
}
