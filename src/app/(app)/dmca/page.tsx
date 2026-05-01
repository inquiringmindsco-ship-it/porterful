import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Copyright / DMCA',
  description: 'How to send a copyright notice to Porterful.',
}

export default function DmcaPage() {
  return (
    <div className="min-h-screen bg-[var(--pf-bg)] text-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="text-[var(--pf-orange)] hover:underline mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-bold mt-4">Copyright / DMCA</h1>
          <p className="text-[var(--pf-text-muted)] mt-2">Last updated: May 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-4 text-[var(--pf-text-secondary)]">
          <p>
            If you believe content on Porterful infringes your copyright, send a notice with the following:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Your contact information (name, email, mailing address).</li>
            <li>Identification of the copyrighted work at issue.</li>
            <li>The URL or specific location of the content on Porterful.</li>
            <li>A statement of good-faith belief that the use is not authorized.</li>
            <li>A statement, under penalty of perjury, that the information in your notice is accurate and that you are authorized to act on behalf of the rights holder.</li>
            <li>Your physical or electronic signature.</li>
          </ul>
          <p>
            Send notices to{' '}
            <Link href="/contact" className="text-[var(--pf-orange)] hover:underline">
              support
            </Link>
            . We review every notice in good faith. Submitting a notice does not guarantee any specific outcome or timeline.
          </p>
        </div>
      </div>
    </div>
  )
}
