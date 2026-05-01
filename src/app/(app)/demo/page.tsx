'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, Music, ShoppingBag, Users, Building2, Sparkles, ArrowRight, Check, DollarSign, TrendingUp, Heart, Upload, BarChart3, Bell, Mail } from 'lucide-react'

const DEMO_TYPES = [
  {
    id: 'artist',
    name: 'Artist',
    icon: Music,
    color: 'from-[var(--pf-orange)] to-orange-600',
    tagline: 'Sell your music & merch directly to fans',
    features: [
      { icon: Upload, text: 'Upload tracks, set your prices' },
      { icon: DollarSign, text: 'Keep the majority of every sale' },
      { icon: Mail, text: 'Notify fans when you drop' },
      { icon: BarChart3, text: 'See plays, sales & earnings' },
    ],
    stats: { plays: '—', earnings: '—', fans: '—' },
    demoRole: 'artist',
  },
  {
    id: 'supporter',
    name: 'Superfan',
    icon: Heart,
    color: 'from-pink-500 to-rose-600',
    tagline: 'Support artists you love directly',
    features: [
      { icon: Music, text: 'Buy music, not streams' },
      { icon: Bell, text: 'Get notified when they drop' },
      { icon: TrendingUp, text: 'Track your impact' },
      { icon: Sparkles, text: 'Earn from your referrals' },
    ],
    stats: { supported: '—', earned: '—', impact: '—' },
    demoRole: 'supporter',
  },
  {
    id: 'brand',
    name: 'Brand',
    icon: Building2,
    color: 'from-purple-500 to-violet-600',
    tagline: 'Connect with independent artists',
    features: [
      { icon: Users, text: 'Browse verified artists' },
      { icon: BarChart3, text: 'See audience insights' },
      { icon: Music, text: 'Sponsor releases' },
      { icon: TrendingUp, text: 'Track campaign results' },
    ],
    stats: { artists: '—', reach: '—', campaigns: '—' },
    demoRole: 'brand',
  },
  {
    id: 'business',
    name: 'Business',
    icon: ShoppingBag,
    color: 'from-blue-500 to-cyan-600',
    tagline: 'Merch & music fulfillment done right',
    features: [
      { icon: ShoppingBag, text: 'Print-on-demand store' },
      { icon: Upload, text: 'Browse products in seconds' },
      { icon: DollarSign, text: 'No upfront inventory' },
      { icon: Truck, text: 'We handle shipping' },
    ],
    stats: { products: '—', orders: '—', profit: '—' },
    demoRole: 'business',
  },
]

function Truck(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  )
}

