'use client'

import Link from 'next/link'
import { Wifi, Tag, CreditCard, Disc3, Sparkles } from 'lucide-react'
import { SignalShirtViewer } from '@/components/signal/SignalShirtViewer'

const PRODUCTS = [
  {
    id: 'nfc-wristband',
    name: 'NFC Wristband',
    price: 15,
    icon: Disc3,
    description: 'Comfortable silicone wristband. Tap to share anywhere.',
    color: 'from-[var(--pf-orange)] to-[var(--pf-orange-light)]',
    bg: 'bg-gradient-to-br from-[var(--pf-orange)]/15 to-[var(--pf-orange-light)]/10',
    useCase: 'Concerts, festivals, everyday wear.',
    style: 'bold',
  },
  {
    id: 'nfc-diamond',
    name: 'Diamond Wristband',
    price: 25,
    icon: Sparkles,
    description: 'Crystal-encrusted silicone band. For those who shine.',
    color: 'from-[var(--pf-surface-hover)] to-[var(--pf-border-hover)]',
    bg: 'bg-gradient-to-br from-[var(--pf-surface-hover)]/90 to-[var(--pf-bg-secondary)]/90',
    useCase: 'Special occasions, night out, stand out.',
    style: 'diamond',
  },
  {
    id: 'nfc-mini',
    name: 'Mini Ring',
    price: 12,
    icon: Disc3,
    description: 'Tiny ring that fits on a finger or strap. Cute and discreet.',
    color: 'from-[var(--pf-bg-secondary)] to-[var(--pf-border-hover)]',
    bg: 'bg-gradient-to-br from-[var(--pf-bg-secondary)]/90 to-[var(--pf-surface-hover)]/90',
    useCase: 'Subtle, everyday, fits anywhere.',
    style: 'minimal',
  },
  {
    id: 'nfc-tags',
    name: 'NFC Tags (3-Pack)',
    price: 12,
    icon: Tag,
    description: 'Stick anywhere. Thin and waterproof.',
    color: 'from-[var(--pf-border-hover)] to-[var(--pf-text-muted)]',
    bg: 'bg-gradient-to-br from-[var(--pf-border-hover)]/90 to-[var(--pf-bg-secondary)]/90',
    useCase: 'Guitar cases, laptops, bikes, anywhere.',
    style: 'practical',
  },
  {
    id: 'nfc-card',
    name: 'NFC Card',
    price: 8,
    icon: CreditCard,
    description: 'Wallet-sized. Fits in any phone case.',
    color: 'from-[var(--pf-surface-hover)] to-[var(--pf-border)]',
    bg: 'bg-gradient-to-br from-[var(--pf-surface-hover)]/90 to-[var(--pf-bg-secondary)]/80',
    useCase: 'Networking, shows, meetings.',
    style: 'practical',
  },
  {
    id: 'nfc-bracelet',
    name: 'Beaded Bracelet',
    price: 18,
    icon: Disc3,
    description: 'Beaded design with NFC hidden inside. Boho chic.',
    color: 'from-[var(--pf-orange-light)] to-[var(--pf-border-hover)]',
    bg: 'bg-gradient-to-br from-[var(--pf-orange-light)]/20 to-[var(--pf-surface-hover)]/90',
    useCase: 'Boho vibes, festivals, everyday style.',
    style: 'boho',
  },
  {
    id: 'nfc-pendant',
    name: 'Crystal Pendant',
    price: 35,
    icon: Sparkles,
    description: 'Real crystal pendant with NFC inside. Elegant.',
    color: 'from-[var(--pf-orange)] to-[var(--pf-orange-light)]',
    bg: 'bg-gradient-to-br from-[var(--pf-orange)]/15 to-[var(--pf-orange-light)]/10',
    useCase: 'Necklace, gifts, elegant look.',
    style: 'luxury',
  },
  {
    id: 'nfc-lanyard',
    name: 'NFC Lanyard',
    price: 10,
    icon: Tag,
    description: 'Breakaway lanyard with NFC tag. Great for events.',
    color: 'from-[var(--pf-bg-secondary)] to-[var(--pf-border-hover)]',
    bg: 'bg-gradient-to-br from-[var(--pf-bg-secondary)]/90 to-[var(--pf-surface-hover)]/90',
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
            Signal — part of Likeness™
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Turn your likeness into a signal.
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Wear your signal. Let people tap in.
          </p>
          <div className="mt-6">
            <Link
              href="/store"
              className="pf-btn pf-btn-primary rounded-full px-6 py-3 text-sm font-semibold"
            >
              Get Your Signal →
            </Link>
            <p className="mt-2 text-sm text-[var(--pf-text-muted)]">Each signal links to your likeness.</p>
          </div>
        </div>

        <SignalShirtViewer />

        {/* Products */}
        <h2 className="text-2xl font-bold mb-6">Signal formats</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PRODUCTS.map((product) => {
            const Icon = product.icon
            return (
              <article
                key={product.id}
                className={`p-6 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl text-left transition-colors hover:border-[var(--pf-orange)] ${product.bg}`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center mb-4 relative`}>
                  {product.style === 'diamond' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/80 rounded-full" />
                  )}
                  {product.style === 'luxury' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--pf-orange-light)] rounded-full animate-pulse" />
                  )}
                  <Icon size={28} className="text-white" />
                </div>
                <h3 className="font-bold mb-1">{product.name}</h3>
                <p className="text-sm text-[var(--pf-text-secondary)] mb-3">{product.description}</p>
                <p className="text-xs text-[var(--pf-text-muted)]">{product.useCase}</p>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
