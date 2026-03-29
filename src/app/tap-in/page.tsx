'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Wifi, Smartphone, Music, Shirt, Tag, CreditCard, ArrowRight, Check, Package, Zap, Disc3 } from 'lucide-react'

const PRODUCTS = [
  {
    id: 'wristband',
    name: 'NFC Wristband',
    price: 15,
    icon: Shirt,
    description: 'Comfortable silicone wristband. Perfect for concerts, festivals, everyday wear.',
    color: 'from-orange-500 to-red-600',
    useCase: 'Wear it, share anywhere. Tap your phone to open any link.',
  },
  {
    id: 'stickers',
    name: 'NFC Tags (Set of 3)',
    price: 12,
    icon: Tag,
    description: 'Stick anywhere — guitar case, laptop, notebook, bike. Thin and waterproof.',
    color: 'from-blue-500 to-cyan-600',
    useCase: 'Peel and stick on anything. Great for bundled with purchases.',
  },
  {
    id: 'card',
    name: 'NFC Business Card',
    price: 8,
    icon: CreditCard,
    description: 'Wallet-sized card. Fits in any wallet or phone case.',
    color: 'from-purple-500 to-pink-600',
    useCase: 'Share your link at meetings, shows, or anytime.',
  },
  {
    id: 'keychain',
    name: 'NFC Keychain',
    price: 10,
    icon: Disc3,
    description: 'Tap In from your keys. Always have your link with you.',
    color: 'from-green-500 to-emerald-600',
    useCase: 'Dangles from keys. Tap anytime to share or save.',
  },
]

export default function TapInPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [customUrl, setCustomUrl] = useState('')
  const [artistPage, setArtistPage] = useState('')

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-5xl mx-auto">
        
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)]/10 rounded-full text-[var(--pf-orange)] text-sm font-medium mb-6">
            <Wifi size={16} />
            Tap In
          </div>
          <h1 className="text-4xl md:text-5xlxl font-bold mb-4">
            When You Hear Something,<br />
            <span className="text-[var(--pf-orange)]">Tap In.</span>
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            NFC products that let anyone connect instantly. Artists, fans, brands, businesses — tap to share or discover anything.
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-[var(--pf-surface)] rounded-2xl p-8 mb-8 border border-[var(--pf-border)]">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--pf-orange)]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[var(--pf-orange)]">1</span>
              </div>
              <h3 className="font-bold mb-2">Create Your Link</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Set it to your artist page, store, social, or any URL.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--pf-orange)]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[var(--pf-orange)]">2</span>
              </div>
              <h3 className="font-bold mb-2">Tap</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Phone touches the NFC product. Works instantly, no app needed.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--pf-orange)]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[var(--pf-orange)]">3</span>
              </div>
              <h3 className="font-bold mb-2">Connect</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Share music, direct to your store, grow your following.</p>
            </div>
          </div>
        </div>

        {/* Products */}
        <h2 className="text-2xl font-bold mb-6">Choose Your Tap In Products</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PRODUCTS.map((product) => {
            const Icon = product.icon
            return (
              <div 
                key={product.id}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  selected === product.id 
                    ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/5' 
                    : 'border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                }`}
                onClick={() => setSelected(product.id)}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center mb-4`}>
                  <Icon size={28} className="text-white" />
                </div>
                <h3 className="font-bold mb-1">{product.name}</h3>
                <p className="text-2xl font-bold text-[var(--pf-orange)] mb-3">${product.price}</p>
                <p className="text-sm text-[var(--pf-text-secondary)] mb-3">{product.description}</p>
                <p className="text-xs text-[var(--pf-text-muted)]">{product.useCase}</p>
                {selected === product.id && (
                  <div className="mt-3 flex items-center gap-1 text-[var(--pf-orange)] text-sm font-medium">
                    <Check size={14} /> Selected
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Setup */}
        {selected && (
          <div className="bg-[var(--pf-surface)] rounded-2xl p-6 mb-8 border border-[var(--pf-orange)]/30">
            <h3 className="font-bold mb-4">Set Up Your Tap In Link</h3>
            <p className="text-sm text-[var(--pf-text-secondary)] mb-4">
              When someone taps your product, where should it take them?
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Artist Page URL</label>
                <input
                  type="url"
                  value={artistPage}
                  onChange={(e) => setArtistPage(e.target.value)}
                  placeholder="https://porterful.com/artist/yourname"
                  className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                />
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-[var(--pf-orange)] text-white rounded-lg font-medium hover:bg-[var(--pf-orange-dark)] transition-colors">
                  Generate Tap In Link
                </button>
                <button 
                  onClick={() => setSelected(null)}
                  className="px-6 py-3 border border-[var(--pf-border)] rounded-lg font-medium hover:bg-[var(--pf-bg)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center p-8 bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl border border-[var(--pf-orange)]/20">
          <h3 className="text-2xl font-bold mb-2">Ready to Tap In?</h3>
          <p className="text-[var(--pf-text-secondary)] mb-6">Add Tap In products to your store or dashboard and start connecting.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="px-8 py-4 bg-[var(--pf-orange)] text-white rounded-lg font-semibold hover:bg-[var(--pf-orange-dark)] transition-colors text-lg">
              Go to Dashboard →
            </Link>
            <Link href="/signup" className="px-8 py-4 border border-[var(--pf-border)] rounded-lg font-medium hover:border-[var(--pf-orange)] transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
