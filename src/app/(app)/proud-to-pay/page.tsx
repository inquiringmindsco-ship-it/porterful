'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Music, Users, Zap, ArrowRight, Check } from 'lucide-react'

const BENEFITS = [
  {
    icon: Music,
    title: 'Unlimited Listening',
    description: 'No 99-second limits. Full tracks, albums, everything.',
  },
  {
    icon: Heart,
    title: 'Direct to Artists',
    description: 'the majority of every dollar goes directly to the artists you love.',
  },
  {
    icon: Zap,
    title: 'Early Access',
    description: 'Hear new releases before everyone else.',
  },
  {
    icon: Users,
    title: 'Support the Cause',
    description: "You're helping build a platform that puts artists first.",
  },
]

const PLANS = [
  {
    name: 'Single Track',
    price: '$1',
    period: 'per track',
    description: 'Buy individual tracks you love',
    featured: false,
    cta: 'Browse Music',
    ctaHref: '/music',
  },
  {
    name: 'Artist Fund',
    price: 'Any amount',
    period: 'one-time',
    description: 'Support the platform and artists directly',
    featured: false,
    cta: 'Support This Artist',
    ctaHref: '/music',
  },
]

export default function ProudToPayPage() {
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-4xl mx-auto">
        
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)]/10 rounded-full text-[var(--pf-orange)] text-sm font-medium mb-6">
            <Heart size={16} />
            Proud to Pay
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            You're Not Just Listening.<br />
            <span className="text-[var(--pf-orange)]">You're Supporting.</span>
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            On Porterful, every purchase goes directly to artists. No middlemen, no labels, no big tech taking their cut.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon
            return (
              <div key={i} className="p-6 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--pf-orange)]/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-[var(--pf-orange)]" />
                </div>
                <h3 className="font-bold mb-2">{benefit.title}</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">{benefit.description}</p>
              </div>
            )
          })}
        </div>

        {/* Plans */}
        <h2 className="text-2xl font-bold mb-6 text-center">Choose How to Support</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {PLANS.map((plan, i) => (
            <div 
              key={i}
              className={`p-6 rounded-2xl border ${
                plan.featured 
                  ? 'bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-500/10 border-[var(--pf-orange)]/30' 
                  : 'bg-[var(--pf-surface)] border-[var(--pf-border)]'
              }`}
            >
              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <div className="mb-3">
                <span className="text-3xl font-bold text-[var(--pf-orange)]">{plan.price}</span>
                <span className="text-[var(--pf-text-muted)] text-sm ml-1">{plan.period}</span>
              </div>
              <p className="text-sm text-[var(--pf-text-secondary)] mb-4">{plan.description}</p>
              {plan.cta && (
                <Link
                  href={plan.ctaHref || '/store'}
                  className={`block w-full py-3 text-center rounded-lg font-medium transition-colors ${
                    plan.featured
                      ? 'bg-[var(--pf-orange)] text-white hover:bg-[var(--pf-orange-dark)]'
                      : 'border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Artist Impact */}
        <div className="bg-[var(--pf-surface)] rounded-2xl p-8 border border-[var(--pf-border)] mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Where Your Money Goes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-400">majority</span>
              </div>
              <h3 className="font-bold mb-1">To Artists</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Direct to the creator</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-purple-400">20%</span>
              </div>
              <h3 className="font-bold mb-1">Artist Fund</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Platform growth & support</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-400">0%</span>
              </div>
              <h3 className="font-bold mb-1">Middlemen</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">No labels, no big tech</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-[var(--pf-text-muted)] mb-4">
            Or keep previewing for free — 90 seconds at a time.
          </p>
          <Link href="/music" className="px-8 py-4 border border-[var(--pf-border)] rounded-lg font-medium hover:border-[var(--pf-orange)] transition-colors inline-flex items-center gap-2">
            Keep Browsing <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  )
}
