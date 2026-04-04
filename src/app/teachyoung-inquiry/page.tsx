'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TeachYoungInquiryPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', interest: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Inquire form — no real backend yet, just show success state
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-widest" style={{ color: '#3d3d3d', letterSpacing: '0.35em' }}>
          PORTERFUL
        </Link>
        <Link href="/" className="text-xs tracking-widest uppercase" style={{ color: '#3a3a3a' }}>
          ← Back
        </Link>
      </header>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-xl text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-8" style={{ borderColor: '#ec489940', color: '#ec4899', background: '#ec489910' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            <span className="text-xs uppercase tracking-widest font-medium">Coming Soon</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide">
            TeachYoung<span style={{ color: '#ec4899' }}>.</span>
          </h1>
          <p className="text-lg mb-3" style={{ color: '#9a9a9a' }}>
            Homeschool. On your terms.
          </p>
          <p className="text-base leading-relaxed mb-8" style={{ color: '#6a6a6a' }}>
            TeachYoung is a private homeschool platform built for families who want more than what traditional schooling offers.
            ARCHTEXT™ — our proprietary teaching system — adapts to how each child learns.
            Math, reading, science, social studies, art, and music for ages 5–14.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-10 text-left max-w-md mx-auto">
            {[
              ['Proprietary ARCHTEXT™ system', 'Lessons adapt to each child'],
              ['Age-appropriate dashboards', 'Honor (ages 5–9) · Noble (ages 10–14)'],
              ['6 core subjects', 'Math · Reading · Science · Social Studies · Art · Music'],
              ['Parent progress tracking', 'See exactly what your child is learning'],
            ].map(([title, desc]) => (
              <div key={title} className="p-3 rounded-lg" style={{ background: '#111', border: '1px solid #222' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#e0e0e0' }}>{title}</p>
                <p className="text-xs" style={{ color: '#555' }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Public inquiry form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="text-left max-w-md mx-auto p-6 rounded-xl" style={{ background: '#0d0d0d', border: '1px solid #222' }}>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: '#ec4899' }}>
                Request Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: '#555' }}>Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                    style={{ background: '#161616', border: '1px solid #2a2a2a', color: '#e0e0e0' }}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: '#555' }}>Email</label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                    style={{ background: '#161616', border: '1px solid #2a2a2a', color: '#e0e0e0' }}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: '#555' }}>Child's Age Range</label>
                  <select
                    required
                    value={form.interest}
                    onChange={e => setForm({ ...form, interest: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none appearance-none cursor-pointer"
                    style={{ background: '#161616', border: '1px solid #2a2a2a', color: '#888' }}
                  >
                    <option value="">Select age range</option>
                    <option value="5-7">5 – 7 years old</option>
                    <option value="8-10">8 – 10 years old</option>
                    <option value="11-14">11 – 14 years old</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: '#555' }}>Anything else? (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Questions, goals, specific needs..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none transition-all"
                    style={{ background: '#161616', border: '1px solid #2a2a2a', color: '#e0e0e0' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all"
                  style={{
                    background: loading ? '#2a1a25' : '#ec489930',
                    border: '1px solid #ec489940',
                    color: '#ec4899',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Sending...' : 'Request Information'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center p-8 rounded-xl max-w-md mx-auto" style={{ background: '#0d0d0d', border: '1px solid #ec489930' }}>
              <div className="text-4xl mb-4">✓</div>
              <h3 className="text-lg font-bold mb-2">Request received.</h3>
              <p className="text-sm" style={{ color: '#6a6a6a' }}>
                We will be in touch when TeachYoung opens to more families. Thank you.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 text-center" style={{ color: '#3a3a3a' }}>
        <p className="text-xs uppercase tracking-widest">
          Part of the Porterful Ecosystem
        </p>
      </footer>
    </div>
  )
}
