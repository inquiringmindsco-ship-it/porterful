'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const supportEmail = 'support@porterful.com'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSubmitted(true)
      } else {
        setError(data.error || `Failed to send. Email ${supportEmail} directly.`)
      }
    } catch {
      setError(`Failed to send. Email ${supportEmail} directly.`)
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] px-6 py-16 text-[var(--pf-text)]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Contact Porterful</h1>
          <p className="text-[var(--pf-text-secondary)]">
            Questions, order help, or partnership requests. We respond at the same address every time.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-green-500/30 bg-[var(--pf-surface)] p-8 text-center">
            <div className="mb-4 text-6xl">✉️</div>
            <h2 className="mb-2 text-2xl font-bold text-green-400">Message Sent</h2>
            <p className="mb-6 text-[var(--pf-text-secondary)]">
              We’ll get back to you within 24-48 hours.
            </p>
            <Link href="/" className="text-[var(--pf-orange)] hover:underline">
              ← Back to home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 transition-colors focus:border-[var(--pf-orange)] focus:outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 transition-colors focus:border-[var(--pf-orange)] focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 transition-colors focus:border-[var(--pf-orange)] focus:outline-none"
              >
                <option value="">Select a topic</option>
                <option value="artist">Artist inquiry</option>
                <option value="order">Order support</option>
                <option value="partnership">Partnership request</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Message</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full resize-none rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 transition-colors focus:border-[var(--pf-orange)] focus:outline-none"
                placeholder="Tell us more..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[var(--pf-orange)] py-3 font-semibold text-white transition-colors hover:bg-[var(--pf-orange-dark)] disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>

            <p className="text-center text-sm text-[var(--pf-text-muted)]">
              Or email us directly at{' '}
              <a href={`mailto:${supportEmail}`} className="text-[var(--pf-orange)] hover:underline">
                {supportEmail}
              </a>
            </p>
          </form>
        )}

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 text-center">
            <div className="mb-2 text-3xl">✉️</div>
            <h3 className="mb-1 font-semibold">Email</h3>
            <p className="text-sm text-[var(--pf-text-muted)]">{supportEmail}</p>
          </div>
          <div className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 text-center">
            <div className="mb-2 text-3xl">🎵</div>
            <h3 className="mb-1 font-semibold">Music</h3>
            <p className="text-sm text-[var(--pf-text-muted)]">Questions about releases or listening? Use the form above.</p>
          </div>
          <div className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 text-center">
            <div className="mb-2 text-3xl">🛍️</div>
            <h3 className="mb-1 font-semibold">Store</h3>
            <p className="text-sm text-[var(--pf-text-muted)]">Need help with a purchase? We’ll handle it by email.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
