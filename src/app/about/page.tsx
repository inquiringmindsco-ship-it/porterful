import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Porterful - The Artist Economy Platform',
  description: 'Porterful is where independent artists earn 80% on every sale. No label. No middleman. Music, merch, marketplace — built for creators who deserve a retirement plan.',
  keywords: [
    'independent artist platform',
    'artist economy',
    'music marketplace',
    'artist retirement plan',
    'sell music online',
    'artist merchandise platform',
    'direct to fan',
    'no middleman music',
    'artist revenue share'
  ],
  openGraph: {
    title: 'About Porterful - The Artist Economy',
    description: 'Where artists own everything. Music, merch, marketplace — 80% goes to artists.',
    images: ['/og-image.png'],
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--pf-bg)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--pf-orange)]/10 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 rounded-full text-[var(--pf-orange)] text-sm font-medium mb-6">
              The Artist Economy
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Where Artists Own
              <span className="block text-[var(--pf-orange)]">Everything</span>
            </h1>
            <p className="text-xl text-[var(--pf-text-secondary)] max-w-3xl mx-auto">
              Porterful is a music and merchandise platform where artists keep 80% of every sale.
              No label. No middleman. Just artists and fans, directly connected.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)]">
              <div className="text-3xl md:text-4xl font-bold text-[var(--pf-orange)]">80%</div>
              <div className="text-sm text-[var(--pf-text-muted)]">to Artists</div>
            </div>
            <div className="text-center p-6 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)]">
              <div className="text-3xl md:text-4xl font-bold">114+</div>
              <div className="text-sm text-[var(--pf-text-muted)]">Tracks</div>
            </div>
            <div className="text-center p-6 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)]">
              <div className="text-3xl md:text-4xl font-bold">94+</div>
              <div className="text-sm text-[var(--pf-text-muted)]">Products</div>
            </div>
            <div className="text-center p-6 bg-[var(--pf-surface)] rounded-xl border border-[var(--pf-border)]">
              <div className="text-3xl md:text-4xl font-bold text-[var(--pf-orange)]">$0</div>
              <div className="text-sm text-[var(--pf-text-muted)]">to Start</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-6 bg-[var(--pf-bg-secondary)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                The Music Industry is Broken
              </h2>
              <div className="space-y-4 text-[var(--pf-text-secondary)]">
                <p>
                  <strong className="text-[var(--pf-text)]">Spotify pays artists $0.003 per stream.</strong> That means an artist needs 1,666 plays to make $5.
                </p>
                <p>
                  <strong className="text-[var(--pf-text)]">Record labels take 80-95%.</strong> Artists sign away their rights for pennies, hoping for fame that rarely comes.
                </p>
                <p>
                  <strong className="text-[var(--pf-text)]">No retirement plan for artists.</strong> Local musicians don't have 401(k)s. Touring artists don't get residuals. One bad month and they quit.
                </p>
                <p className="text-[var(--pf-orange)] font-semibold text-lg">
                  We built Porterful to change all of that.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl p-8 border border-red-500/20">
              <h3 className="text-xl font-bold mb-4 text-red-400">The Old Way</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❌</span>
                  <span className="text-[var(--pf-text-secondary)]">Artists get 10-20% of their own sales</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❌</span>
                  <span className="text-[var(--pf-text-secondary)]">Labels own the masters forever</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❌</span>
                  <span className="text-[var(--pf-text-secondary)]">$0.003 per stream on Spotify</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❌</span>
                  <span className="text-[var(--pf-text-secondary)]">No pension, no safety net</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl p-8 border border-[var(--pf-orange)]/20 order-2 md:order-1">
              <h3 className="text-xl font-bold mb-4 text-[var(--pf-orange)]">The Porterful Way</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span className="text-[var(--pf-text)]"><strong>80%</strong> goes to artists on every sale</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span className="text-[var(--pf-text)]">Artists <strong>own their masters</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span className="text-[var(--pf-text)]"><strong>$1 per track</strong> — fans pay once, own forever</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span className="text-[var(--pf-text)]"><strong>Superfans earn</strong> by referring new buyers</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span className="text-[var(--pf-text)]"><strong>Artist Fund</strong> grows every purchase</span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6">
                Built for Artists, By Artists
              </h2>
              <p className="text-[var(--pf-text-secondary)] mb-4">
                Porterful was founded by an independent artist who saw firsthand how the industry exploits creators. The platform is designed to be what artists actually need:
              </p>
              <ul className="space-y-3 text-[var(--pf-text-secondary)]">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--pf-orange)] font-bold">→</span>
                  <span><strong className="text-[var(--pf-text)]">Direct sales</strong> — No label, no distributor, no middleman</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--pf-orange)] font-bold">→</span>
                  <span><strong className="text-[var(--pf-text)]">Transparent pricing</strong> — Fans know exactly where their money goes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--pf-orange)] font-bold">→</span>
                  <span><strong className="text-[var(--pf-text)]">Print-on-demand</strong> — No inventory needed, artists upload and sell</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--pf-orange)] font-bold">→</span>
                  <span><strong className="text-[var(--pf-text)]">Revenue sharing</strong> — Superfans earn by spreading the word</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Split */}
      <section className="py-16 px-6 bg-[var(--pf-bg-secondary)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Where Your Money Goes</h2>
          <div className="bg-[var(--pf-surface)] rounded-2xl p-8 border border-[var(--pf-border)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
                  80%
                </div>
                <div className="font-bold text-[var(--pf-text)]">Artist</div>
                <div className="text-sm text-[var(--pf-text-muted)]">Direct earnings</div>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  20%
                </div>
                <div className="font-bold text-[var(--pf-text)]">Artist Fund</div>
                <div className="text-sm text-[var(--pf-text-muted)]">Supports all artists</div>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                  5%
                </div>
                <div className="font-bold text-[var(--pf-text)]">Superfans</div>
                <div className="text-sm text-[var(--pf-text-muted)]">Referral earnings</div>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white text-2xl font-bold">
                  10%
                </div>
                <div className="font-bold text-[var(--pf-text)]">Platform</div>
                <div className="text-sm text-[var(--pf-text-muted)]">Keeps the lights on</div>
              </div>
            </div>
            <p className="text-[var(--pf-text-secondary)] mt-6 text-sm">
              Note: Artist Fund helps emerging artists grow. Superfans earn by referring new buyers.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Own Your Music?</h2>
          <p className="text-xl text-[var(--pf-text-secondary)] mb-8">
            Join Porterful as an artist or supporter. Either way, artists win.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=artist" className="pf-btn pf-btn-primary text-lg px-8 py-4">
              Start as Artist
            </Link>
            <Link href="/digital" className="pf-btn pf-btn-secondary text-lg px-8 py-4">
              Browse Music
            </Link>
            <Link href="/marketplace" className="pf-btn pf-btn-secondary text-lg px-8 py-4">
              Shop Merch
            </Link>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-16 px-6 bg-[var(--pf-bg-secondary)]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[var(--pf-surface)] rounded-2xl p-8 border border-[var(--pf-border)]">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-4xl shrink-0">
                🎤
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">O D Porter</h3>
                <p className="text-[var(--pf-orange)] mb-2">Founder & Independent Artist</p>
                <p className="text-[var(--pf-text-secondary)] italic">
                  "I built Porterful because I was tired of watching artists get pennies while platforms got rich. Every purchase here puts real money in artists' pockets. This isn't just a platform — it's a retirement plan for creators."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}