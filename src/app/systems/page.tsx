'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, ChevronRight, Globe, Map, Zap, Users, ArrowRight, CheckCircle } from 'lucide-react';

const SYSTEMS = [
  {
    id: 'nlds',
    name: 'National Land Data System™',
    tagline: 'Every parcel. Every opportunity.',
    status: 'LIVE',
    statusColor: 'text-green-400',
    bgColor: 'from-green-900/20 to-green-950/40',
    borderColor: 'border-green-900/50',
    accentColor: 'text-green-400',
    url: 'https://national-land-data-system.vercel.app',
    description: 'A proprietary land intelligence platform that scrapes, scores, and surfaces off-market deals before they hit the public market. Built for investors, developers, and anyone who knows land is the ultimate asset class.',
    features: [
      '30+ proprietary deal listings',
      '5-tier acquisition pathway system',
      'Automated deal-drop engine (Mondays 9 AM)',
      'Parcel intelligence scoring',
      'Group deal co-investment',
      '4-tier unlock system ($5–$100)',
    ],
    stats: '30 listings · $7,500–$50K range · 6 systems active',
    cta: 'Explore NLDS',
  },
  {
    id: 'barter-os',
    name: 'BarterOS™',
    tagline: 'Trade without money.',
    status: 'BUILT',
    statusColor: 'text-orange-400',
    bgColor: 'from-orange-900/20 to-orange-950/40',
    borderColor: 'border-orange-900/50',
    accentColor: 'text-orange-400',
    url: 'https://barter-os.vercel.app',
    description: 'A structured barter platform. Trade goods and services without money. The Fairness Engine™ scores every match. The Smart Match Engine™ finds 2-hop and 4-hop trade chains. Built for communities that want to exchange without cash friction.',
    features: [
      'Fairness Engine™ scoring',
      'Smart Match Engine™ v2',
      'Trade Pathway System™',
      'Value Tier Suggester™',
      'Trade Readiness Score™',
      'Counter-offer Inference',
    ],
    stats: 'Built · STL-focused seed data · Ready to deploy',
    cta: 'Explore BarterOS',
  },
  {
    id: 'abundance-box',
    name: 'Abundance Box™',
    tagline: 'Physical discovery. Digital commerce.',
    status: 'LIVE',
    statusColor: 'text-green-400',
    bgColor: 'from-emerald-900/20 to-emerald-950/40',
    borderColor: 'border-emerald-900/50',
    accentColor: 'text-emerald-400',
    url: 'https://abundance-box.vercel.app',
    description: 'Physical product discovery boxes placed in partner locations. Scan a QR, explore a product, collect or order. Brand sponsorships + location revenue split. The bridge between physical browsing and digital commerce.',
    features: [
      'QR code product discovery',
      '3 active STL locations',
      'Brand sponsorship revenue',
      '30% location revenue share',
      'No upfront cost to partner locations',
    ],
    stats: '3 boxes live · STL · Revenue-ready',
    cta: 'Explore Abundance Box',
  },
  {
    id: 'gbody',
    name: 'G-Body Finder',
    tagline: 'Find your next build.',
    status: 'LIVE',
    statusColor: 'text-blue-400',
    bgColor: 'from-blue-900/20 to-blue-950/40',
    borderColor: 'border-blue-900/50',
    accentColor: 'text-blue-400',
    url: 'https://gbodyfinder.com',
    description: 'Complete resource for 1978-1987 G-Body Chevrolet and Pontiac muscle cars. Parts search, market tracker, dealer program, and build calculator. Ad revenue + dealer subscriptions.',
    features: [
      'Model pages + market data',
      'Parts search + affiliate links',
      'Build calculator',
      'Dealer program ($99/mo)',
      'Vercel Analytics active',
      '24 pages live',
    ],
    stats: 'Live · Ad revenue ready · Dealer program',
    cta: 'Explore G-Body Finder',
  },
  {
    id: 'credit',
    name: 'CreditKlimb™',
    tagline: 'Build your credit. Protect your future.',
    status: 'LIVE',
    statusColor: 'text-sky-400',
    bgColor: 'from-sky-900/20 to-sky-950/40',
    borderColor: 'border-sky-900/50',
    accentColor: 'text-sky-400',
    url: 'https://creditklimb.com',
    description: 'Credit repair and protection platform. DIY dispute letter generation, progress tracking, and credit education. 24 pages live. Revenue from subscription tiers and dispute letter add-ons.',
    features: [
      'Dispute letter generation',
      'Credit education content',
      'Progress tracking dashboard',
      '24 pages live',
      'Supabase backend (needs wiring)',
    ],
    stats: 'Live · Needs Supabase wiring · Revenue-ready',
    cta: 'Explore CreditKlimb',
  },
  {
    id: 'teachyoung',
    name: 'TeachYoung™',
    tagline: 'Homeschool. On your terms.',
    status: 'PROTECTED',
    statusColor: 'text-pink-400',
    bgColor: 'from-pink-900/20 to-pink-950/40',
    borderColor: 'border-pink-900/50',
    accentColor: 'text-pink-400',
    url: '#',
    description: 'Private homeschool platform for Honor and Noble. ARCHTEXT™ teaching system, age-appropriate dashboards, progress tracking. Protected — requires family login. Inquiry page for public access.',
    features: [
      'ARCHTEXT™ proprietary system',
      'Age-appropriate lessons (Honor 8, Noble 9)',
      '6 subjects: Math, Reading, Science, Social Studies, Art, Music',
      'Parent dashboard for progress tracking',
      'Password protected',
    ],
    stats: 'Protected · Local dev · Inquiry page needed',
    cta: 'Request Access',
  },
  {
    id: 'family',
    name: 'Family Legacy OS',
    tagline: 'Preserve what matters.',
    status: 'BUILDING',
    statusColor: 'text-purple-400',
    bgColor: 'from-purple-900/20 to-purple-950/40',
    borderColor: 'border-purple-900/50',
    accentColor: 'text-purple-400',
    url: '#',
    description: 'A private, permission-based family lineage system. Stores full lineage, connects family branches across 31 people, and preserves history for future generations. 15 family branches, 6 lineage clusters.',
    features: [
      'Relationship Engine™ (11/12 tests passing)',
      'View-as any family member',
      '15 family branches',
      '31 people connected',
      'Private — auth-gated',
    ],
    stats: 'Building · Not deployed · Family data ready',
    cta: 'Coming Soon',
  },
];

