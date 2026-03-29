'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Bell, ArrowLeft, Wifi, ShoppingBag, Disc3, Tag, Check } from 'lucide-react'

const PRODUCTS: Record<string, {
  name: string
  description: string
  price: number
  icon: any
  color: string
  features: string[]
}> = {
  'nfc-wristband': {
    name: 'NFC Wristband',
    description: 'Comfortable silicone wristband. Perfect for concerts, festivals, everyday wear. Tap your phone and share your link instantly.',
    price: 15,
    icon: Disc3,
    color: 'from-orange-500 to-red-600',
    features: ['Tap to share any link', 'Reusable & waterproof', 'Comfortable silicone', 'Works with any phone'],
  },
  'nfc-tags': {
    name: 'NFC Tags (3-Pack)',
    description: 'Stick anywhere — guitar case, laptop, notebook, bike. Thin and waterproof. Share your link everywhere.',
    price: 12,
    icon: Tag,
    color: 'from-blue-500 to-cyan-600',
    features: ['Set of 3 tags', 'Peel & stick anywhere', 'Thin & waterproof', 'Great for bundled sales'],
  },
  'nfc-card': {
    name: 'NFC Business Card',
    description: 'Wallet-sized card. Fits in any wallet or phone case. Hand out at shows, meetings, anytime.',
    price: 8,
    icon: Tag,
    color: 'from-purple-500 to-pink-600',
    features: ['Wallet-sized', 'Tap to share', 'Premium look', 'Perfect for networking'],
  },
  'nfc-keychain': {
    name: 'NFC Keychain',
    description: 'Tap In from your keys. Always have your link with you. Dangles and ready to share.',
    price: 10,
    icon: Disc3,
    color: 'from-green-500 to-emerald-600',
    features: ['Attaches to keys', 'Tap to share', 'Durable build', 'Always on hand'],
  },
}

export default function TapInProductPage() {
  const params = useParams()
  const productId = params.id as string
  const product = PRODUCTS[productId]
  
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if already submitted
    const saved = localStorage.getItem(`tapin_notify_${productId}`)
    if (saved) setSubmitted(true)
  }, [productId])

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    localStorage.setItem(`tapin_notify_${productId}`, email)
    setSubmitted(true)
    setLoading(false)
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/tap-in" className="pf-btn pf-btn-primary">Back to Tap In</Link>
        </div>
      </div>
    )
  }

  const Icon = product.icon

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-3xl mx-auto">
        
        {/* Back */}
        <Link href="/tap-in" className="inline-flex items-center gap-2 text-[var(--pf-text-muted)] hover:text-white mb-8">
          ← Back to Tap In
        </Link>

        {/* Product Card */}
        <div className="bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-border)] overflow-hidden mb-8">
          {/* Header */}
          <div className={`bg-gradient-to-br ${product.color} p-8 text-white`}>
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              <Icon size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-white/80 mb-4">{product.description}</p>
            <p className="text-3xl font-bold">${product.price}</p>
          </div>
          
          {/* Features */}
          <div className="p-6 border-t border-[var(--pf-border)]">
            <h3 className="font-bold mb-4">Features</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {product.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-green-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coming Soon / Notify */}
        {!submitted ? (
          <div className="bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-orange)]/30 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--pf-orange)]/10 flex items-center justify-center">
                <Bell size={24} className="text-[var(--pf-orange)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Coming Soon</h2>
                <p className="text-sm text-[var(--pf-text-muted)]">Be the first to know when this drops</p>
              </div>
            </div>
            
            <form onSubmit={handleNotify} className="flex gap-2 mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="flex-1 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[var(--pf-orange)] text-white rounded-lg font-medium hover:bg-[var(--pf-orange-dark)] transition-colors disabled:opacity-50"
              >
                {loading ? '...' : 'Notify Me'}
              </button>
            </form>
            <p className="text-xs text-[var(--pf-text-muted)]">
              No spam. Just one email when we launch.
            </p>
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 mb-8 text-center">
            <Bell size={32} className="text-green-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-400 mb-2">You're on the list!</h3>
            <p className="text-[var(--pf-text-secondary)]">We'll email you when {product.name} launches.</p>
          </div>
        )}

        {/* Browse Other */}
        <div className="text-center">
          <p className="text-[var(--pf-text-muted)] mb-4">While you wait...</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/artists" className="px-6 py-3 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg font-medium hover:border-[var(--pf-orange)] transition-colors">
              Browse Artists
            </Link>
            <Link href="/store" className="px-6 py-3 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg font-medium hover:border-[var(--pf-orange)] transition-colors">
              Shop Store
            </Link>
            <Link href="/tap-in" className="px-6 py-3 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg font-medium hover:border-[var(--pf-orange)] transition-colors">
              View All Tap In
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
