'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink, ArrowRight } from 'lucide-react'

const WORLDS = [
  {
    name: 'Abundance Box',
    tagline: 'Physical product discovery in your community.',
    description: 'Scan a QR code at partner locations to discover products, support creators, and collect real items. The intersection of physical and digital commerce.',
    href: 'https://abundance-box.vercel.app',
    status: 'LIVE',
    statusColor: 'text-green-400',
    accentColor: '#22c55e',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    name: 'BarterOS',
    tagline: 'Trade without money.',
    description: 'A structured barter platform connecting people who have what you need with people who need what you have. Fairness Engine™ scores every match. No cash required.',
    href: 'https://barter-os.vercel.app',
    status: 'BUILT',
    statusColor: 'text-orange-400',
    accentColor: '#f97316',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <polyline points="7 23 3 19 7 15"/>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    ),
  },
  {
    name: 'G-Body Finder',
    tagline: 'Find your next build.',
    description: 'Complete resource for 1978-1987 G-Body Chevrolet and Pontiac muscle cars. Parts search, market tracker, dealer program, and build calculator.',
    href: 'https://gbodyfinder.com',
    status: 'LIVE',
    statusColor: 'text-green-400',
    accentColor: '#3b82f6',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    name: 'Family Legacy OS',
    tagline: 'Preserve what matters.',
    description: 'A private, permission-based family lineage system. Stores full lineage, connects family branches, and preserves history for future generations.',
    href: 'https://family-legacy.vercel.app',
    status: 'BUILDING',
    statusColor: 'text-purple-400',
    accentColor: '#8b5cf6',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    name: 'Creature Kingdom',
    tagline: 'Build your world.',
    description: 'An original Roblox pet simulator game built for creativity and income. Hatch mythical creatures, unlock worlds, earn coins. Built for the next generation.',
    href: '#',
    status: 'BUILDING',
    statusColor: 'text-pink-400',
    accentColor: '#ec4899',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
]

export default function WorldsPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Go Deeper.</h1>
          <p className="text-[var(--pf-text-secondary)] text-lg max-w-xl mx-auto">
            Explore the worlds inside Porterful. Each one is a complete system with its own purpose.
          </p>
        </div>

        {/* Worlds Grid */}
        <div className="space-y-4">
          {WORLDS.map((world, i) => (
            <a
              key={world.name}
              href={world.href !== '#' ? world.href : undefined}
              onClick={world.href === '#' ? (e) => e.preventDefault() : undefined}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="block p-6 rounded-xl border transition-all duration-300 group cursor-pointer"
              style={{
                background: hoveredIndex === i ? `${world.accentColor}08` : 'var(--pf-surface)',
                borderColor: hoveredIndex === i ? `${world.accentColor}40` : 'var(--pf-border)',
              }}
            >
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div
                  className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300"
                  style={{
                    background: `${world.accentColor}15`,
                    color: world.accentColor,
                  }}
                >
                  {world.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3
                      className="text-xl font-bold transition-colors duration-300"
                      style={{ color: hoveredIndex === i ? world.accentColor : 'var(--pf-text)' }}
                    >
                      {world.name}
                    </h3>
                    <span
                      className="text-xs font-mono uppercase tracking-wider"
                      style={{ color: world.statusColor }}
                    >
                      {world.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-2" style={{ color: world.accentColor }}>
                    {world.tagline}
                  </p>
                  <p className="text-sm text-[var(--pf-text-secondary)] leading-relaxed">
                    {world.description}
                  </p>
                </div>

                {/* Arrow */}
                {world.href !== '#' && (
                  <div
                    className="shrink-0 self-center transition-all duration-300"
                    style={{
                      color: world.accentColor,
                      opacity: hoveredIndex === i ? 1 : 0.3,
                      transform: hoveredIndex === i ? 'translateX(0)' : 'translateX(-4px)',
                    }}
                  >
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-text)] transition-colors"
          >
            ← Back to Portal
          </Link>
        </div>
      </div>
    </div>
  )
}