export default function SystemsPage() {
  const [activeSystem, setActiveSystem] = useState<string | null>(null);

  return (
    <div className="min-h-screen">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--pf-border)]">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, var(--pf-orange) 0%, transparent 40%), radial-gradient(circle at 70% 50%, #22c55e 0%, transparent 40%)',
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <p className="text-sm uppercase tracking-widest text-[var(--pf-orange)] mb-4">Porterful Ecosystem</p>
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">THE SYSTEMS</h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Every system feeds the next. Music builds fans. Fans fund land deals. Land deals fund more music. The loop is the product.
          </p>
        </div>
      </section>

      {/* SYSTEMS GRID */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="space-y-8">
          {SYSTEMS.map((system) => (
            <div
              key={system.id}
              className={`rounded-3xl border ${system.borderColor} bg-gradient-to-br ${system.bgColor} p-8 transition-all duration-300`}
            >
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs uppercase tracking-widest font-bold ${system.statusColor}`}>
                      {system.status}
                    </span>
                    <span className="text-[var(--pf-text-secondary)]">·</span>
                    <span className="text-sm text-[var(--pf-text-secondary)]">{system.id.replace('-', ' ')}</span>
                  </div>

                  <h2 className="text-2xl lg:text-3xl font-bold mb-2">{system.name}</h2>
                  <p className={`text-lg font-medium mb-4 ${system.accentColor}`}>{system.tagline}</p>
                  <p className="text-[var(--pf-text-secondary)] mb-6">{system.description}</p>

                  {/* Features */}
                  <div className="grid sm:grid-cols-2 gap-2 mb-6">
                    {system.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle size={14} className={system.accentColor} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-[var(--pf-text-secondary)] mb-6">{system.stats}</p>

                  {/* CTA */}
                  {system.url === '#' ? (
                    <button
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors border ${system.borderColor} hover:${system.accentColor}`}>
                      {system.cta}
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <a
                      href={system.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
                        system.id === 'nlds'
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                          : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] border border-[var(--pf-border)]'
                      }`}>
                      {system.cta}
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>

                {/* Right: Visual */}
                <div className="flex items-center justify-center">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/50 flex items-center justify-center">
                    {system.id === 'nlds' && (
                      <div className="text-center">
                        <Map size={48} className={`mx-auto mb-3 ${system.accentColor}`} />
                        <p className="text-sm text-[var(--pf-text-secondary)]">Land Data Platform</p>
                      </div>
                    )}
                    {system.id === 'hunger-swipes' && (
                      <div className="text-center">
                        <Zap size={48} className={`mx-auto mb-3 ${system.accentColor}`} />
                        <p className="text-sm text-[var(--pf-text-secondary)]">Food Redistribution</p>
                      </div>
                    )}
                    {system.id === 'barter-os' && (
                      <div className="text-center">
                        <Users size={48} className={`mx-auto mb-3 ${system.accentColor}`} />
                        <p className="text-sm text-[var(--pf-text-secondary)]">Trade Network</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW THEY CONNECT */}
      <section className="border-t border-[var(--pf-border)]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-sm uppercase tracking-widest text-[var(--pf-orange)] mb-8 text-center">How They Connect</p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {/* Music */}
            <div className="flex flex-col items-center p-4">
              <div className="w-20 h-20 rounded-2xl bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 flex items-center justify-center mb-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[var(--pf-orange)]">
                  <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <p className="text-sm font-medium">Music</p>
              <p className="text-xs text-[var(--pf-text-secondary)]">Builds fans</p>
            </div>

            <ArrowRight size={20} className="text-[var(--pf-text-secondary)] hidden md:block mx-2" />

            {/* Fans */}
            <div className="flex flex-col items-center p-4">
              <div className="w-20 h-20 rounded-2xl bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 flex items-center justify-center mb-2">
                <Users size={32} className="text-[var(--pf-orange)]" />
              </div>
              <p className="text-sm font-medium">Fans</p>
              <p className="text-xs text-[var(--pf-text-secondary)]">Buy chains</p>
            </div>

            <ArrowRight size={20} className="text-[var(--pf-text-secondary)] hidden md:block mx-2" />

            {/* Chains */}
            <div className="flex flex-col items-center p-4">
              <div className="w-20 h-20 rounded-2xl bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 flex items-center justify-center mb-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[var(--pf-orange)]">
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-sm font-medium">Chains</p>
              <p className="text-xs text-[var(--pf-text-secondary)]">Ships 5–7 days</p>
            </div>

            <ArrowRight size={20} className="text-[var(--pf-text-secondary)] hidden md:block mx-2" />

            {/* Land */}
            <div className="flex flex-col items-center p-4">
              <div className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-2">
                <Map size={32} className="text-green-400" />
              </div>
              <p className="text-sm font-medium">NLDS</p>
              <p className="text-xs text-[var(--pf-text-secondary)]">Funds the loop</p>
            </div>

            <ArrowRight size={20} className="text-[var(--pf-text-secondary)] hidden md:block mx-2" />

            {/* More Music */}
            <div className="flex flex-col items-center p-4">
              <div className="w-20 h-20 rounded-2xl bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 flex items-center justify-center mb-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[var(--pf-orange)]">
                  <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <p className="text-sm font-medium">More Music</p>
              <p className="text-xs text-[var(--pf-text-secondary)]">Loop closes</p>
            </div>
          </div>

          <p className="text-center text-[var(--pf-text-secondary)] mt-8 max-w-xl mx-auto">
            NLDS generates platform revenue. That revenue funds artist development, product creation, and system expansion. The loop is the product.
          </p>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="border-t border-[var(--pf-border)]">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to explore?</h3>
          <p className="text-[var(--pf-text-secondary)] mb-8">Dive into the ecosystem. Or start with music.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/music"
              className="px-6 py-3 bg-[var(--pf-orange)] hover:bg-[var(--pf-orange)]/90 text-black font-medium rounded-full transition-colors">
              Start with Music
            </a>
            <a href="/shop"
              className="px-6 py-3 bg-[var(--pf-surface)] hover:bg-[var(--pf-border)] text-[var(--pf-text)] font-medium rounded-full transition-colors border border-[var(--pf-border)]">
              Shop Chains
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
