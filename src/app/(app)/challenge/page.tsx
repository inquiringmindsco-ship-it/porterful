'use client'

import Link from 'next/link'
import { Trophy, TrendingUp, Users, DollarSign, Zap, Share2, Megaphone, BarChart3, Gift, CheckCircle2, ArrowRight, Instagram, Twitter, MessageCircle, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function ChallengePage() {
  const [copied, setCopied] = useState(false)
  const artistUrl = 'porterful.com/artist/yourname'

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${artistUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--pf-orange)]/10 via-transparent to-purple-500/10" />

        <div className="relative z-10 pf-container">
          <div className="text-center max-w-4xl mx-auto">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--pf-orange)] to-orange-500 rounded-full text-white text-sm font-bold mb-6 shadow-lg shadow-[var(--pf-orange)]/30">
              <Trophy size={16} className="fill-current" />
              Sales Challenge
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Reach a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pf-orange)] to-yellow-400">$10,000 Sales Goal</span>
              <br />and Get
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--pf-orange)] to-yellow-400">Recognized</span>.
            </h1>

            <p className="text-xl md:text-2xl text-[var(--pf-text-secondary)] mb-10 max-w-2xl mx-auto">
              Every sale counts. Every track, every shirt, every order. Artists reaching milestones may be featured in future recognition programs.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/signup?role=artist" className="pf-btn pf-btn-primary text-lg px-10 py-4 flex items-center justify-center gap-2 shadow-xl shadow-[var(--pf-orange)]/20">
                <Zap size={20} />
                Join Free — Start Selling
              </Link>
              <Link href="#tools" className="pf-btn pf-btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2">
                Tools to Reach the Goal
                <ArrowRight size={20} />
              </Link>
            </div>

            {/* Progress Preview */}
            <div className="max-w-md mx-auto bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--pf-text-muted)]">Your Sales</span>
                <span className="text-[var(--pf-orange)] font-bold">$0 / $10,000</span>
              </div>
              <div className="h-3 bg-[var(--pf-bg)] rounded-full overflow-hidden">
                <div className="h-full w-0 bg-gradient-to-r from-[var(--pf-orange)] to-yellow-400 rounded-full transition-all" />
              </div>
              <p className="text-xs text-[var(--pf-text-muted)] mt-2 text-center">Start selling and watch this fill up</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools to Reach the Goal Section */}
      <section id="tools" className="py-20 md:py-28 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Here's How Artists <span className="text-[var(--pf-orange)]">Reach Their Goals</span>
            </h2>
            <p className="text-[var(--pf-text-secondary)] text-lg max-w-2xl mx-auto">
              It's not just about uploading music. You need a plan. Here's the playbook.
            </p>
          </div>

          {/* Strategy Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">

            {/* Tool 1: Your Link */}
            <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-2xl p-8 hover:border-[var(--pf-orange)] transition-colors">
              <div className="w-14 h-14 mb-5 bg-[var(--pf-orange)]/10 rounded-xl flex items-center justify-center">
                <Share2 className="text-[var(--pf-orange)]" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Share Your Link</h3>
              <p className="text-[var(--pf-text-secondary)] text-sm mb-4">
                Every fan that clicks your link and buys helps you build toward the $10K sales goal. Share it everywhere.
              </p>
              <div className="bg-[var(--pf-bg-secondary)] rounded-xl p-3 flex items-center gap-2">
                <input
                  type="text"
                  value={artistUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-[var(--pf-text-muted)] outline-none"
                />
                <button
                  onClick={copyLink}
                  className="text-[var(--pf-orange)] hover:bg-[var(--pf-orange)]/10 p-2 rounded-lg transition-colors"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Tool 2: Social Posts */}
            <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-2xl p-8 hover:border-[var(--pf-orange)] transition-colors">
              <div className="w-14 h-14 mb-5 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Megaphone className="text-purple-500" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Pre-Made Promos</h3>
              <p className="text-[var(--pf-text-secondary)] text-sm mb-4">
                Copy-paste ready posts for Instagram, Twitter, TikTok. Just add your link.
              </p>
              <div className="bg-[var(--pf-bg-secondary)] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-[var(--pf-text-muted)]">
                  <Instagram size={14} /> Instagram caption
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--pf-text-muted)]">
                  <Twitter size={14} /> Tweet template
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--pf-text-muted)]">
                  <MessageCircle size={14} /> Text to fans
                </div>
              </div>
            </div>

            {/* Tool 3: Earnings Dashboard */}
            <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-2xl p-8 hover:border-[var(--pf-orange)] transition-colors">
              <div className="w-14 h-14 mb-5 bg-green-500/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="text-green-500" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Track Everything</h3>
              <p className="text-[var(--pf-text-secondary)] text-sm mb-4">
                See your sales in real-time. Know exactly how close you are to the $10K sales goal every single day.
              </p>
              <div className="bg-[var(--pf-bg-secondary)] rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--pf-text-muted)]">Tracks sold</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--pf-text-muted)]">Merch sold</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--pf-text-muted)]">Total earned</span>
                  <span className="font-medium text-[var(--pf-orange)]">$0.00</span>
                </div>
              </div>
            </div>

            {/* Tool 4: Superfan System */}
            <div className="bg-[var(--pf-bg)] border border-[(--pf-border)] rounded-2xl p-8 hover:border-[var(--pf-orange)] transition-colors">
              <div className="w-14 h-14 mb-5 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Users className="text-blue-500" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Superfan Referrals</h3>
              <p className="text-[var(--pf-text-secondary)] text-sm mb-4">
                Your biggest fans share your page. Every sale they refer = extra sales you didn't work for.
              </p>
              <div className="bg-[var(--pf-bg-secondary)] rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">Rewards</div>
                <div className="text-xs text-[var(--pf-text-muted)]">Superfans can earn from referrals</div>
              </div>
            </div>

            {/* Tool 5: Pricing Strategy */}
            <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-2xl p-8 hover:border-[var(--pf-orange)] transition-colors">
              <div className="w-14 h-14 mb-5 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <DollarSign className="text-yellow-500" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Pricing</h3>
              <p className="text-[var(--pf-text-secondary)] text-sm mb-4">
                A track at $1 = 10,000 sales needed. At $5 = only 2,000. Price to move.
              </p>
              <div className="bg-[var(--pf-bg-secondary)] rounded-xl p-4 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--pf-text-muted)]">At $1/track</span>
                  <span className="font-medium">10,000 sales</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--pf-text-muted)]">At $5/track</span>
                  <span className="font-medium">2,000 sales</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--pf-text-muted)]">At $10/track</span>
                  <span className="font-medium">1,000 sales</span>
                </div>
              </div>
            </div>

            {/* Tool 6: Your Fan Base */}
            <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-2xl p-8 hover:border-[var(--pf-orange)] transition-colors">
              <div className="w-14 h-14 mb-5 bg-pink-500/10 rounded-xl flex items-center justify-center">
                <Users className="text-pink-500" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">You Already Have Fans</h3>
              <p className="text-[var(--pf-text-secondary)] text-sm mb-4">
                Text 100 fans. Post once on Instagram. Every response is a potential sale.
              </p>
              <div className="bg-[var(--pf-bg-secondary)] rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-pink-500">100</div>
                <div className="text-xs text-[var(--pf-text-muted)]">fans texted = ~5 sales minimum</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="pf-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Steps to Build Momentum</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-[var(--pf-orange)] to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--pf-orange)]/30">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Join Free</h3>
              <p className="text-[var(--pf-text-secondary)]">Create your page in 5 minutes. Upload your music, set your prices.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-[var(--pf-orange)] to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--pf-orange)]/30">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Share Daily</h3>
              <p className="text-[var(--pf-text-secondary)]">Post your link. Text fans. Use the tools above. Every day counts.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-[var(--pf-orange)] to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--pf-orange)]/30">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Reach the $10K Sales Goal, Get Recognized</h3>
              <p className="text-[var(--pf-text-secondary)]">Artists reaching milestones may be featured in future recognition programs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Math Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[var(--pf-orange)]/5 via-[var(--pf-bg)] to-purple-500/5">
        <div className="pf-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Let's Do the <span className="text-[var(--pf-orange)]">Math</span>
            </h2>
            <p className="text-[var(--pf-text-secondary)] text-lg mb-12">
              Here's how the numbers work.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-2xl p-8">
                <div className="text-4xl font-bold text-[var(--pf-orange)] mb-2">2,000</div>
                <p className="text-[var(--pf-text-secondary)] mb-3">track sales at $5</p>
                <div className="text-sm text-[var(--pf-text-muted)]">2,000 × $5 sales = $10K</div>
                <div className="text-sm text-[var(--pf-text-muted)]">+ merch sales help reach the goal</div>
              </div>
              <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-2xl p-8">
                <div className="text-4xl font-bold text-[var(--pf-orange)] mb-2">500</div>
                <p className="text-[var(--pf-text-secondary)] mb-3">superfan referrals</p>
                <div className="text-sm text-[var(--pf-text-muted)]">Example: each superfan sends 5 buyers</div>
                <div className="text-sm text-[var(--pf-text-muted)]">500 superfans × 5 × $20 avg = potential $50K in sales</div>
              </div>
              <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-2xl p-8">
                <div className="text-4xl font-bold text-[var(--pf-orange)] mb-2">100</div>
                <p className="text-[var(--pf-text-secondary)] mb-3">merch sales a month</p>
                <div className="text-sm text-[var(--pf-text-muted)]">Example: $100/shirt × 100/mo × 12 mo</div>
                <div className="text-sm text-[var(--pf-text-muted)]">= $120K/year potential for active artists</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Rules */}
      <section className="py-20 md:py-28 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">The Rules</h2>

            <div className="space-y-4">
              {[
                { title: 'Who Can Join', desc: 'Any artist 18+ with an active Porterful account. No location restrictions.' },
                { title: 'What Counts', desc: 'Net revenue from tracks, albums, and merchandise sold through your Porterful page.' },
                { title: 'How to Qualify', desc: 'Artists reaching $10,000 in cumulative net sales may be recognized in future programs.' },
                { title: 'Recognition Details', desc: 'Program details and eligibility will be announced when official challenge rules are active.' },
                { title: 'Challenge Timeline', desc: 'Ongoing. Check dashboard for current status. Timeline subject to change with notice.' },
              ].map((rule, i) => (
                <div key={i} className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl p-5 flex items-start gap-4">
                  <CheckCircle2 className="text-[var(--pf-orange)] shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold mb-1">{rule.title}</h3>
                    <p className="text-sm text-[var(--pf-text-secondary)]">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-36 bg-gradient-to-br from-[var(--pf-orange)] via-orange-500 to-[var(--pf-orange)]">
        <div className="pf-container">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 rounded-full text-white text-sm font-semibold mb-8">
              <Trophy size={16} className="fill-current" />
              Reach the $10K Sales Goal. Get Recognized.
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Your Fans Are Ready.<br />Are You?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
              Free to join. Artist-first sales can help you reach recognition milestones.
            </p>
            <p className="text-xs text-white/60 mb-8 max-w-md mx-auto">
              Recognition is subject to verification, eligibility, and active challenge rules. This is not a guaranteed payout or prize.
            </p>
            <Link href="/signup?role=artist" className="inline-flex items-center gap-3 bg-white text-[var(--pf-orange)] font-bold text-lg px-12 py-5 rounded-2xl hover:bg-white/90 transition-colors shadow-2xl">
              <Zap size={24} />
              Start Your Free Page Now
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
