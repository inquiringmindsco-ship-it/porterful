'use client';

import Link from 'next/link';

export default function SuperfanPage() {
  return (
    <div className="min-h-screen bg-[var(--pf-bg)] text-[var(--pf-text)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6 bg-gradient-to-b from-[var(--pf-orange)]/10 to-transparent">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block bg-purple-500/20 text-purple-400 px-4 py-1 rounded-full text-sm font-medium mb-6">
            💜 The Superfan Program
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Support Artists.<br />Earn While You're At It.
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Share your favorite artists with the world. When people shop through your referral, you earn—and so do they.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How Superfans Earn</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[var(--pf-surface)] rounded-xl p-8 border border-[var(--pf-border)]">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-xl font-bold mb-2">Get Your Code</h3>
              <p className="text-[var(--pf-text-secondary)]">
                Sign up and receive a unique referral code (PF-XXXXXXXX). It's yours forever.
              </p>
            </div>
            <div className="bg-[var(--pf-surface)] rounded-xl p-8 border border-[var(--pf-border)]">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-xl font-bold mb-2">Share Artists</h3>
              <p className="text-[var(--pf-text-secondary)]">
                Tell people about your favorite artists. Share links, codes, and recommendations.
              </p>
            </div>
            <div className="bg-[var(--pf-surface)] rounded-xl p-8 border border-[var(--pf-border)]">
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="text-xl font-bold mb-2">Earn Passive Income</h3>
              <p className="text-[var(--pf-text-secondary)]">
                When someone shops through your code, you earn 5% on merch, 3% on marketplace items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Breakdown */}
      <section className="py-16 px-6 bg-[var(--pf-bg-secondary)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Earnings Breakdown</h2>
          <div className="bg-[var(--pf-surface)] rounded-2xl p-8 border border-[var(--pf-border)]">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-[var(--pf-orange)]">Artist Merch</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[var(--pf-text-secondary)]">Your earnings:</span>
                    <span className="font-semibold">5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--pf-text-secondary)]">Artist keeps:</span>
                    <span className="font-semibold">80%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--pf-text-secondary)]">Processing:</span>
                    <span className="font-semibold">15%</span>
                  </div>
                </div>
                <p className="text-sm text-[var(--pf-text-muted)] mt-4">
                  Example: $50 t-shirt = $2.50 to you
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-purple-400">Marketplace Items</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[var(--pf-text-secondary)]">Your earnings:</span>
                    <span className="font-semibold">3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--pf-text-secondary)]">Business keeps:</span>
                    <span className="font-semibold">67%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--pf-text-secondary)]">Artist + Platform:</span>
                    <span className="font-semibold">30%</span>
                  </div>
                </div>
                <p className="text-sm text-[var(--pf-text-muted)] mt-4">
                  Example: $100 product = $3 to you
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Superfan Tiers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
              <div className="text-3xl mb-2">🤍</div>
              <h3 className="text-xl font-bold mb-1">Supporter</h3>
              <p className="text-[var(--pf-text-muted)] mb-4">0-10 referrals</p>
              <ul className="space-y-2 text-sm text-[var(--pf-text-secondary)]">
                <li>✓ Referral code</li>
                <li>✓ Dashboard access</li>
                <li>✓ Basic analytics</li>
              </ul>
            </div>
            <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-purple-500/50">
              <div className="text-3xl mb-2">💜</div>
              <h3 className="text-xl font-bold mb-1">Superfan</h3>
              <p className="text-purple-400 mb-4">11-50 referrals</p>
              <ul className="space-y-2 text-sm text-[var(--pf-text-secondary)]">
                <li>✓ Everything in Supporter</li>
                <li>✓ Priority support</li>
                <li>✓ Early access to drops</li>
                <li>✓ Verified badge</li>
              </ul>
            </div>
            <div className="bg-gradient-to-b from-[var(--pf-orange)]/20 to-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-orange)]">
              <div className="text-3xl mb-2">🔥</div>
              <h3 className="text-xl font-bold mb-1">Ambassador</h3>
              <p className="text-[var(--pf-orange)] mb-4">51+ referrals</p>
              <ul className="space-y-2 text-sm text-[var(--pf-text-secondary)]">
                <li>✓ Everything in Superfan</li>
                <li>✓ Direct artist communication</li>
                <li>✓ Exclusive merch discounts</li>
                <li>✓ Revenue share bonuses</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-[var(--pf-bg-secondary)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How do I get paid?", a: "Earnings accumulate in your dashboard. Cash out anytime via Stripe (minimum $10)." },
              { q: "Can I refer multiple artists?", a: "Yes! Your code works for the entire marketplace. Share whoever you love." },
              { q: "Do I need to be verified?", a: "No verification needed to start. Just sign up and share." },
              { q: "What if someone uses my code twice?", a: "You earn on every purchase from that customer for 30 days." },
            ].map((faq, i) => (
              <div key={i} className="bg-[var(--pf-surface)] rounded-lg p-4 border border-[var(--pf-border)]">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-[var(--pf-text-secondary)] text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Become a Superfan?</h2>
          <p className="text-[var(--pf-text-secondary)] mb-6">
            Join the community of fans supporting artists—and earning while doing it.
          </p>
          <Link 
            href="/signup?role=superfan" 
            className="inline-block bg-purple-500 text-[var(--pf-text)] px-8 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
          >
            Start Earning Now
          </Link>
        </div>
      </section>
    </div>
  );
}