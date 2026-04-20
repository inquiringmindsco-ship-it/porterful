'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Music, Store, Building2, Star, Globe, Youtube, Check, ArrowRight, ArrowLeft } from 'lucide-react'

const ROLES = {
  supporter: {
    icon: Star,
    label: 'Fan',
    tagline: 'Support independent artists directly',
    color: 'from-yellow-500 to-orange-500',
  },
  artist: {
    icon: Music,
    label: 'Artist',
    tagline: 'Upload tracks, set prices, keep 80%',
    color: 'from-orange-500 to-red-500',
  },
  business: {
    icon: Store,
    label: 'Business',
    tagline: 'Merch fulfillment without inventory',
    color: 'from-blue-500 to-purple-500',
  },
  brand: {
    icon: Building2,
    label: 'Brand',
    tagline: 'Sponsor releases, reach new audiences',
    color: 'from-green-500 to-teal-500',
  },
}

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form fields
  const [role, setRole] = useState('supporter')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [youtube, setYoutube] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const nextPath = (() => {
    const next = searchParams.get('next')
    if (!next || !next.startsWith('/') || next.startsWith('//')) return ''
    return next
  })()

  // Pre-select role from URL param
  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam && ROLES[roleParam as keyof typeof ROLES]) {
      setRole(roleParam)
    }
  }, [searchParams])

  const validateStep = () => {
    if (step === 1) {
      if (!role) {
        setError('Please select your role')
        return false
      }
    }
    if (step === 2) {
      if (!name.trim()) {
        setError('Please enter your name')
        return false
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email')
        return false
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    setError('')
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create account via API (skips email confirmation)
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, youtube, website, industry }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create account')
        setLoading(false)
        return
      }

      // Auto sign in after successful signup
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const loginData = await loginRes.json()

      if (loginRes.ok) {
        if (nextPath) {
          router.push(nextPath)
        } else if (role === 'artist') {
          router.push('/dashboard/artist')
        } else {
          router.push('/dashboard')
        }
      } else {
        // Account created but login failed - redirect to login with success message
        router.push('/login?created=true')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const currentRole = ROLES[role as keyof typeof ROLES]

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s < step ? 'bg-green-500 text-white' :
                s === step ? 'bg-[var(--pf-orange)] text-white' :
                'bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
              }`}>
                {s < step ? <Check size={16} /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 ${s < step ? 'bg-green-500' : 'bg-[var(--pf-border)]'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1">
            {step === 1 ? 'Join Porterful' : step === 2 ? 'Create Your Account' : 'Almost Done!'}
          </h1>
          <p className="text-[var(--pf-text-secondary)]">
            {step === 1 ? 'Tell us who you are' : step === 2 ? 'Enter your details' : `You're signing up as a ${currentRole.label}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--pf-text-secondary)] mb-4">Select the option that describes you best:</p>
              {Object.entries(ROLES).map(([value, config]) => {
                const Icon = config.icon
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      role === value
                        ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10 ring-2 ring-[var(--pf-orange)]/30'
                        : 'border-[var(--pf-border)] hover:border-[var(--pf-border-hover)] bg-[var(--pf-surface)]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{config.label}</h3>
                        <p className="text-sm text-[var(--pf-text-muted)]">{config.tagline}</p>
                      </div>
                    </div>
                  </button>
                )
              })}

              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 pf-btn pf-btn-primary py-4 flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: Basic Info */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Role reminder */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--pf-surface)] border border-[var(--pf-border)]">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentRole.color} flex items-center justify-center`}>
                  <currentRole.icon className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm text-[var(--pf-text-muted)]">Signing up as</p>
                  <p className="font-semibold">{currentRole.label}</p>
                </div>
                <button type="button" onClick={handleBack} className="ml-auto text-sm text-[var(--pf-orange)]">
                  Change
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {role === 'business' || role === 'brand' ? 'Business Name' : 'Your Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                  placeholder={role === 'business' || role === 'brand' ? 'Company name' : 'Full name'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-4 border border-[var(--pf-border)] rounded-lg font-medium hover:border-[var(--pf-orange)] transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 pf-btn pf-btn-primary py-4 flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Role-specific info */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Artist: YouTube */}
              {role === 'artist' && (
                <div className="p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Youtube size={18} className="text-red-500" />
                    <label className="text-sm font-medium">YouTube Channel (optional)</label>
                  </div>
                  <input
                    type="url"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                    placeholder="https://youtube.com/@yourchannel"
                  />
                  <p className="mt-2 text-xs text-[var(--pf-text-muted)]">
                    Connect your YouTube to import your music videos automatically.
                  </p>
                </div>
              )}

              {/* Business/Brand: Website + Industry */}
              {(role === 'business' || role === 'brand') && (
                <div className="space-y-4 p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)]">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={16} />
                      <label className="text-sm font-medium">Website</label>
                    </div>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      required
                      className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      required
                      className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                    >
                      <option value="">Select your industry...</option>
                      <option value="music">Music & Entertainment</option>
                      <option value="fashion">Fashion & Apparel</option>
                      <option value="tech">Technology</option>
                      <option value="food">Food & Beverage</option>
                      <option value="health">Health & Wellness</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="nonprofit">Non-Profit</option>
                      <option value="agency">Marketing Agency</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Supporter: Just confirm */}
              {role === 'supporter' && (
                <div className="p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)]">
                  <p className="text-sm text-[var(--pf-text-secondary)]">
                    As a fan, you'll be able to:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" /> Discover new music from independent artists
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" /> Support artists directly with no middleman
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" /> Earn rewards by sharing your favorite artists
                    </li>
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-4 border border-[var(--pf-border)] rounded-lg font-medium hover:border-[var(--pf-orange)] transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 pf-btn pf-btn-primary py-4 flex items-center justify-center gap-2"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-sm text-[var(--pf-text-muted)] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--pf-orange)] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
