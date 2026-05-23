'use client'

import Link from 'next/link'
import { Heart, Share2, TrendingUp } from 'lucide-react'

export default function SuperfanPage() {
  return (
    <div className="min-h-screen bg-[var(--pf-bg)] text-[var(--pf-text)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6 bg-gradient-to-b from-[var(--pf-orange)]/10 to-transparent">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-400 px-4 py-1 rounded-full text-sm font-medium mb-6">
            <Heart className="h-4 w-4" />
            <span>The Superfan Program</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Support Artists.<br />Earn While You're At It.
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Share your favorite artists with the world. When people shop through your referral, you can earn rewards too.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How Superfans Earn</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[var(--pf-surface)] rounded-xl p-8 border border-[var(--pf-border)]">
              <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-[var(--pf-orange)]/10 text-[var(--pf-orange)]">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Get Your Code</h3>
              <p className="text-[var(--pf-text-secondary)]">
                Sign up and receive a unique referral code (PF-XXXXXXXX). It's yours forever.
              </p>
            </div>
            <div className="bg-[var(--pf-surface)] rounded-xl p-8 border border-[var(--pf-border)]">
              <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-[var(--pf-orange)]/10 text-[var(--pf-orange)]">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Share Artists</h3>
              <p className="text-[var(--pf-text-secondary)]">
                Tell people about your favorite artists. Share links, codes, and recommendations.
              </p>
            </div>
            <div className="bg-[var(--pf-surface)] rounded-xl p-8 border border-[var(--pf-border)]">
              <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-[var(--pf-orange)]/10 text-[var(--pf-orange)]">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Earn Passive Income</h3>
              <p className="text-[var(--pf-text-secondary)]">
                When someone shops through your code, referral rewards may apply on supported merch and marketplace items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-16 px-6 bg-gradient-to-b from-transparent to-[var(--pf-orange)]/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Superfan Tiers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[var(--pf-surface)] rounded-xl p-8 border border-[var(--pf-border)]">
              <div className="mb-4 flex justify-center text-gray-400">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">Supporter</h3>
              <p className="text-[var(--pf-text-secondary)] text-center">
                Just starting out. Share your code and support artists you love.
              </p>
            </div>
            <div className="bg-[var(--pf-surface)] rounded-xl p-8 border border-purple-500/30">
              <div className="mb-4 flex justify-center text-purple-400">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center text-purple-400">Advocate</h3>
              <p className="text-[var(--pf-text-secondary)] text-center">
                Regular sharers who drive consistent traffic and sales.
              </p>
            </div>
            <div className="bg-[var(--pf-surface)] rounded-xl p-8 border border-[var(--pf-orange)]/30">
              <div className="mb-4 flex justify-center text-[var(--pf-orange)]">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center text-[var(--pf-orange)]">Ambassador</h3>
              <p className="text-[var(--pf-text-secondary)] text-center">
                Top performers who drive serious volume and get exclusive perks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Become a Superfan?</h2>
          <p className="text-[var(--pf-text-secondary)] mb-8">
            Sign up free and get your referral code in minutes.
          </p>
          <Link
            href="/superfan/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--pf-orange)] text-white font-bold rounded-xl hover:bg-[var(--pf-orange)]/90 transition"
          >
            Get Started →
          </Link>
        </div>
      </section>
    </div>
  )
}