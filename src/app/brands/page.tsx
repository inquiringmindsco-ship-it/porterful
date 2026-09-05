import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Brands — Partner with Independent Artists',
  description: 'Connect your brand with passionate artist audiences. Authentic collaborations, direct fan engagement, and new revenue streams for independent creators.',
  openGraph: {
    title: 'Brands — Porterful',
    description: 'Partner with independent artists and reach their fans directly.',
    type: 'website',
  },
}

export default function BrandsPage() {
  return (
    <main className="min-h-screen bg-[var(--pf-bg)] pt-24 pb-32 md:pt-28 md:pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--pf-orange)]/30 bg-[var(--pf-orange)]/10 px-4 py-1.5 text-sm font-medium text-[var(--pf-orange)] mb-6">
            <span className="h-2 w-2 rounded-full bg-[var(--pf-orange)] animate-pulse"></span>
            For Brands & Businesses
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-[-0.05em] text-white mb-4">
            Reach Artists.<br />Reach Their Fans.
          </h1>
          <p className="text-lg text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Porterful connects brands with independent artists and their communities. Authentic partnerships, zero middleman, real results.
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How Brand Partnerships Work</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-lg font-semibold text-white mb-2">Match with Artists</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                We connect you with artists whose style, values, and audience align with your brand. No forced endorsements.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6">
              <div className="text-3xl mb-4">🎵</div>
              <h3 className="text-lg font-semibold text-white mb-2">Co-Create Content</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Artists create authentic content featuring your products. Fans trust artists they follow.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-lg font-semibold text-white mb-2">Drive Real Results</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Track sales, engagement, and reach. Pay for performance, not impressions.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Why Brands Choose Porterful</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--pf-orange)]"></span>
              <div>
                <h3 className="font-semibold text-white">Authentic Reach</h3>
                <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">Artists your audience already trusts — not generic influencer noise.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--pf-orange)]"></span>
              <div>
                <h3 className="font-semibold text-white">Performance Pricing</h3>
                <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">Pay when it sells. No upfront costs, no wasted ad spend.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--pf-orange)]"></span>
              <div>
                <h3 className="font-semibold text-white">Direct Fan Access</h3>
                <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">Artists share your products with their fanbase — you own the relationship.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--pf-orange)]"></span>
              <div>
                <h3 className="font-semibold text-white">Full Transparency</h3>
                <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">Real-time analytics on every collaboration. Know exactly what works.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.14),transparent_28%),linear-gradient(180deg,rgba(15,17,21,0.98),rgba(8,9,12,0.98))] px-8 py-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to reach artist audiences?</h2>
          <p className="text-[var(--pf-text-secondary)] mb-6">Join the founding beta and be first to partner with Porterful artists.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--pf-orange)] px-6 py-3 text-base font-semibold text-[#111111] transition-transform duration-200 hover:-translate-y-0.5">
              Contact Us
            </Link>
            <Link href="/store" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-6 py-3 text-base font-semibold text-[var(--pf-text)] transition-transform duration-200 hover:-translate-y-0.5">
              Explore Store
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
