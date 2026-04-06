'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { ARTISTS } from '@/lib/artists'
import { ArrowRight, Check, ChevronRight, Crown, Gift, Music, Wallet, Zap, ExternalLink, ShoppingCart, Link as Link2 } from 'lucide-react'

const SUPERFAN_TIERS = [
  {
    name: 'Listener',
    emoji: '🎧',
    requirement: 'Sign up & share',
    reward: '3% on all referrals',
    color: 'from-gray-400 to-gray-500',
    border: 'border-[var(--pf-border)]',
    textColor: 'text-[var(--pf-text-secondary)]',
    perks: [
      'Unique referral link',
      '3% commission on referrals',
      'Supporter badge on artist pages',
      'Early access to new releases',
    ],
  },
  {
    name: 'Advocate',
    emoji: '🔥',
    requirement: '5 successful referrals',
    reward: '5% on all referrals',
    color: 'from-[var(--pf-orange)] to-orange-600',
    border: 'border-[var(--pf-orange)]/30',
    textColor: 'text-[var(--pf-orange)]',
    perks: [
      'Everything in Listener',
      '5% commission on referrals',
      'Featured on artist pages',
      'Exclusive Discord role',
      'Behind-the-scenes content',
    ],
  },
  {
    name: 'Legend',
    emoji: '👑',
    requirement: '20+ successful referrals',
    reward: '8% on all referrals',
    color: 'from-yellow-400 to-amber-500',
    border: 'border-yellow-400/30',
    textColor: 'text-yellow-400',
    perks: [
      'Everything in Advocate',
      '8% commission on referrals',
      'Monthly payout',
      'Direct artist connection',
      'Exclusive Legend events',
      'Custom badge + portfolio',
    ],
  },
]

const FAQS = [
  {
    q: 'How do I become a Superfan?',
    a: 'Sign up through any artist\'s page or join directly. No purchase required — just share your link and start earning.',
  },
  {
    q: 'When do I get paid?',
    a: 'Commissions are calculated monthly and paid out when your balance reaches $25 via Stripe.',
  },
  {
    q: 'What counts as a successful referral?',
    a: 'Anyone who clicks your link and makes a purchase within 30 days. No account required on their end.',
  },
  {
    q: 'Does it cost anything to join?',
    a: 'No. Superfan is free. We earn when your referrals buy, so your success is our success.',
  },
  {
    q: 'Can I support multiple artists?',
    a: 'Yes. Your referral link works across all artists — when anyone buys through your link, you earn.',
  },
]

// Show first 3 artists from the ARTISTS array
const FEATURED_ARTISTS = ARTISTS.slice(0, 3)

// Placeholder values — replace with real data from your backend
const PLACEHOLDER_STATS = {
  referralsMade: 0,
  totalEarned: 0.00,
  currentTier: 'Listener',
}

const PAYOUT_THRESHOLD = 25.00

