'use client'

import Link from 'next/link'
import { Trophy, Target, Users, DollarSign, Clock, TrendingUp, Star, Zap, Gift, CheckCircle2, ArrowRight } from 'lucide-react'

export default function ChallengePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--pf-bg)] via-[var(--pf-bg-secondary)] to-[var(--pf-bg)]">
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--pf-orange)]/10 via-transparent to-purple-500/10" />
        
        <div className="relative z-10 pf-container">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)]/20 border border-[var(--pf-orange)]/40 rounded-full text-[var(--pf-orange)] text-sm font-semibold mb-6 animate-pulse">
              <Trophy size={16} />
              Limited Time Challenge
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              First Artist to Make
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--pf-orange)] to-yellow-400">
                $10,000
              </span>
              Gets <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pf-orange)] to-yellow-400">$10,000</span> Bonus
            </h1>

            <p className="text-xl md:text-2xl text-[var(--pf-text-secondary)] mb-10 max-w-2xl mx-auto">
              We're putting our money where our mouth is. Sell through Porterful and we'll match what you earn — dollar for dollar.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding" className="pf-btn pf-btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
                <Zap size={20} />
                Join the Challenge
              </Link>
              <Link href="/marketplace" className="pf-btn pf-btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2">
                See How It Works
                <ArrowRight size={20} />
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-8 justify-center mt-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[var(--pf-orange)]">$10,000</div>
                <div className="text-sm text-[var(--pf-text-muted)]">Prize Pool</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[var(--pf-orange)]">80%</div>
                <div className="text-sm text-[var(--pf-text-muted)]">You Keep Always</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[var(--pf-orange)]">1st</div>
                <div className="text-sm text-[var(--pf-text-muted)]">To Win Takes All</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="pf-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How the Challenge Works</h2>
            <p className="text-[var(--pf-text-secondary)] text-lg">Simple. Sell. Win.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-2xl p-8 text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[var(--pf-orange)] rounded-full flex items-center justify-center text-white font-bold">1</div>
              <div className="w-16 h-16 mx-auto mb-6 bg-[var(--pf-orange)]/10 rounded-full flex items-center justify-center">
                <Target className="text-[var(--pf-orange)]" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Join Porterful</h3>
              <p className="text-[var(--pf-text-secondary)]">
                Create your free artist profile and list your music, merch, or both. Takes less than 5 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-2xl p-8 text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[var(--pf-orange)] rounded-full flex items-center justify-center text-white font-bold">2</div>
              <div className="w-16 h-16 mx-auto mb-6 bg-[var(--pf-orange)]/10 rounded-full flex items-center justify-center">
                <TrendingUp className="text-[var(--pf-orange)]" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Make Sales</h3>
              <p className="text-[var(--pf-text-secondary)]">
                Share your page with fans. Every track sold, every shirt purchased — it all counts toward $10K.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-2xl p-8 text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[var(--pf-orange)] rounded-full flex items-center justify-center text-white font-bold">3</div>
              <div className="w-16 h-16 mx-auto mb-6 bg-[var(--pf-orange)]/10 rounded-full flex items-center justify-center">
                <Gift className="text-[var(--pf-orange)]" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Get Matched</h3>
              <p className="text-[var(--pf-text-secondary)]">
                Hit $10,000 in sales and we'll send you a $10,000 bonus check. First to hit it wins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Artists Love Porterful */}
      <section className="py-16 md:py-24 bg-[var(--pf-bg-secondary)]/50">
        <div className="pf-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">More Than Just a Challenge</h2>
            <p className="text-[var(--pf-text-secondary)] text-lg">Porterful is built for artists who want to own their future</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl p-6">
              <div className="w-12 h-12 mb-4 bg-green-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-500" size={24} />
              </div>
              <h3 className="font-bold mb-2">80% To You</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Every sale, you keep 80%. No hidden fees, no surprises.</p>
            </div>

            <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl p-6">
              <div className="w-12 h-12 mb-4 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="text-blue-500" size={24} />
              </div>
              <h3 className="font-bold mb-2">Superfan Layer</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Your biggest fans earn when they refer buyers. They become your promoters.</p>
            </div>

            <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl p-6">
              <div className="w-12 h-12 mb-4 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-500" size={24} />
              </div>
              <h3 className="font-bold mb-2">Instant Payouts</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Track your sales in real-time. Withdraw when you want.</p>
            </div>

            <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl p-6">
              <div className="w-12 h-12 mb-4 bg-[var(--pf-orange)]/10 rounded-lg flex items-center justify-center">
                <Star className="text-[var(--pf-orange)]" size={24} />
              </div>
              <h3 className="font-bold mb-2">You Own It All</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Your fan list, your data, your brand. We never take that from you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rules & FAQ */}
      <section className="py-16 md:py-24">
        <div className="pf-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Official Rules</h2>
            
            <div className="space-y-6">
              <div className="bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-xl p-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="text-[var(--pf-orange)]" size={20} />
                  Eligibility
                </h3>
                <p className="text-[var(--pf-text-secondary)]">
                  Any artist with an active Porterful account in good standing. Must be 18+ and able to receive payouts via our supported methods.
                </p>
              </div>

              <div className="bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-xl p-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="text-[var(--pf-orange)]" size={20} />
                  What Counts as "Sales"
                </h3>
                <p className="text-[var(--pf-text-secondary)]">
                  Net revenue from track sales, album sales, and physical merchandise sold through your Porterful page. Refunds and chargebacks are deducted.
                </p>
              </div>

              <div className="bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-xl p-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="text-[var(--pf-orange)]" size={20} />
                  How to Win
                </h3>
                <p className="text-[var(--pf-text-secondary)]">
                  First artist to reach $10,000 in cumulative net sales wins the $10,000 bonus. Winner announced on our social channels and notified directly.
                </p>
              </div>

              <div className="bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-xl p-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="text-[var(--pf-orange)]" size={20} />
                  Payout
                </h3>
                <p className="text-[var(--pf-text-secondary)]">
                  Bonus payout issued within 30 days of verification. Can be sent via wire, ACH, or platform credit depending on your location.
                </p>
              </div>

              <div className="bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-xl p-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="text-[var(--pf-orange)]" size={20} />
                  Challenge End Date
                </h3>
                <p className="text-[var(--pf-text-secondary)]">
                  This is an ongoing challenge. We'll announce an end date with 30 days notice when we close registration. Until then, the prize is available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-[var(--pf-orange)]/20 via-[var(--pf-bg)] to-purple-500/20">
        <div className="pf-container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Make History?</h2>
            <p className="text-xl text-[var(--pf-text-secondary)] mb-10">
              The first $10K artist is going to be someone. Might as well be you.
            </p>
            <Link href="/onboarding" className="pf-btn pf-btn-primary text-xl px-10 py-5 inline-flex items-center gap-3">
              <Zap size={24} />
              Start Your Artist Page Now
            </Link>
            <p className="text-sm text-[var(--pf-text-muted)] mt-4">Free to join. 80% always. Challenge ends when we say so.</p>
          </div>
        </div>
      </section>

    </div>
  )
}
