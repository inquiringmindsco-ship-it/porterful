'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/app/providers'
import { useRouter } from 'next/navigation'

export default function ApplyFormPage() {
  const { user } = useSupabase()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<'approved' | 'pending_review' | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [applicationId, setApplicationId] = useState<string | null>(null)

  const [form, setForm] = useState({
    stage_name: '',
    genre: '',
    city: '',
    bio: '',
    email: '',
    phone: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '',
    soundcloud: '',
    spotify: '',
    apple_music: '',
    has_cover_image: false,
    has_avatar: false,
    cover_image_url: '',
    avatar_url: '',
    agree_terms: false,
    agree_exclusive: false,
    add_likeness: false,
  })

  const handleSubmit = async () => {
    if (!user) {
      router.push('/signup?role=artist')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/artist-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, user_id: user.id }),
      })

      const data = await res.json()
      if (res.ok) {
        setSubmitted(true)
        setApplicationStatus(data.status === 'approved' ? 'approved' : 'pending_review')
        setSubmitMessage(data.message || '')
        setApplicationId(data.application?.id || null)
      } else {
        setSubmitError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setSubmitError('Connection error. Please check your internet connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--pf-bg)] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {applicationStatus === 'approved' ? (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-3">You&apos;re Approved!</h1>
              <p className="text-[var(--pf-text-secondary)] mb-4">
                {submitMessage || 'Your artist page has been created. Head to your dashboard to set up tracks, pricing, and your profile.'}
              </p>
              <p className="text-sm text-[var(--pf-text-muted)] mb-8">
                {applicationId ? `Application ID: ${applicationId}` : 'Welcome to Porterful. The platform is yours.'}
              </p>

              {/* Show if likeness was added during application */}
              {form.add_likeness && (
                <div className="mb-6 p-4 rounded-xl bg-[#c6a85a]/10 border border-[#c6a85a]/30 text-left">
                  <p className="text-sm text-[#c6a85a] font-medium mb-1">Likeness™ protection added</p>
                  <p className="text-xs text-[var(--pf-text-muted)]">
                    Check your email for next steps to complete your registration at LikenessVerified.com
                  </p>
                </div>
              )}

              {/* Prompt if likeness was NOT added */}
              {!form.add_likeness && (
                <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-[#333333] text-left">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#c6a85a]/20 flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#c6a85a" strokeWidth="2"/>
                        <path d="M9 12l2 2 4-4" stroke="#c6a85a" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-bold mb-1">Get your verified badge</p>
                      <p className="text-xs text-[#aaaaaa]">Protect your voice + likeness. Stand out on your profile. It takes 60 seconds.</p>
                    </div>
                  </div>
                  <a
                    href="https://likenessverified.com/register"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 rounded-xl bg-[#c6a85a] text-[#111] font-bold text-sm hover:bg-[#d4b76a] transition-colors"
                  >
                    Register at LikenessVerified.com →
                  </a>
                  <p className="text-xs text-[#666] mt-2">Porterful rate: $9/year · Regular $12</p>
                </div>
              )}

              <Link href="/dashboard/dashboard" className="pf-btn pf-btn-primary">
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-3">Application Submitted</h1>
              <p className="text-[var(--pf-text-secondary)] mb-6">
                {submitMessage || 'We received your application. Our team will review it and get back to you within 24–48 hours.'}
              </p>
              <p className="text-sm text-[var(--pf-text-muted)] mb-8">
                {applicationId ? `Application ID: ${applicationId} — we will notify you when your artist page is ready.` : 'You will be notified when your artist page goes live.'}
              </p>
              <Link href="/" className="pf-btn pf-btn-primary">
                Back to Home
              </Link>
            </>
          )}
        </div>
      </div>
    )
  }

  const inputClass = 'w-full px-4 py-3 bg-[var(--pf-bg-secondary)] border border-[var(--pf-border)] rounded-xl text-white placeholder:text-[var(--pf-text-muted)] focus:outline-none focus:border-[var(--pf-orange)] transition-colors'
  const labelClass = 'block text-sm font-medium mb-2'

  const validateStep = (s: number): boolean => {
    const errors: Record<string, string> = {}
    if (s === 1) {
      if (!form.stage_name.trim()) errors.stage_name = 'Stage name is required'
      if (!form.genre) errors.genre = 'Please select a genre'
      if (!form.bio.trim()) errors.bio = 'Bio is required'
      else if (form.bio.trim().length < 50) errors.bio = `${50 - form.bio.trim().length} more characters needed for auto-approval`
      if (!form.email.trim()) errors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address'
      if (!form.phone.trim()) errors.phone = 'Phone is required'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  return (
    <div className="min-h-screen bg-[var(--pf-bg)]">
      {/* Header */}
      <div className="border-b border-[var(--pf-border)]">
        <div className="pf-container py-4 flex items-center justify-between">
          <Link href="/apply" className="text-xl font-bold">← Back</Link>
          <div className="text-sm text-[var(--pf-text-muted)]">
            Step {step} of 5
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[var(--pf-bg-secondary)]">
        <div
          className="h-full bg-[var(--pf-orange)] transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="pf-container py-8 max-w-xl mx-auto">
        {/* Step 1: About You */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Tell us about yourself</h1>
            <p className="text-[var(--pf-text-secondary)] mb-6">Step 1 of 5 — Basic info <span className="text-[var(--pf-text-muted)]">(takes about 5 minutes)</span></p>

            <div className="bg-gradient-to-r from-[var(--pf-orange)]/5 to-purple-500/5 border border-[var(--pf-orange)]/10 rounded-xl p-4 mb-8">
              <p className="text-sm text-[var(--pf-text-secondary)]">
                <span className="text-[var(--pf-orange)] font-medium">This is a curated space.</span> Every application is reviewed personally.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Stage Name *</label>
                <input
                  type="text"
                  className={inputClass + (fieldErrors.stage_name ? ' border-red-500' : '')}
                  placeholder="How fans will know you"
                  value={form.stage_name}
                  onChange={e => {
                    setForm({ ...form, stage_name: e.target.value })
                    if (fieldErrors.stage_name) setFieldErrors(f => ({ ...f, stage_name: '' }))
                  }}
                />
                {fieldErrors.stage_name && (
                  <p className="text-xs text-red-400 mt-1">{fieldErrors.stage_name}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Primary Genre *</label>
                <select
                  className={inputClass + (fieldErrors.genre ? ' border-red-500' : '')}
                  value={form.genre}
                  onChange={e => {
                    setForm({ ...form, genre: e.target.value })
                    if (fieldErrors.genre) setFieldErrors(f => ({ ...f, genre: '' }))
                  }}
                >
                  <option value="">Select a genre</option>
                  <option value="Hip-Hop">Hip-Hop / Rap</option>
                  <option value="R&B">R&B / Soul</option>
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Gospel">Gospel / Christian</option>
                  <option value="Latin">Latin</option>
                  <option value="Afrobeats">Afrobeats</option>
                  <option value="Other">Other</option>
                </select>
                {fieldErrors.genre && (
                  <p className="text-xs text-red-400 mt-1">{fieldErrors.genre}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>City *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Where you are based"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>Bio * <span className="text-[var(--pf-text-muted)] font-normal">(50+ chars for auto-approval)</span></label>
                <textarea
                  className={inputClass + ' min-h-[120px] resize-none' + (fieldErrors.bio ? ' border-red-500' : '')}
                  placeholder="Tell fans who you are. Where you are from. What makes your music unique."
                  value={form.bio}
                  onChange={e => {
                    setForm({ ...form, bio: e.target.value })
                    if (fieldErrors.bio) setFieldErrors(f => ({ ...f, bio: '' }))
                  }}
                  maxLength={500}
                />
                <div className={`text-right text-xs mt-1 ${form.bio.length < 50 ? 'text-[var(--pf-text-muted)]' : 'text-green-400'}`}>
                  {form.bio.length}/500 {form.bio.length < 50 ? `(${50 - form.bio.length} more needed)` : '✓ auto-approval eligible'}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--pf-border)]">
                <div className="bg-gradient-to-r from-[var(--pf-orange)]/5 to-purple-500/5 border border-[var(--pf-orange)]/10 rounded-xl p-4 mb-5">
                  <p className="text-sm text-[var(--pf-text-secondary)]">
                    <span className="text-[var(--pf-orange)] font-medium">This is a partnership.</span> If approved, we will need to reach you directly.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input
                      type="email"
                      className={inputClass + (fieldErrors.email ? ' border-red-500' : '')}
                      placeholder="you@example.com"
                      value={form.email || user?.email || ''}
                      onChange={e => {
                        setForm({ ...form, email: e.target.value })
                        if (fieldErrors.email) setFieldErrors(f => ({ ...f, email: '' }))
                      }}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Phone *</label>
                    <input
                      type="tel"
                      className={inputClass + (fieldErrors.phone ? ' border-red-500' : '')}
                      placeholder="(555) 555-5555"
                      value={form.phone}
                      onChange={e => {
                        setForm({ ...form, phone: e.target.value })
                        if (fieldErrors.phone) setFieldErrors(f => ({ ...f, phone: '' }))
                      }}
                    />
                    {fieldErrors.phone && (
                      <p className="text-xs text-red-400 mt-1">{fieldErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {!user && (
                <div className="bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 rounded-xl p-4">
                  <p className="text-sm">
                    You need an account to continue.{" "}
                    <Link href="/signup?role=artist" className="text-[var(--pf-orange)] font-medium hover:underline">
                      Sign up free →
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Social */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Social media links</h1>
            <p className="text-[var(--pf-text-secondary)] mb-8">Step 2 of 5 — Where fans can find you</p>

            <div className="space-y-5">
              {[
                { field: 'instagram', label: 'Instagram', placeholder: '@yourusername' },
                { field: 'youtube', label: 'YouTube', placeholder: '@yourchannel or channel URL' },
                { field: 'tiktok', label: 'TikTok', placeholder: '@yourusername' },
                { field: 'twitter', label: 'Twitter / X', placeholder: '@yourusername' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className={labelClass}>{label}</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder={placeholder}
                    value={form[field as keyof typeof form] as string}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Music Links */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Music platforms</h1>
            <p className="text-[var(--pf-text-secondary)] mb-8">Step 3 of 5 — Where your music lives</p>

            <div className="bg-[var(--pf-surface)] border border-[var(--pf-orange)]/20 rounded-xl p-4 mb-6">
              <p className="text-sm">
                <span className="text-[var(--pf-orange)] font-medium">At least one link required for auto-approval.</span>{' '}
                Leave blank if you don't have any yet — your application will go to manual review.
              </p>
            </div>

            <div className="space-y-5">
              {[
                { field: 'spotify', label: 'Spotify', placeholder: 'Artist profile URL or @username' },
                { field: 'apple_music', label: 'Apple Music', placeholder: 'Artist profile URL' },
                { field: 'soundcloud', label: 'SoundCloud', placeholder: 'Profile URL or @username' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className={labelClass}>{label}</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder={placeholder}
                    value={form[field as keyof typeof form] as string}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                  />
                </div>
              ))}

              <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-4">
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Once approved, you will be able to upload tracks directly to Porterful and set your own prices.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Assets */}
        {step === 4 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Your images</h1>
            <p className="text-[var(--pf-text-secondary)] mb-8">Step 4 of 5 — Help us set up your page</p>

            <div className="space-y-5">
              <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-4">
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Our team will design your artist page. Upload images below if you have them ready.
                </p>
              </div>

              <div>
                <label className={labelClass}>Profile Photo / Avatar</label>
                <input
                  type="url"
                  className={inputClass}
                  placeholder="Link to your photo (IMG, JPEG, PNG)"
                  value={form.avatar_url}
                  onChange={e => setForm({ ...form, avatar_url: e.target.value })}
                />
                <p className="text-xs text-[var(--pf-text-muted)] mt-1">Square image works best (1:1 ratio)</p>
              </div>

              <div>
                <label className={labelClass}>Cover / Banner Image</label>
                <input
                  type="url"
                  className={inputClass}
                  placeholder="Link to your banner image"
                  value={form.cover_image_url}
                  onChange={e => setForm({ ...form, cover_image_url: e.target.value })}
                />
                <p className="text-xs text-[var(--pf-text-muted)] mt-1">Wide image works best (3:1 ratio or similar)</p>
              </div>

              <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-4">
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Do not have images ready? We will create a default page. You can update images once your page is live.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {step === 5 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Review your application</h1>
            <p className="text-[var(--pf-text-secondary)] mb-8">Step 5 of 5 — Submit when ready</p>

            {submitError && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {submitError}
              </div>
            )}

            <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl divide-y divide-[var(--pf-border)] mb-6">
              {[
                { label: 'Stage Name', value: form.stage_name || <span className="text-red-400">Not provided</span> },
                { label: 'Genre', value: form.genre || <span className="text-red-400">Not provided</span> },
                { label: 'City', value: form.city || <span className="text-[var(--pf-text-muted)]">—</span> },
                { label: 'Bio', value: form.bio ? <span className={form.bio.length >= 50 ? 'text-green-400' : 'text-yellow-400'}>{form.bio.length} chars {form.bio.length >= 50 ? '✓' : `(${50 - form.bio.length} more needed)`}</span> : <span className="text-red-400">Not provided</span> },
                { label: 'Email', value: form.email || <span className="text-red-400">Not provided</span> },
                { label: 'Phone', value: form.phone || <span className="text-red-400">Not provided</span> },
                {
                  label: 'Music Link',
                  value: (form.spotify || form.apple_music || form.soundcloud || form.youtube)
                    ? <span className="text-green-400">Provided ✓</span>
                    : <span className="text-yellow-400">None — manual review required</span>,
                },
                {
                  label: 'Social',
                  value: [
                    form.instagram && `IG: @${form.instagram}`,
                    form.youtube && `YT: ${form.youtube}`,
                    form.tiktok && `TT: @${form.tiktok}`,
                    form.twitter && `X: @${form.twitter}`,
                  ].filter(Boolean).join(' · ') || <span className="text-[var(--pf-text-muted)]">None</span>,
                },
                {
                  label: 'Images',
                  value: [
                    form.avatar_url ? 'Avatar ✓' : 'No avatar',
                    form.cover_image_url ? 'Banner ✓' : 'No banner',
                  ].join(' · '),
                },
              ].map(({ label, value }) => (
                <div key={label} className="p-4">
                  <div className="text-xs text-[var(--pf-text-muted)] uppercase tracking-wider mb-1">{label}</div>
                  <div className="font-medium text-sm">{value}</div>
                </div>
              ))}
            </div>

            {(!form.stage_name || !form.genre || !form.bio || !form.email || !form.phone) ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                <p className="text-sm text-yellow-300">
                  <strong>Missing required fields.</strong> Your application will go to manual review. You'll be notified within 24–48 hours once a decision is made.
                </p>
              </div>
            ) : (form.spotify || form.apple_music || form.soundcloud || form.youtube) ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                <p className="text-sm text-green-300">
                  <strong>All auto-approval requirements met.</strong> Your page will be created automatically once submitted.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                <p className="text-sm text-yellow-300">
                  <strong>No music links detected.</strong> Your application will go to manual review. You'll be notified within 24–48 hours.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded border-[var(--pf-border)] bg-[var(--pf-bg-secondary)] accent-[var(--pf-orange)]"
                  checked={form.agree_terms}
                  onChange={e => setForm({ ...form, agree_terms: e.target.checked })}
                />
                <span className="text-sm text-[var(--pf-text-secondary)]">
                  I agree to Porterful's{" "}
                  <Link href="/terms" className="text-[var(--pf-orange)]">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-[var(--pf-orange)]">Privacy Policy</Link>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded border-[var(--pf-border)] bg-[var(--pf-bg-secondary)] accent-[var(--pf-orange)]"
                  checked={form.agree_exclusive}
                  onChange={e => setForm({ ...form, agree_exclusive: e.target.checked })}
                />
                <span className="text-sm text-[var(--pf-text-secondary)]">
                  My music on Porterful will be exclusive to this platform.
                </span>
              </label>

              {/* LIKENESS UPSELL */}
              <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-[#333333] p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#c6a85a]/20 flex items-center justify-center shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#c6a85a" opacity="0.3"/>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#c6a85a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 12l2 2 4-4" stroke="#c6a85a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold text-lg">Protect Your Likeness</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#c6a85a]/20 text-[#c6a85a] text-xs font-medium">$9/yr</span>
                    </div>
                    <p className="text-sm text-[#aaaaaa] leading-relaxed">
                      AI is using artist voices and faces without permission. Before you go live with your brand, register your likeness — get your verification badge and prove it's yours.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mb-4">
                  {['Voice + face registration', 'Legal certificate (PDF)', 'C&D letter templates', 'Evidence vault', 'Verified badge'].map(f => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-[#cccccc]">
                      <span className="text-[#c6a85a]">✓</span> {f}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#888888] mb-4">
                  Porterful rate $9/yr — regular price $12. Secure your likeness before your profile goes live.
                </p>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[#333333] hover:border-[#c6a85a]/50 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[#444] bg-[#222] accent-[#c6a85a]"
                    checked={form.add_likeness}
                    onChange={e => setForm({ ...form, add_likeness: e.target.checked })}
                  />
                  <div>
                    <span className="text-sm text-white font-medium">Add Likeness™ protection</span>
                    <span className="text-xs text-[#888] ml-2">$9/year · Optional</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-10">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3.5 bg-[var(--pf-surface)] border border-[var(--pf-border)] text-white font-medium rounded-xl hover:border-[var(--pf-orange)] transition-colors"
            >
              Back
            </button>
          )}

          {step < 5 ? (
            <button
              onClick={() => {
                if (validateStep(step)) setStep(s => s + 1)
              }}
              className="flex-1 py-3.5 bg-[var(--pf-orange)] text-white font-bold rounded-xl hover:bg-[var(--pf-orange-dark)] transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!form.agree_terms || !form.agree_exclusive || submitting}
              className="flex-1 py-3.5 bg-[var(--pf-orange)] text-white font-bold rounded-xl hover:bg-[var(--pf-orange-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