export default function SuperfanPage() {
  const { user, loading } = useSupabase()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-24">
        <div className="pf-container max-w-5xl flex items-center justify-center py-32">
          <div className="text-[var(--pf-text-secondary)]">Loading...</div>
        </div>
      </div>
    )
  }

  // ─── LOGGED IN: Dashboard Mode ───
  if (user) {
    return (
      <div className="min-h-screen pt-20 pb-24">
        <div className="pf-container max-w-5xl">

          {/* Dashboard Header */}
          <section className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Your Superfan Dashboard</h1>
              <p className="text-[var(--pf-text-secondary)] text-sm mt-1">
                {user.email}
              </p>
            </div>
            <Link href="/apply" className="pf-btn pf-btn-secondary text-sm">
              Get Referral Link
            </Link>
          </section>

          {/* Stats Card */}
          <section className="bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-border)] p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Crown size={20} className="text-[var(--pf-orange)]" />
              <h2 className="text-lg font-bold">Your Superfan Stats</h2>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-[var(--pf-text-secondary)] mb-1">Referrals Made</p>
                <p className="text-3xl font-bold">{PLACEHOLDER_STATS.referralsMade}</p>
                <p className="text-xs text-[var(--pf-text-muted)] mt-1">All time</p>
              </div>
              <div>
                <p className="text-sm text-[var(--pf-text-secondary)] mb-1">Total Earned</p>
                <p className="text-3xl font-bold text-[var(--pf-orange)]">
                  ${PLACEHOLDER_STATS.totalEarned.toFixed(2)}
                </p>
                <p className="text-xs text-[var(--pf-text-muted)] mt-1">Lifetime commissions</p>
              </div>
              <div>
                <p className="text-sm text-[var(--pf-text-secondary)] mb-1">Current Tier</p>
                <p className="text-3xl font-bold">{PLACEHOLDER_STATS.currentTier}</p>
                <p className="text-xs text-[var(--pf-text-muted)] mt-1">3% per referral</p>
              </div>
            </div>
          </section>

          {/* Commission Tracker */}
          <section className="bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-border)] p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Wallet size={20} className="text-[var(--pf-orange)]" />
              <h2 className="text-lg font-bold">Commission Tracker</h2>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--pf-text-secondary)]">Earned</span>
                <span className="font-medium">
                  ${PLACEHOLDER_STATS.totalEarned.toFixed(2)} / ${PAYOUT_THRESHOLD.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-[var(--pf-border)] rounded-full h-2">
                <div
                  className="bg-[var(--pf-orange)] h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((PLACEHOLDER_STATS.totalEarned / PAYOUT_THRESHOLD) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-[var(--pf-text-muted)]">
              Reach ${PAYOUT_THRESHOLD.toFixed(2)} to receive your first payout via Stripe.
            </p>
          </section>

          {/* Favorite Artists */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Music size={20} className="text-[var(--pf-orange)]" />
              <h2 className="text-lg font-bold">Support These Artists</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {FEATURED_ARTISTS.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.slug}`}
                  className="bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-border)] p-4 hover:border-[var(--pf-orange)]/40 transition-colors flex items-center gap-4"
                >
                  <div
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 shrink-0"
                    style={{ background: `linear-gradient(135deg, ${artist.coverGradient.replace('from-', '').replace(' to-', ', ')})` }}
                  />
                  <div className="min-w-0">
                    <p className="font-bold truncate">{artist.name}</p>
                    <p className="text-xs text-[var(--pf-text-secondary)] truncate">{artist.genre}</p>
                    <p className="text-xs text-[var(--pf-text-muted)]">{artist.location}</p>
                  </div>
                  <ArrowRight size={16} className="text-[var(--pf-text-muted)] shrink-0 ml-auto" />
                </Link>
              ))}
            </div>
          </section>

          {/* Support Artists Quick Links */}
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4">Support Artists</h2>
            <div className="flex flex-wrap gap-3">
              {ARTISTS.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--pf-surface)] border border-[var(--pf-border)] text-sm hover:border-[var(--pf-orange)]/40 transition-colors"
                >
                  {artist.name}
                  <ExternalLink size={12} className="text-[var(--pf-text-muted)]" />
                </Link>
              ))}
            </div>
          </section>

          {/* How to Earn More */}
          <section className="bg-gradient-to-br from-[var(--pf-orange)]/5 to-purple-600/5 rounded-2xl border border-[var(--pf-orange)]/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap size={20} className="text-[var(--pf-orange)]" />
              <h2 className="text-lg font-bold">How to Earn More</h2>
            </div>
            <ul className="space-y-3">
              {[
                'Share your referral link on social media and stories',
                'Post after buying something — your link auto-attaches',
                'Help artists you love grow their audience',
                'Hit 5 referrals to unlock Advocate tier (5% commission)',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Check size={16} className="text-[var(--pf-orange)] shrink-0 mt-0.5" />
                  <span className="text-[var(--pf-text-secondary)]">{tip}</span>
                </li>
              ))}
            </ul>
          </section>

        </div>
      </div>
    )
  }

  // ─── LOGGED OUT: Landing Mode ───
  return (
    <div className="min-h-screen pt-20 pb-24">
      <div className="pf-container max-w-5xl">

        {/* Hero */}
        <section className="text-center py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Earn 3%–8% supporting artists you love
          </h1>
          <p className="text-lg text-[var(--pf-text-secondary)] max-w-xl mx-auto mb-8">
            Share music. Track referrals. Earn commissions — automatically.
          </p>
          <Link href="/apply" className="pf-btn pf-btn-primary inline-flex items-center gap-2">
            Sign Up Free <ArrowRight size={18} />
          </Link>
          <p className="text-xs text-[var(--pf-text-muted)] mt-3">No purchase required to join</p>
        </section>

        {/* Short Explainer */}
        <section className="max-w-2xl mx-auto mb-16">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { icon: Link2, title: 'Get your link', desc: 'Unique to your account' },
              { icon: ShoppingCart, title: 'Referrals buy', desc: 'Tracked for 30 days' },
              { icon: Gift, title: 'You earn', desc: '3%–8% automatically' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title}>
                <Icon size={24} className="text-[var(--pf-orange)] mx-auto mb-2" />
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-[var(--pf-text-secondary)] mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tiers */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Superfan Tiers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {SUPERFAN_TIERS.map((tier) => (
              <div key={tier.name} className={`rounded-2xl border ${tier.border} bg-[var(--pf-surface)] overflow-hidden`}>
                <div className={`bg-gradient-to-br ${tier.color} p-6 text-white`}>
                  <div className="text-3xl mb-2">{tier.emoji}</div>
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <p className="text-sm opacity-80 mt-1">{tier.requirement}</p>
                </div>
                <div className="p-6">
                  <p className={`text-2xl font-bold ${tier.textColor} mb-4`}>{tier.reward}</p>
                  <ul className="space-y-3">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="text-[var(--pf-orange)] shrink-0 mt-0.5" />
                        <span className="text-[var(--pf-text-secondary)]">{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/apply"
                    className={`mt-6 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-gradient-to-br ${tier.color} text-white hover:opacity-90 transition-opacity`}
                  >
                    Join {tier.name} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Questions</h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)] overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  <ChevronRight size={18} className={`text-[var(--pf-text-muted)] shrink-0 transition-transform ${activeFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-5 text-sm text-[var(--pf-text-secondary)] border-t border-[var(--pf-border)] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
