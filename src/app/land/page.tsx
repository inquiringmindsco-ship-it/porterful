'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Map, ExternalLink, ChevronRight, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'

export default function LandPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const lead = {
        email: form.email,
        name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
        message: form.message,
        source: 'land-interest',
      }
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      // silently fail
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-4xl mx-auto">
        <button onClick={() => router.push('/')} className="text-sm font-bold tracking-widest text-gray-400 hover:text-white transition-colors">
          ← PORTERFUL
        </button>
        <span className="text-xs text-gray-600 tracking-widest uppercase">Land Division</span>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-8 pb-16 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-900/30 border border-green-800/30 rounded-full text-sm text-green-400 mb-6">
          <Map size={14} />
          Land Division
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
          Land is <span className="text-green-400">Freedom</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Proprietary land intelligence. Find off-market deals, score parcels, and acquire land before anyone else knows it exists.
        </p>
      </section>

      {/* NLDS Feature Card */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-green-900/20 to-green-950/40 border border-green-900/50 rounded-2xl p-8">
          {/* Status */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-green-400">Live</span>
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold mb-1">National Land Data System™</h2>
          <p className="text-gray-400 text-sm mb-4">Every parcel. Every opportunity.</p>

          {/* Description */}
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            A proprietary land intelligence platform that scrapes, scores, and surfaces off-market deals before they hit the public market. Built for investors, developers, and anyone who knows land is the ultimate asset class.
          </p>

          {/* Features */}
          <ul className="grid grid-cols-2 gap-2 mb-6">
            {['30+ proprietary listings', '5-tier acquisition system', 'Automated deal drops (Mondays)', 'Parcel intelligence scoring', 'Group co-investment deals', '4-tier unlock ($5–$100)'].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-green-400 text-xs">✓</span>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href="https://national-land-data-system.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors text-sm"
          >
            <ExternalLink size={14} />
            Open NLDS →
          </a>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="px-6 pb-20 max-w-xl mx-auto">
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">Get Early Access to Land Deals</h3>
            <p className="text-gray-400 text-sm">Join the interest list for off-market land opportunities and founding member pricing.</p>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-900/30 rounded-full mb-4">
                <CheckCircle className="text-green-400" size={24} />
              </div>
              <p className="text-green-400 font-bold">You&apos;re on the list.</p>
              <p className="text-gray-500 text-sm mt-2">We&apos;ll be in touch when opportunities match your criteria.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" placeholder="First Name" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-green-800 focus:outline-none text-sm"
                  value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                <input required type="text" placeholder="Last Name" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-green-800 focus:outline-none text-sm"
                  value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
              <input required type="email" placeholder="Email" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-green-800 focus:outline-none text-sm"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <input type="tel" placeholder="Phone (optional)" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-green-800 focus:outline-none text-sm"
                value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <textarea placeholder="What kind of land are you looking for? (state, acreage, budget...)" className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-green-800 focus:outline-none text-sm h-24 resize-none"
                value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              <button type="submit" disabled={submitting} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {submitting ? 'Submitting...' : 'Join the List →'}
              </button>
            </form>
          )}
          <p className="text-center text-gray-600 text-xs mt-4">No spam. No payment required. Just early access.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-6 py-8 text-center text-xs text-gray-600">
        Porterful Land Division · Powered by the Ecosystem
      </footer>
    </div>
  )
}