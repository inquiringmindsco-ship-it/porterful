'use client'

import Link from 'next/link'
import { ArrowRight, Check, Music, DollarSign, Users, Zap, Headphones, Globe, Shield, Mic } from 'lucide-react'

const BENEFITS = [
  {
    icon: DollarSign,
    title: "Artist-first earnings",
    desc: 'More than any other platform. Your music, your price, your cut.',
  },
  {
    icon: Users,
    title: 'Direct fan relationships',
    desc: 'No algorithm. Fans find you through identity, not recommendation engines.',
  },
  {
    icon: Zap,
    title: 'Superfan referrals',
    desc: 'Your fans earn 3–8% bringing buyers to you. They become your promoters.',
  },
  {
    icon: Music,
    title: 'Merch + music together',
    desc: 'Sell tracks, albums, books, and custom products from one artist page.',
  },
]

const REVENUE_MODEL = [
  { label: 'Track sale', artistGets: 'majority', porterful: 'platform', superfan: 'referral' },
  { label: 'Album sale', artistGets: 'majority', porterful: 'platform', superfan: 'referral' },
  { label: 'Merch sale', artistGets: 'majority', porterful: 'platform', superfan: 'referral' },
  { label: 'Book sale', artistGets: 'majority', porterful: 'platform', superfan: 'referral' },
]

const PLATFORM_STATS = [
  { value: 'Artist-first', label: 'Revenue share' },
  { value: '100+', label: 'Tracks available' },
  { value: '3–8%', label: 'Superfan commission' },
  { value: '$0', label: 'To join' },
]

