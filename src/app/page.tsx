import Link from 'next/link'
import { Play, Headphones, ArrowRight, Music, Star } from 'lucide-react'

// Featured artists (will come from database)
const FEATURED_ARTISTS = [
  { id: 'od-porter', name: 'O D Porter', genre: 'Hip-Hop / R&B', location: 'New Orleans', image: '🎤', releases: 3, supporters: 2847 },
]

// Featured releases (will come from database)
const FEATURED_RELEASES = [
  { id: 'ambiguous-ep', title: 'Ambiguous EP', artist: 'O D Porter', type: 'EP', tracks: 5, price: 5, image: '💿' },
  { id: 'ambiguous-vinyl', title: 'Ambiguous Vinyl', artist: 'O D Porter', type: 'Vinyl', price: 50, image: '📀', soldOut: false },
  { id: 'ambiguous-tee', title: 'Ambiguous Tour Tee', artist: 'O D Porter', type: 'Merch', price: 25, image: '👕' },
]

// Trending tracks (will come from database)
const TRENDING_TRACKS = [
  { id: 'midnight-drive', title: 'Midnight Drive', artist: 'O D Porter', plays: '125K' },
  { id: 'vibes', title: 'Vibes', artist: 'O D Porter', plays: '89K' },
  { id: 'movement', title: 'Movement', artist: 'O D Porter', plays: '67K' },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero - Artist Featured */}
      <section className="relative min-h-screen flex items-center bg-[var(--pf-bg)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--pf-orange)]/5 via-transparent to-purple-500/5" />
        
        <div className="relative z-10 w-full">
          <div className="pf-container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Artist Info */}
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 rounded-full text-[var(--pf-orange)] text-sm font-medium mb-6">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  NOW STREAMING
                </span>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-4">
                  O D Porter
                </h1>
                
                <p className="text-xl text-[var(--pf-text-secondary)] mb-2">
                  New Orleans • Hip-Hop / R&B
                </p>
                
                <p className="text-[var(--pf-text-muted)] mb-8">
                  3 releases • 2,847 supporters
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link href="/artist/od-porter" className="pf-btn pf-btn-primary text-lg px-8 py-4">
                    <Play className="inline mr-2" size={20} />
                    Listen Now
                  </Link>
                  <Link href="/artist/od-porter#merch" className="pf-btn pf-btn-secondary text-lg px-8 py-4">
                    Shop Merch
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-[var(--pf-border)]">
                  <div>
                    <p className="text-3xl font-bold">$8,947</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">Earned by O D</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">21</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">Tracks</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">142</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">Merch Sold</p>
                  </div>
                </div>
              </div>

              {/* Right - Featured Release */}
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-[var(--pf-orange)]/20 to-purple-600/20 rounded-2xl flex items-center justify-center text-[200px] shadow-2xl shadow-[var(--pf-orange)]/10">
                  💿
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-[var(--pf-bg)]/90 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-sm text-[var(--pf-orange)] font-medium mb-1">LATEST RELEASE</p>
                  <h3 className="text-xl font-bold">Ambiguous EP</h3>
                  <p className="text-sm text-[var(--pf-text-muted)]">5 tracks • $5 minimum</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Releases */}
      <section className="py-24 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Releases</h2>
              <p className="text-[var(--pf-text-secondary)]">Support artists directly</p>
            </div>
            <Link href="/artists" className="text-[var(--pf-orange)] hover:underline">
              View all artists <ArrowRight className="inline ml-1" size={16} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURED_RELEASES.map((release) => (
              <Link 
                key={release.id}
                href={`/product/${release.id}`}
                className="group"
              >
                <div className="aspect-square bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-500/10 rounded-xl flex items-center justify-center text-8xl mb-4 group-hover:scale-105 transition-transform">
                  {release.image}
                </div>
                <h3 className="text-xl font-bold mb-1 group-hover:text-[var(--pf-orange)] transition-colors">
                  {release.title}
                </h3>
                <p className="text-[var(--pf-text-muted)] mb-2">{release.artist}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">${release.price}</span>
                  <span className="text-sm text-[var(--pf-text-muted)]">{release.type}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Proud to Pay */}
      <section className="py-24">
        <div className="pf-container">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium mb-6">
              <Star size={14} />
              PROUD TO PAY
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Pay What You Want
            </h2>
            <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
              Music isn't free. It costs time, energy, and love. Choose how much you value it.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
            {[
              { tier: 'Listener', price: '$1', desc: 'Stream minimum' },
              { tier: 'Supporter', price: '$5', desc: '+1 bonus track' },
              { tier: 'Champion', price: '$10', desc: '+ name in credits', popular: true },
              { tier: 'Patron', price: '$20+', desc: '+ early access' },
            ].map((tier) => (
              <div 
                key={tier.tier}
                className={`pf-card p-6 text-center hover:border-[var(--pf-orange)]/50 hover:-translate-y-1 transition-all ${
                  tier.popular ? 'border-purple-500/50' : ''
                }`}
              >
                {tier.popular && (
                  <span className="inline-block px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded mb-2">
                    POPULAR
                  </span>
                )}
                <p className="text-sm text-[var(--pf-text-muted)] uppercase tracking-wider mb-2">{tier.tier}</p>
                <p className="text-4xl font-bold text-[var(--pf-orange)] mb-2">{tier.price}</p>
                <p className="text-sm text-[var(--pf-text-secondary)]">{tier.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/support" className="pf-btn pf-btn-primary">
              <Star className="inline mr-2" size={18} />
              Find Artists to Support
            </Link>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-24 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trending Now</h2>
              <p className="text-[var(--pf-text-secondary)]">What people are listening to</p>
            </div>
            <Link href="/radio" className="pf-btn pf-btn-secondary">
              <Headphones className="inline mr-2" size={16} />
              Open Radio
            </Link>
          </div>

          <div className="pf-card">
            <div className="divide-y divide-[var(--pf-border)]">
              {TRENDING_TRACKS.map((track, i) => (
                <div key={track.id} className="flex items-center gap-4 p-4 hover:bg-[var(--pf-surface-hover)] transition-colors">
                  <span className="w-8 text-center text-[var(--pf-text-muted)] font-bold">{i + 1}</span>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--pf-orange)]/20 to-purple-500/20 flex items-center justify-center">
                    <Music className="text-[var(--pf-orange)]" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{track.title}</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">{track.artist}</p>
                  </div>
                  <span className="text-sm text-[var(--pf-text-muted)]">{track.plays} plays</span>
                  <button className="p-2 rounded-full bg-[var(--pf-orange)] hover:bg-[var(--pf-orange-light)] transition-colors">
                    <Play size={16} className="text-white ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Become an Artist */}
      <section className="py-24">
        <div className="pf-container">
          <div className="pf-card p-12 text-center bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Are You an Artist?</h2>
            <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto mb-8">
              Upload your music, sell merch, and earn from every purchase on the platform.
              No label required. You keep 80%.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/signup?role=artist" className="pf-btn pf-btn-primary text-lg px-8 py-4">
                Start Selling <ArrowRight className="inline ml-2" size={20} />
              </Link>
              <Link href="/about" className="pf-btn pf-btn-secondary text-lg px-8 py-4">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-[var(--pf-orange)] mb-2">847</p>
              <p className="text-[var(--pf-text-secondary)]">Artists</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-[var(--pf-orange)] mb-2">12.4K</p>
              <p className="text-[var(--pf-text-secondary)]">Tracks</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-[var(--pf-orange)] mb-2">$2.4M</p>
              <p className="text-[var(--pf-text-secondary)]">To Artists</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-[var(--pf-orange)] mb-2">89%</p>
              <p className="text-[var(--pf-text-secondary)]">Avg. Payout</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}