'use client'

import { useRouter } from 'next/navigation'
import { Map, ExternalLink, ChevronRight, ArrowRight } from 'lucide-react'

const LAND_SYSTEMS = [
  {
    id: 'lfs',
    name: 'Land Freedom System™',
    tagline: 'Own your acre. Build your freedom.',
    description: '120 × 1-acre plots at $7,500 each. Self-sustaining community. No rent. No mortgage. No landlord. Just land you own, in a community you help govern.',
    status: 'READY',
    statusColor: 'bg-green-500',
    accentColor: 'text-green-400',
    bgGradient: 'from-green-900/20 to-green-950/40',
    borderColor: 'border-green-900/50',
    route: 'https://landfreedomsystem.com',
    features: ['120 plots available', 'Starting at $7,500/acre', 'Community co-op governance', '40 acres shared infrastructure'],
    cta: 'Visit Land Freedom System →',
    ctaColor: 'bg-green-600 hover:bg-green-500',
  },
  {
    id: 'nlds',
    name: 'National Land Data System™',
    tagline: 'Every parcel. Every opportunity.',
    description: 'A proprietary land intelligence platform that scrapes, scores, and surfaces off-market deals before they hit the public market.',
    status: 'LIVE',
    statusColor: 'bg-green-500',
    accentColor: 'text-green-400',
    bgGradient: 'from-emerald-900/20 to-emerald-950/40',
    borderColor: 'border-emerald-900/50',
    route: 'https://national-land-data-system.vercel.app',
    features: ['30+ proprietary listings', '5-tier acquisition system', 'Automated deal drops (Mondays)', 'Parcel intelligence scoring'],
    cta: 'Explore NLDS →',
    ctaColor: 'bg-emerald-600 hover:bg-emerald-500',
  },
]

export default function LandPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <button onClick={() => router.push('/')} className="text-sm font-bold tracking-widest text-gray-400 hover:text-white transition-colors">
          ← PORTERFUL
        </button>
        <span className="text-xs text-gray-600 tracking-widest uppercase">Land Division</span>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-8 pb-16 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-900/30 border border-green-800/30 rounded-full text-sm text-green-400 mb-6">
          <Map size={14} />
          Land Division
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
          Land is <span className="text-green-400">Freedom</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Two systems working together — one to help you find and acquire land, one to help you own it outright and build a community.
        </p>
      </section>

      {/* Systems Grid */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {LAND_SYSTEMS.map(system => (
            <div
              key={system.id}
              className={`bg-gradient-to-br ${system.bgGradient} border ${system.borderColor} rounded-2xl p-8`}
            >
              {/* Status */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full ${system.statusColor}`} />
                <span className={`text-xs font-bold uppercase tracking-widest ${system.accentColor}`}>{system.status}</span>
              </div>

              {/* Name */}
              <h2 className="text-2xl font-bold mb-1">{system.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{system.tagline}</p>

              {/* Description */}
              <p className="text-gray-300 text-sm leading-relaxed mb-6">{system.description}</p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {system.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className={`${system.accentColor} text-xs`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={system.route}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-5 py-3 ${system.ctaColor} text-white font-bold rounded-lg transition-colors text-sm`}
              >
                <ExternalLink size={14} />
                {system.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-6 py-8 text-center text-xs text-gray-600">
        Porterful Land Division · Powered by the Ecosystem
      </footer>
    </div>
  )
}