export default function ApplyPage() {
  return (
    <div className="min-h-screen pb-24">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--pf-orange)]/5 via-[var(--pf-bg)] to-[var(--pf-bg)]">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-3" style={{
          backgroundImage: 'radial-gradient(circle at 30% 50%, var(--pf-orange) 0%, transparent 50%), radial-gradient(circle at 70% 50%, var(--pf-purple) 0%, transparent 50%)',
        }} />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/20 text-[var(--pf-orange)] text-sm font-medium mb-8">
            <Music size={14} />
            Porterful Music — Artist Applications
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Your music.<br />
            <span className="text-[var(--pf-orange)]">Your terms.</span>
          </h1>

          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto mb-10">
            Porterful is not a platform that takes from artists. It is a platform that artists own. Keep artist-first earnings on every sale. Build with your fans. No label. No middleman.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/apply/form"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--pf-orange)] text-white font-bold rounded-full hover:bg-[var(--pf-orange-dark)] transition-colors text-lg"
            >
              Start Earning — Apply <ArrowRight size={18} />
            </Link>
            <Link
              href="/music"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[var(--pf-text-secondary)] font-medium rounded-full hover:border-[var(--pf-orange)]/40 hover:text-[var(--pf-text)] transition-colors"
            >
              Browse Artists <Headphones size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* PLATFORM STATS */}
      <section className="border-y border-[var(--pf-border)]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-4 gap-6 text-center">
            {PLATFORM_STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-[var(--pf-orange)] mb-1">{value}</p>
                <p className="text-sm text-[var(--pf-text-muted)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest text-[var(--pf-orange)] mb-2">What artists get</p>
          <h2 className="text-3xl font-bold">Built for artists who build</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 p-6 rounded-2xl bg-[var(--pf-surface)] border border-[var(--pf-border)]">
              <div className="w-12 h-12 rounded-xl bg-[var(--pf-orange)]/10 flex items-center justify-center shrink-0">
                <Icon size={22} className="text-[var(--pf-orange)]" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{title}</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">{desc}</p>
              </div>
            </div>
          ))}

          {/* LIKENESS PROTECTION — Artist Benefit */}
          <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-[#333333] p-8 text-white">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-[#c6a85a]/20 flex items-center justify-center shrink-0">
                <Mic size={26} className="text-[#c6a85a]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#c6a85a] text-xs font-medium tracking-widest uppercase">New for artists</span>
                  <div className="px-2 py-0.5 rounded-full bg-[#c6a85a]/20 text-[#c6a85a] text-xs font-medium">Likeness™</div>
                </div>
                <h3 className="font-bold text-xl mb-2">Protect Your Voice & Likeness</h3>
                <p className="text-[#aaaaaa] text-sm mb-4 leading-relaxed">
                  AI companies are scraping artist voices and faces to build synthetic clones. As a Porterful artist, you get access to Likeness™ — register your voice and likeness before someone else uses it against you.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-sm text-[#cccccc]">
                    <span className="text-[#c6a85a]">✓</span> Voice + face registration
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#cccccc]">
                    <span className="text-[#c6a85a]">✓</span> Legal certificate
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#cccccc]">
                    <span className="text-[#c6a85a]">✓</span> C&D letter templates
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#cccccc]">
                    <span className="text-[#c6a85a]">✓</span> Evidence vault
                  </div>
                </div>
                <p className="text-xs text-[#888888] mt-4">
                  Included free for all Porterful artists. Regular price $12/year.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVENUE MODEL */}
      <section className="border-t border-[var(--pf-border)]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-[var(--pf-orange)] mb-2">How revenue works</p>
            <h2 className="text-3xl font-bold mb-3">The math is simple</h2>
            <p className="text-[var(--pf-text-secondary)] max-w-lg mx-auto">
              Every sale is split three ways: artist, platform, and the superfan who brought the buyer. Here is exactly how it breaks down.
            </p>
          </div>

          {/* Revenue table */}
          <div className="bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-border)] overflow-hidden mb-8">
            <div className="grid grid-cols-4 gap-4 p-4 bg-[var(--pf-bg)] border-b border-[var(--pf-border)]">
              <div className="text-sm font-medium text-[var(--pf-text-muted)]">Product</div>
              <div className="text-sm font-medium text-[var(--pf-orange)]">Artist</div>
              <div className="text-sm font-medium text-[var(--pf-text-muted)]">Porterful</div>
              <div className="text-sm font-medium text-[var(--pf-text-muted)]">Superfan</div>
            </div>
            {REVENUE_MODEL.map(({ label, artistGets, porterful, superfan }) => (
              <div key={label} className="grid grid-cols-4 gap-4 p-4 border-b border-[var(--pf-border)] last:border-0">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-sm font-bold text-[var(--pf-orange)]">{artistGets}</div>
                <div className="text-sm text-[var(--pf-text-secondary)]">{porterful}</div>
                <div className="text-sm text-[var(--pf-text-secondary)]">{superfan}</div>
              </div>
            ))}
          </div>

          <p className="text-sm text-[var(--pf-text-muted)] text-center">
            Superfan cut applies only when a purchase comes through a referral link. If there is no superfan referral, the artist keeps 90% and Porterful takes 10%.
          </p>
          <p className="text-xs text-[var(--pf-text-muted)] text-center mt-2">
            * Merchant fees (e.g., Stripe's 2.9% + $0.30) are deducted from artist earnings before split.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-[var(--pf-border)]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What happens after you apply</h2>
            <p className="text-[var(--pf-text-secondary)]">We review every application personally. Here's the process.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Apply', desc: 'Fill out the form. Complete applications get approved automatically.' },
              { step: '02', title: 'Auto-Approve', desc: 'If your application is complete, you go live within minutes.' },
              { step: '03', title: 'Dashboard', desc: 'Access your artist dashboard and start configuring.' },
              { step: '04', title: 'Launch', desc: 'Your page goes live. You start earning.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative text-center p-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">{desc}</p>
                {step !== '04' && (
                  <div className="hidden md:block absolute top-[calc(50%-12px)] right-0 translate-x-1/2 w-8 border-t border-dashed border-[var(--pf-border)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--pf-border)]">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/20 text-[var(--pf-orange)] text-sm font-medium mb-6">
            <Shield size={14} />
            Selective but open
          </div>

          <h2 className="text-4xl font-bold mb-4">Ready to own your revenue?</h2>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-xl mx-auto mb-10">
            Join artists who are building on Porterful. No upfront cost. No label. Just your music and your terms.
          </p>

          <div className="bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-orange)]/20 p-6 mb-8">
            <h3 className="font-bold mb-3 text-[var(--pf-orange)]">Auto-Approved if complete</h3>
            <p className="text-sm text-[var(--pf-text-secondary)] mb-3">
              If your application has all required info, you go live automatically — no waiting.
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Stage name + genre
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Bio (50+ characters)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Email + phone
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> 1 music link (Spotify, etc.)
              </div>
              <div className="col-span-2 flex items-center gap-2 mt-1">
                <span className="text-green-400">✓</span>
                <span className="text-[var(--pf-text-secondary)]">Likeness™ protection included free — voice + face registration</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/apply/form"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--pf-orange)] text-white font-bold rounded-full hover:bg-[var(--pf-orange-dark)] transition-colors text-lg"
            >
              Start Your Application <ArrowRight size={18} />
            </Link>
            <Link
              href="/music"
              className="inline-flex items-center gap-2 px-6 py-3 text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors"
            >
              Listen to O D Porter first <Globe size={16} />
            </Link>
          </div>

          <p className="text-sm text-[var(--pf-text-muted)] mt-8">
            Questions?{" "}
            <Link href="/contact" className="text-[var(--pf-orange)] hover:underline">
              Contact us
            </Link>
            {" · "}
            <span className="text-[var(--pf-text-muted)]">
              Takes about 5 minutes to apply
            </span>
          </p>
        </div>
      </section>

    </div>
  )
}
