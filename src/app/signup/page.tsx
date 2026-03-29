'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/providers'
import { useRouter } from 'next/navigation'
import { Music, Store, Building2, Star, Globe, Youtube } from 'lucide-react'
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa'

const ROLE_CONFIG = {
  supporter: {
    icon: Star,
    label: 'Fan',
    description: 'Support artists you love',
    tagline: 'Support independent artists directly',
  },
  artist: {
    icon: Music,
    label: 'Artist',
    description: 'Sell your music & merch',
    tagline: 'Upload tracks, set prices, keep 80%',
  },
  business: {
    icon: Store,
    label: 'Business',
    description: 'Print-on-demand store',
    tagline: 'Merch fulfillment without inventory',
  },
  brand: {
    icon: Building2,
    label: 'Brand',
    description: 'Connect with artists',
    tagline: 'Sponsor releases, reach new audiences',
  },
}

export default function SignupPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('supporter')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Role-specific fields
  const [youtube, setYoutube] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!supabase) {
        setError('Database not configured. Please run the SQL setup first.')
        setLoading(false)
        return
      }

      // Build metadata based on role
      const metadata: Record<string, string> = { name, role }
      
      if (role === 'artist' && youtube) {
        metadata.youtube_url = youtube
      }
      if ((role === 'business' || role === 'brand') && website) {
        metadata.website = website
        metadata.industry = industry
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('rate limit') || signUpError.message.includes('Email rate limit')) {
          setError('Too many signup attempts right now. Please wait a few minutes and try again.')
        } else {
          setError(signUpError.message)
        }
        return
      }

      if (data.user) {
        // Create profile — use correct column names matching the schema
        const profileData: Record<string, any> = {
          id: data.user.id,
          email: email,
          name: name,
          role: role,
        }

        if (role === 'artist' && youtube) {
          profileData.youtube_url = youtube
        }
        if ((role === 'business' || role === 'brand') && website) {
          profileData.website = website
          profileData.industry = industry
        }
        
        const { error: profileError } = await supabase.from('profiles').insert(profileData)
        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        // If artist, also create an artist record
        if (role === 'artist') {
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substr(2, 4)
          const { error: artistError } = await supabase.from('artists').insert({
            id: data.user.id,
            slug: slug,
            bio: '',
            location: '',
          })
          if (artistError) {
            console.error('Artist creation error:', artistError)
          }
        }
        
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: provider === 'google' ? 'https://www.googleapis.com/auth/youtube.readonly' : undefined
        }
      })
      
      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'OAuth failed')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="pf-card p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
          <p className="text-[var(--pf-text-secondary)] mb-6">
            We sent a confirmation link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-[var(--pf-text-muted)]">
            Click the link to verify your account, then you can log in.
          </p>
        </div>
      </div>
    )
  }

  const currentRole = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-[var(--pf-text-secondary)]">Join the artist economy</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">I am a...</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(ROLE_CONFIG).map(([value, config]) => {
                const Icon = config.icon
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      role === value
                        ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10'
                        : 'border-[var(--pf-border)] hover:border-[var(--pf-border-hover)]'
                    }`}
                  >
                    <Icon className={`mx-auto mb-2 ${role === value ? 'text-[var(--pf-orange)]' : ''}`} size={24} />
                    <span className="text-sm font-medium">{config.label}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-sm text-[var(--pf-text-muted)]">
              {currentRole.tagline}
            </p>
          </div>

          {/* Basic Fields */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {role === 'business' || role === 'brand' ? 'Business Name' : 'Full Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
              placeholder={role === 'business' || role === 'brand' ? 'Your company name' : 'Your name'}
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

          {/* Role-Specific Fields */}
          
          {/* Artist: YouTube */}
          {role === 'artist' && (
            <div className="p-4 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)]">
              <div className="flex items-center gap-2 mb-3">
                <Youtube size={18} className="text-red-500" />
                <label className="text-sm font-medium">YouTube Channel</label>
              </div>
              <input
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--pf-orange)]"
                placeholder="https://youtube.com/@yourchannel"
              />
              <p className="mt-2 text-xs text-[var(--pf-text-muted)]">
                Connect your YouTube channel so fans can find your music videos on Porterful.
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
                  className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--pf-orange)]"
                  placeholder="https://yourbusiness.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                  className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--pf-orange)]"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full pf-btn pf-btn-primary py-4 text-lg"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--pf-border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--pf-bg)] text-[var(--pf-text-muted)]">or continue with</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-[var(--pf-border)] hover:border-[var(--pf-border-hover)] transition-colors bg-[var(--pf-bg)]"
            >
              <FaGoogle className="text-lg" />
              <span className="text-sm font-medium">Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn('apple')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-[var(--pf-border)] hover:border-[var(--pf-border-hover)] transition-colors bg-[var(--pf-bg)]"
            >
              <FaApple className="text-lg" />
              <span className="text-sm font-medium">Apple</span>
            </button>
          </div>

          <p className="text-center text-sm text-[var(--pf-text-muted)]">
            Already have an account?{' '}
            <a href="/login" className="text-[var(--pf-orange)] hover:underline">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  )
}
