'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Send, User, Briefcase, GraduationCap, Clock, Star } from 'lucide-react'

export default function InternPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    school: '',
    year: '',
    program: '',
    linkedin: '',
    website: '',
    why: '',
    skills: '',
    availability: '',
    interest: '',
  })

  const handleSubmit = async () => {
    setSubmitting(true)
    // Simulate submission
    await new Promise(r => setTimeout(r, 1500))
    setSubmitted(true)
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--pf-bg)] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Application Received</h1>
          <p className="text-[var(--pf-text-secondary)] mb-6">
            We're reviewing your application and will be in touch within 48 hours. Be ready to build.
          </p>
          <Link href="/law" className="pf-btn pf-btn-primary">
            Back to Porterful Law
          </Link>
        </div>
      </div>
    )
  }

  const inputClass = 'w-full px-4 py-3 bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-xl text-white placeholder:text-[var(--pf-text-muted)] focus:outline-none focus:border-[var(--pf-orange)] transition-colors'

  return (
    <div className="min-h-screen bg-[var(--pf-bg)]">
      {/* Header */}
      <div className="border-b border-[var(--pf-border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/law" className="flex items-center gap-2 text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors">
            <ArrowLeft size={18} /> Back to Porterful Law
          </Link>
          <div className="text-sm text-[var(--pf-text-muted)]">Porterful Internship Program</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
            <Briefcase size={14} />
            Now Accepting Applications
          </div>
          <h1 className="text-4xl font-bold mb-3">Join the Porterful Intern Program</h1>
          <p className="text-[var(--pf-text-secondary)]">
            Real work. Real products. Real credits. Get in the room.
          </p>
        </div>

        {/* What you get */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {[
            { icon: Star, label: 'School credit or portfolio credit', color: 'text-yellow-400' },
            { icon: Briefcase, label: 'Work on live products used by real people', color: 'text-[var(--pf-orange)]' },
            { icon: Clock, label: 'Flexible hours. Remote. Async-first.', color: 'text-blue-400' },
            { icon: GraduationCap, label: 'Exposure to founders, lawyers, artists', color: 'text-purple-400' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-[var(--pf-surface)] border border-[var(--pf-border)]">
              <Icon size={20} className={color} />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className='block text-sm font-medium mb-2'>Full Name *</label>
              <input type="text" className={inputClass} placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Email *</label>
              <input type="email" className={inputClass} placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className='block text-sm font-medium mb-2'>School / Program *</label>
              <input type="text" className={inputClass} placeholder="e.g. Harvard, Launch Code, Self-taught" value={form.school} onChange={e => setForm({ ...form, school: e.target.value })} />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Year / Level</label>
              <select className={inputClass} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                <option value="">Select</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Gap Year">Gap Year</option>
                <option value="Recent Grad">Recent Graduate</option>
                <option value="Career Switcher">Career Switcher</option>
              </select>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>What are you studying / interested in? *</label>
            <input type="text" className={inputClass} placeholder="e.g. Computer Science, Design, Marketing, Business..." value={form.program} onChange={e => setForm({ ...form, program: e.target.value })} />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>LinkedIn or Portfolio URL</label>
            <input type="text" className={inputClass} placeholder="linkedin.com/in/you or your portfolio link" value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Skills & Tools you're comfortable with</label>
            <input type="text" className={inputClass} placeholder="e.g. Figma, React, Notion, copywriting, social media..." value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>How many hours can you commit per week? *</label>
            <select className={inputClass} value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}>
              <option value="">Select hours</option>
              <option value="5-10">5–10 hours/week</option>
              <option value="10-15">10–15 hours/week</option>
              <option value="15-20">15–20 hours/week</option>
              <option value="20+">20+ hours/week (full-time option)</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Why Porterful? What do you want to build? *</label>
            <textarea
              className={inputClass + ' min-h-[120px] resize-none'}
              placeholder="Tell us about your goals, what you're interested in, and what you hope to work on..."
              value={form.why}
              onChange={e => setForm({ ...form, why: e.target.value })}
              maxLength={500}
            />
            <div className='text-right text-xs text-[var(--pf-text-muted)] mt-1'>{form.why.length}/500</div>
          </div>

          <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-4">
            <p className="text-sm text-[var(--pf-text-secondary)]">
              <span className="text-[var(--pf-orange)] font-medium">No GPA required.</span>{' '}
              We're looking for people who want to build. Show us that. Links to projects, writing, music, art, anything you've shipped — more valuable than a resume.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.name || !form.email || !form.program || !form.availability || !form.why || submitting}
            className="w-full py-4 bg-[var(--pf-orange)] text-white font-bold rounded-xl hover:bg-[var(--pf-orange-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
            {!submitting && <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
