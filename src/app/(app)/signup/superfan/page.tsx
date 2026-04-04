'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, Gift, Share2, Wallet, ArrowRight, Check } from 'lucide-react'

const SUPERFAN_BENEFITS = [
  { icon: Share2, title: 'Share Links', description: 'Get your unique referral link for every artist and product' },
  { icon: Wallet, title: 'Earn on Sales', description: '5% on artist merch, 3% on marketplace, 10% on Premium' },
  { icon: Star, title: 'Climb Tiers', description: 'More referrals = higher rates = more earnings' },
  { icon: Gift, title: 'Exclusive Access', description: 'Early releases, artist chats, limited merch drops' },
]

const TIERS = [
  { name: 'Supporter', referrals: 0, rate: '2%', color: 'bg-gray-500' },
  { name: 'Superfan', referrals: 10, rate: '5%', color: 'bg-purple-500' },
  { name: 'Champion', referrals: 50, rate: '8%', color: 'bg-blue-500' },
  { name: 'Patron', referrals: 100, rate: '10%', color: 'bg-[var(--pf-orange)]' },
]

export default function SuperfanSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    favoriteArtists: [] as string[],
    agreeTerms: false,
  })
  const [loading, setLoading] = useState(false)

  const handleArtistToggle = (artistId: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteArtists: prev.favoriteArtists.includes(artistId)
        ? prev.favoriteArtists.filter(id => id !== artistId)
        : [...prev.favoriteArtists, artistId]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    // TODO: Implement Supabase auth
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium mb-6">
            <Star size={16} />
            SUPERFAN PROGRAM
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Earn While You <span className="text-purple-400">Support</span>
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Promote artists you love. Earn from every sale. Build wealth in the artist economy.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {SUPERFAN_BENEFITS.map((benefit, i) => (
            <div key={i} className="pf-card p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <benefit.icon className="text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tiers */}
        <div className="pf-card p-6 mb-12">
          <h2 className="text-xl font-bold mb-4 text-center">Climb the Tiers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TIERS.map((tier, i) => (
              <div key={i} className={`text-center p-4 rounded-xl ${tier.color}/10 border border-${tier.color}/30`}>
                <p className="text-sm text-[var(--pf-text-muted)] uppercase tracking-wider mb-1">{tier.name}</p>
                <p className="text-2xl font-bold mb-2">{tier.rate}</p>
                <p className="text-xs text-[var(--pf-text-muted)]">
                  {tier.referrals === 0 ? 'Start here' : `${tier.referrals}+ referrals`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Signup Form */}
        <div className="pf-card p-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-purple-500 text-white' : 'bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
                }`}>
                  {step > s ? <Check size={16} /> : s}
                </div>
                {s < 3 && <div className={`w-16 h-0.5 ${step > s ? 'bg-purple-500' : 'bg-[var(--pf-border)]'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Account */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  className="pf-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  className="pf-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="pf-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.email || !formData.password}
                className="pf-btn pf-btn-primary w-full"
              >
                Continue <ArrowRight className="inline ml-2" size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Artists */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Who do you want to support?</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">Your earnings support these artists</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['O D Music', 'Alex Rivers', 'Maya Sol', 'Jordan Blake', 'Luna Wave', 'Cruz Martinez'].map((artist) => (
                  <button
                    key={artist}
                    onClick={() => handleArtistToggle(artist)}
                    className={`p-4 rounded-xl border transition-all ${
                      formData.favoriteArtists.includes(artist)
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-[var(--pf-border)] hover:border-purple-500/50'
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[var(--pf-surface)] flex items-center justify-center text-2xl">
                      🎤
                    </div>
                    <p className="font-medium text-sm">{artist}</p>
                    {formData.favoriteArtists.includes(artist) && (
                      <Check className="mx-auto mt-1 text-purple-400" size={14} />
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(3)}
                disabled={formData.favoriteArtists.length === 0}
                className="pf-btn pf-btn-primary w-full"
              >
                Continue <ArrowRight className="inline ml-2" size={16} />
              </button>
            </div>
          )}

          {/* Step 3: Terms */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Almost there!</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">Your referral code will be generated</p>
              </div>
              <div className="pf-card p-4 bg-[var(--pf-bg)]">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <p className="font-medium">I agree to the Superfan Terms</p>
                    <p className="text-[var(--pf-text-muted)]">
                      I understand that I earn commissions on referrals and will promote artists authentically.
                    </p>
                  </div>
                </label>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!formData.agreeTerms || loading}
                className="pf-btn pf-btn-primary w-full"
              >
                {loading ? 'Creating Account...' : 'Become a Superfan'}
              </button>
              <p className="text-center text-sm text-[var(--pf-text-muted)]">
                Already have an account? <Link href="/login" className="text-purple-400 hover:underline">Sign in</Link>
              </p>
            </div>
          )}
        </div>

        {/* Other Signup Options */}
        <div className="mt-8 text-center">
          <p className="text-[var(--pf-text-muted)] mb-4">Looking to join as something else?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/signup?role=artist" className="px-4 py-2 rounded-full bg-[var(--pf-surface)] hover:bg-[var(--pf-surface-hover)] transition-colors text-sm">
              🎤 Artist
            </Link>
            <Link href="/signup?role=business" className="px-4 py-2 rounded-full bg-[var(--pf-surface)] hover:bg-[var(--pf-surface-hover)] transition-colors text-sm">
              🏪 Business
            </Link>
            <Link href="/signup?role=brand" className="px-4 py-2 rounded-full bg-[var(--pf-surface)] hover:bg-[var(--pf-surface-hover)] transition-colors text-sm">
              🏢 Brand
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}