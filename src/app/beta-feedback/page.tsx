'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Send, CheckCircle } from 'lucide-react'

export default function BetaFeedbackPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    whatIsPorterful: '',
    mostConfusing: '',
    wouldUseAgain: '',
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Submit to API
    // For now, just log and show success
    console.log('Beta feedback:', formData)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-24">
        <div className="pf-container max-w-xl text-center py-20">
          <CheckCircle size={64} className="mx-auto text-emerald-400 mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Thank You</h1>
          <p className="text-[var(--pf-text-secondary)] mb-8">
            Your feedback helps us build a better Porterful. We'll review your responses and reach out if we have follow-up questions.
          </p>
          <Link
            href="/"
            className="pf-btn pf-btn-primary inline-flex items-center gap-2"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-24">
      <div className="pf-container max-w-2xl py-12">
        {/* Beta Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--pf-orange)]/30 bg-[var(--pf-orange)]/10 px-4 py-1.5 text-sm font-medium text-[var(--pf-orange)]">
          <span className="h-2 w-2 rounded-full bg-[var(--pf-orange)] animate-pulse" />
          Founding Beta Feedback
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Help Us Improve</h1>
        <p className="text-[var(--pf-text-secondary)] mb-10">
          You're a Founding Beta member. Your honest feedback shapes what Porterful becomes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Question 1 */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white">
              1. What do you think Porterful is?
              <span className="text-[var(--pf-text-muted)] font-normal"> (one sentence)</span>
            </label>
            <textarea
              required
              value={formData.whatIsPorterful}
              onChange={(e) => setFormData({ ...formData, whatIsPorterful: e.target.value })}
              placeholder="Porterful is a platform where..."
              className="w-full rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 text-sm text-white placeholder:text-[var(--pf-text-muted)] focus:border-[var(--pf-orange)] focus:outline-none transition-colors min-h-[100px] resize-y"
            />
          </div>

          {/* Question 2 */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white">
              2. What confused you most?
              <span className="text-[var(--pf-text-muted)] font-normal"> (be specific)</span>
            </label>
            <textarea
              required
              value={formData.mostConfusing}
              onChange={(e) => setFormData({ ...formData, mostConfusing: e.target.value })}
              placeholder="I got stuck when trying to... / I didn't understand why..."
              className="w-full rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 text-sm text-white placeholder:text-[var(--pf-text-muted)] focus:border-[var(--pf-orange)] focus:outline-none transition-colors min-h-[120px] resize-y"
            />
          </div>

          {/* Question 3 */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white">
              3. What would make you use it again?
              <span className="text-[var(--pf-text-muted)] font-normal"> (feature, fix, or feeling)</span>
            </label>
            <textarea
              required
              value={formData.wouldUseAgain}
              onChange={(e) => setFormData({ ...formData, wouldUseAgain: e.target.value })}
              placeholder="If Porterful had... / I would come back if..."
              className="w-full rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 text-sm text-white placeholder:text-[var(--pf-text-muted)] focus:border-[var(--pf-orange)] focus:outline-none transition-colors min-h-[120px] resize-y"
            />
          </div>

          {/* Email (optional) */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white">
              Email <span className="text-[var(--pf-text-muted)] font-normal">(optional — if you want us to follow up)</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 text-sm text-white placeholder:text-[var(--pf-text-muted)] focus:border-[var(--pf-orange)] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="pf-btn pf-btn-primary inline-flex items-center gap-2 w-full justify-center"
          >
            <Send size={18} />
            Submit Feedback
          </button>

          <p className="text-xs text-center text-[var(--pf-text-muted)]">
            All feedback is reviewed by the Porterful team. No automated responses.
          </p>
        </form>
      </div>
    </div>
  )
}