export default function DemoPage() {
  const [selected, setSelected] = useState<typeof DEMO_TYPES[0] | null>(null)
  const [step, setStep] = useState<'choose' | 'preview'>('choose')

  if (step === 'preview' && selected) {
    return <DemoPreview type={selected} onBack={() => setStep('choose')} />
  }

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)]/10 rounded-full text-[var(--pf-orange)] text-sm font-medium mb-6">
            <Sparkles size={16} />
            Demo Preview
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            See What <span className="text-[var(--pf-orange)]">Porterful</span> Can Do
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Choose your role and see the platform from that perspective. This is what success looks like on Porterful.
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {DEMO_TYPES.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => { setSelected(type); setStep('preview'); }}
                className="group p-6 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl text-left hover:border-[var(--pf-orange)] transition-all hover:shadow-lg hover:shadow-[var(--pf-orange)]/10"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1">{type.name}</h3>
                <p className="text-sm text-[var(--pf-text-muted)] mb-4">{type.tagline}</p>
                <div className="flex items-center gap-2 text-[var(--pf-orange)] text-sm font-medium">
                  See demo <ArrowRight size={14} />
                </div>
              </button>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-[var(--pf-text-muted)] mb-4">
            Ready to join for real?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup?role=artist" className="px-6 py-3 bg-[var(--pf-orange)] text-white rounded-lg font-semibold hover:bg-[var(--pf-orange-dark)] transition-colors">
              Create Your Account
            </Link>
            <Link href="/" className="px-6 py-3 border border-[var(--pf-border)] rounded-lg font-medium hover:border-[var(--pf-orange)] transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function DemoPreview({ type, onBack }: { type: typeof DEMO_TYPES[0]; onBack: () => void }) {
  const Icon = type.icon
  
  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-5xl mx-auto">
        
        {/* Back Button */}
        <button onClick={onBack} className="flex items-center gap-2 text-[var(--pf-text-muted)] hover:text-white mb-8">
          ← Choose different role
        </button>

        {/* Preview Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--pf-surface)] to-[var(--pf-bg)] border border-[var(--pf-border)] p-8 mb-8">
          <div className="absolute top-0 right-0 px-4 py-2 bg-[var(--pf-orange)]/10 text-[var(--pf-orange)] text-sm font-medium rounded-bl-lg">
            Demo Preview
          </div>
          
          <div className="flex items-start gap-6">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center shrink-0`}>
              <Icon size={40} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">{type.name} Dashboard</h2>
              <p className="text-[var(--pf-text-secondary)] mb-4">{type.tagline}</p>
              
              {/* Stats Row */}
              <div className="flex flex-wrap gap-6">
                {Object.entries(type.stats).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-2xl font-bold text-[var(--pf-orange)]">{value}</p>
                    <p className="text-sm text-[var(--pf-text-muted)] capitalize">{key}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <h3 className="text-xl font-bold mb-4">What you get as a {type.name.toLowerCase()}:</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {type.features.map((feature, i) => {
            const FeatureIcon = feature.icon
            return (
              <div key={i} className="flex items-center gap-4 p-4 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-[var(--pf-orange)]/10 flex items-center justify-center shrink-0">
                  <FeatureIcon size={20} className="text-[var(--pf-orange)]" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </div>
            )
          })}
        </div>

        {/* Mock Dashboard Preview */}
        <h3 className="text-xl font-bold mb-4">Your dashboard looks like this:</h3>
        <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-6 mb-8">
          
          {type.id === 'artist' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                  <p className="text-sm text-[var(--pf-text-muted)] mb-1">Earnings</p>
                  <p className="text-3xl font-bold text-green-400">Live data</p>
                  <p className="text-xs text-green-400">Connect your account to see it</p>
                </div>
                <div className="flex-1 p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                  <p className="text-sm text-[var(--pf-text-muted)] mb-1">Fans</p>
                  <p className="text-3xl font-bold">—</p>
                  <p className="text-xs text-green-400">No public count shown</p>
                </div>
              </div>
              <div className="p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                <p className="text-sm font-medium mb-3">Recent Earnings</p>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Track sale</span><span className="text-green-400">+$0.00</span></div>
                  <div className="flex justify-between"><span>Merch drop</span><span className="text-green-400">+$0.00</span></div>
                  <div className="flex justify-between"><span>Support purchase</span><span className="text-green-400">+$0.00</span></div>
                </div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                <p className="text-sm font-medium text-green-400 mb-1">Total Withdrawn</p>
                <p className="text-2xl font-bold text-green-400">—</p>
                <p className="text-xs text-[var(--pf-text-muted)]">Pending until live data is connected</p>
              </div>
            </div>
          )}

          {type.id === 'supporter' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                  <p className="text-sm text-[var(--pf-text-muted)] mb-1">Artists Supported</p>
                  <p className="text-2xl font-bold">—</p>
                </div>
                <div className="flex-1 p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                  <p className="text-sm text-[var(--pf-text-muted)] mb-1">Referral Earnings</p>
                  <p className="text-2xl font-bold text-green-400">—</p>
                </div>
                <div className="flex-1 p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                  <p className="text-sm text-[var(--pf-text-muted)] mb-1">Impact Rank</p>
                  <p className="text-2xl font-bold text-[var(--pf-orange)]">—</p>
                </div>
              </div>
              <div className="p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                <p className="text-sm font-medium mb-3">Recent Notifications</p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2"><Bell size={14} className="text-[var(--pf-orange)]" /> O D Porter just dropped a track</div>
                  <div className="flex gap-2"><DollarSign size={14} className="text-green-400" /> Referral earnings show here when live</div>
                  <div className="flex gap-2"><Heart size={14} className="text-pink-400" /> Gune is live on Porterful</div>
                </div>
              </div>
            </div>
          )}

          {type.id === 'brand' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                  <p className="text-sm text-[var(--pf-text-muted)] mb-1">Artists</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="flex-1 p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                  <p className="text-sm text-[var(--pf-text-muted)] mb-1">Total Reach</p>
                  <p className="text-2xl font-bold">Live only</p>
                </div>
                <div className="flex-1 p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                  <p className="text-sm text-[var(--pf-text-muted)] mb-1">Campaigns</p>
                  <p className="text-2xl font-bold">—</p>
                </div>
              </div>
              <div className="p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                <p className="text-sm font-medium mb-3">Featured Artists</p>
                <div className="flex gap-4">
                  <div className="text-center"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-white font-bold">OD</div><p className="text-xs mt-1">O D Porter</p></div>
                  <div className="text-center"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold">GU</div><p className="text-xs mt-1">Gune</p></div>
                  <div className="text-center"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold">AT</div><p className="text-xs mt-1">ATM Trap</p></div>
                </div>
              </div>
            </div>
          )}

          {type.id === 'business' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                  <p className="text-sm text-[var(--pf-text-muted)] mb-1">Products</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <div className="flex-1 p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                  <p className="text-sm text-[var(--pf-text-muted)] mb-1">Orders</p>
                  <p className="text-2xl font-bold">—</p>
                </div>
                <div className="flex-1 p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                  <p className="text-sm text-[var(--pf-text-muted)] mb-1">Profit</p>
                  <p className="text-2xl font-bold text-green-400">—</p>
                </div>
              </div>
              <div className="p-4 bg-[var(--pf-bg)] rounded-xl border border-[var(--pf-border)]">
                <p className="text-sm font-medium mb-3">Top Products</p>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Store setup</span><span className="text-green-400">Ready</span></div>
                  <div className="flex justify-between"><span>Product catalog</span><span className="text-green-400">Coming soon</span></div>
                  <div className="flex justify-between"><span>Fulfillment</span><span className="text-green-400">Awaiting confirmation</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl border border-[var(--pf-orange)]/20">
          <h3 className="text-2xl font-bold mb-2">This could be you.</h3>
          <p className="text-[var(--pf-text-secondary)] mb-6">Join thousands of artists, fans, and businesses already on Porterful.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/signup?role=${type.demoRole}`} className="px-8 py-4 bg-[var(--pf-orange)] text-white rounded-lg font-semibold hover:bg-[var(--pf-orange-dark)] transition-colors text-lg">
              Start as a {type.name} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
