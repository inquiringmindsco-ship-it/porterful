'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Music, ShoppingBag, Users, Sparkles, ArrowRight } from 'lucide-react'

const UPCOMING = [
  {
    type: 'artist',
    name: 'ATM Trap',
    tagline: 'St. Louis trap with raw energy',
    date: 'Live soon',
    icon: Music,
    color: 'from-orange-500 to-red-600',
  },
  {
    type: 'artist',
    name: 'Gune',
    tagline: 'Raw music, no filler',
    date: 'Rolling out',
    icon: Music,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    type: 'artist',
    name: 'Verified artists only',
    tagline: 'Only public, ready profiles appear here',
    date: 'Always on',
    icon: Users,
    color: 'from-slate-600 to-slate-800',
  },
  {
    type: 'merch',
    name: 'Porterful apparel',
    tagline: 'Merch drops only when fulfillment is ready',
    date: 'Coming soon',
    icon: ShoppingBag,
    color: 'from-amber-500 to-orange-600',
  },
]

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // In real impl, this would save to Supabase or send email
    // await new Promise(r => setTimeout(r, 1000))
    
    setSubmitted(true);
    setLoading(false)
  }

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-5xl mx-auto">
        
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)]/10 rounded-full text-[var(--pf-orange)] text-sm font-medium mb-6">
            <Bell size={16} />
            Stay Tuned
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Something's <span className="text-[var(--pf-orange)]">Coming.</span>
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            New artists, new merch, new vibes. Drop your email and be the first to know when we go live.
          </p>
        </div>

        {/* Signup Form */}
        {!submitted ? (
          <div className="max-w-md mx-auto mb-16">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="flex-1 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[var(--pf-orange)] text-white rounded-lg font-medium hover:bg-[var(--pf-orange-dark)] transition-colors disabled:opacity-50"
              >
                {loading ? '...' : 'Notify Me'}
              </button>
            </form>
            <p className="text-xs text-[var(--pf-text-muted)] mt-3 text-center">
              No spam. Just drops. Unsubscribe anytime.
            </p>
          </div>
        ) : (
          <div className="max-w-md mx-auto mb-16 text-center p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
            <Bell size={32} className="text-green-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-400 mb-2">You're on the list!</h3>
            <p className="text-[var(--pf-text-secondary)]">We'll notify you when new artists or merch drop.</p>
          </div>
        )}

        {/* What's Coming */}
        <h2 className="text-2xl font-bold mb-8 text-center">What's Cooking</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {UPCOMING.map((item, i) => {
            const Icon = item.icon
            return (
              <div 
                key={i}
                className="p-6 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl hover:border-[var(--pf-orange)] transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                  <Icon size={24} className="text-white" />
                </div>
                <span className="text-xs text-[var(--pf-text-muted)] uppercase tracking-wide">{item.type}</span>
                <h3 className="text-lg font-bold mt-1 mb-1">{item.name}</h3>
                <p className="text-sm text-[var(--pf-text-secondary)] mb-3">{item.tagline}</p>
                <p className="text-xs text-[var(--pf-orange)] font-medium">{item.date}</p>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl border border-[var(--pf-orange)]/20">
          <h3 className="text-2xl font-bold mb-2">Want to be next?</h3>
          <p className="text-[var(--pf-text-secondary)] mb-6">Artists, brands, businesses — there's room for everyone.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/apply" className="px-8 py-4 bg-[var(--pf-orange)] text-white rounded-lg font-semibold hover:bg-[var(--pf-orange-dark)] transition-colors">
              Join as Artist →
            </Link>
            <Link href="/signup?role=brand" className="px-8 py-4 border border-[var(--pf-border)] rounded-lg font-medium hover:border-[var(--pf-orange)] transition-colors">
              Join as Brand
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
