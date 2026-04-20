'use client'

import Link from 'next/link'
import { Wifi, Tag, CreditCard, ArrowRight, Disc3, Sparkles } from 'lucide-react'

const PRODUCTS = [
  {
    id: 'nfc-wristband',
    name: 'NFC Wristband',
    price: 15,
    icon: Disc3,
    description: 'Comfortable silicone wristband. Tap to share anywhere.',
    color: 'from-orange-500 to-red-600',
    bg: 'bg-gradient-to-br from-orange-500/20 to-red-500/20',
    useCase: 'Concerts, festivals, everyday wear.',
    style: 'bold',
  },
  {
    id: 'nfc-diamond',
    name: 'Diamond Wristband',
    price: 25,
    icon: Sparkles,
    description: 'Crystal-encrusted silicone band. For those who shine.',
    color: 'from-pink-400 to-purple-500',
    bg: 'bg-gradient-to-br from-pink-400/20 to-purple-500/20',
    useCase: 'Special occasions, night out, stand out.',
    style: 'diamond',
  },
  {
    id: 'nfc-mini',
    name: 'Mini Ring',
    price: 12,
    icon: Disc3,
    description: 'Tiny ring that fits on a finger or strap. Cute and discreet.',
    color: 'from-rose-400 to-pink-500',
    bg: 'bg-gradient-to-br from-rose-400/20 to-pink-500/20',
    useCase: 'Subtle, everyday, fits anywhere.',
    style: 'minimal',
  },
  {
    id: 'nfc-tags',
    name: 'NFC Tags (3-Pack)',
    price: 12,
    icon: Tag,
    description: 'Stick anywhere. Thin and waterproof.',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20',
    useCase: 'Guitar cases, laptops, bikes, anywhere.',
    style: 'practical',
  },
  {
    id: 'nfc-card',
    name: 'NFC Card',
    price: 8,
    icon: CreditCard,
    description: 'Wallet-sized. Fits in any phone case.',
    color: 'from-purple-500 to-pink-600',
    bg: 'bg-gradient-to-br from-purple-500/20 to-pink-600/20',
    useCase: 'Networking, shows, meetings.',
    style: 'practical',
  },
  {
    id: 'nfc-bracelet',
    name: 'Beaded Bracelet',
    price: 18,
    icon: Disc3,
    description: 'Beaded design with NFC hidden inside. Boho chic.',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-gradient-to-br from-amber-400/20 to-orange-500/20',
    useCase: 'Boho vibes, festivals, everyday style.',
    style: 'boho',
  },
  {
    id: 'nfc-pendant',
    name: 'Crystal Pendant',
    price: 35,
    icon: Sparkles,
    description: 'Real crystal pendant with NFC inside. Elegant.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-gradient-to-br from-violet-500/20 to-purple-600/20',
    useCase: 'Necklace, gifts, elegant look.',
    style: 'luxury',
  },
  {
    id: 'nfc-lanyard',
    name: 'NFC Lanyard',
    price: 10,
    icon: Tag,
    description: 'Breakaway lanyard with NFC tag. Great for events.',
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-gradient-to-br from-green-500/20 to-emerald-600/20',
    useCase: 'Events, conferences, ID-style.',
    style: 'practical',
  },
]

export default function TapInPage() {
  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-5xl mx-auto">
        
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)]/10 rounded-full text-[var(--pf-orange)] text-sm font-medium mb-6">
            <Wifi size={16} />
            Signal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Turn your likeness into a signal.
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Wear your signal. Let people tap in.
          </p>
        </div>

        {/* Products */}
        <h2 className="text-2xl font-bold mb-6">Choose a product</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PRODUCTS.map((product) => {
            const Icon = product.icon
            return (
              <Link 
                key={product.id}
                href={`/tap-in/${product.id}`}
                className={`p-6 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl text-left hover:border-[var(--pf-orange)] transition-all hover:shadow-lg hover:shadow-[var(--pf-orange)]/10 ${product.bg}`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center mb-4 relative`}>
                  {product.style === 'diamond' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/80 rounded-full" />
                  )}
                  {product.style === 'luxury' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-pulse" />
                  )}
                  <Icon size={28} className="text-white" />
                </div>
                <h3 className="font-bold mb-1">{product.name}</h3>
                <p className="text-2xl font-bold text-[var(--pf-orange)] mb-3">${product.price}</p>
                <p className="text-sm text-[var(--pf-text-secondary)] mb-3">{product.description}</p>
                <p className="text-xs text-[var(--pf-text-muted)]">{product.useCase}</p>
                <div className="mt-4 flex items-center gap-1 text-[var(--pf-orange)] text-sm font-medium">
                  View Product <ArrowRight size={14} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
