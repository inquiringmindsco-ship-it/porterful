import Link from 'next/link'
import { Play, Headphones, ArrowRight, Music, Star, Users, DollarSign } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-[var(--pf-bg)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--pf-orange)]/5 via-transparent to-purple-500/5" />
        
        <div className="relative z-10 w-full py-20">
          <div className="pf-container">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 rounded-full text-[var(--pf-orange)] text-sm font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Now Streaming
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Where Artists<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pf-orange)] to-purple-500">
                  Own Everything
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-[var(--pf-text-secondary)] mb-8 max-w-2xl mx-auto">
                Sell music, sell merch, earn from everything. 
                <span className="text-white">80% goes to you.</span>
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/store" className="pf-btn pf-btn-primary text-lg px-8 py-4">
                  <Headphones className="inline mr-2" size={20} />
                  Browse Music
                </Link>
                <Link href="/signup?role=artist" className="pf-btn pf-btn-secondary text-lg px-8 py-4">
                  Upload Your Music
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-[var(--pf-orange)]">847</div>
                  <div className="text-sm text-[var(--pf-text-muted)]">Artists</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-[var(--pf-orange)]">80%</div>
                  <div className="text-sm text-[var(--pf-text-muted)]">To Artists</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-[var(--pf-orange)]">$0</div>
                  <div className="text-sm text-[var(--pf-text-muted)]">To Sign Up</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--pf-orange)]/20 flex items-center justify-center">
                <Music className="text-[var(--pf-orange)]" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Upload</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Add your music and merch. Set your prices.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <Users className="text-purple-400" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Share</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Fans discover you. Superfans earn by sharing.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <DollarSign className="text-green-400" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Earn</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Keep 80% of every sale. Cash out anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Release */}
      <section className="py-20">
        <div className="pf-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Album Art */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[var(--pf-orange)]/30 to-purple-600/30 rounded-3xl flex items-center justify-center text-[180px] shadow-2xl shadow-[var(--pf-orange)]/20">
                💿
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[var(--pf-orange)] text-white px-4 py-2 rounded-full font-bold text-sm">
                NEW RELEASE
              </div>
            </div>

            {/* Release Info */}
            <div>
              <span className="text-sm text-[var(--pf-orange)] font-medium mb-2 block">FEATURED ALBUM</span>
              <h2 className="text-4xl font-bold mb-2">Ambiguous EP</h2>
              <p className="text-xl text-[var(--pf-text-secondary)] mb-4">O D Porter • 5 tracks</p>
              
              <p className="text-[var(--pf-text-muted)] mb-6">
                Hip-hop and R&B from New Orleans. Raw, authentic, independent.
              </p>

              {/* Pricing */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl font-bold">$5</span>
                <span className="text-[var(--pf-text-muted)]">minimum • pay what you want</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/digital" className="pf-btn pf-btn-primary">
                  <Play className="inline mr-2" size={18} />
                  Listen Now
                </Link>
                <Link href="/artist/od-porter" className="pf-btn pf-btn-secondary">
                  View Artist
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proud to Pay */}
      <section className="py-20 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium mb-6">
              <Star size={14} />
              PROUD TO PAY
            </span>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Set Your Price
            </h2>
            
            <p className="text-xl text-[var(--pf-text-secondary)] mb-8">
              Music costs time and energy. You decide what it's worth.
            </p>

            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { price: '$1', tier: 'Stream' },
                { price: '$5', tier: 'Supporter' },
                { price: '$10', tier: 'Champion', popular: true },
                { price: '$20+', tier: 'Patron' },
              ].map((t) => (
                <div 
                  key={t.tier}
                  className={`pf-card p-6 text-center ${t.popular ? 'border-purple-500' : ''}`}
                >
                  {t.popular && (
                    <span className="text-xs text-purple-400 font-medium">POPULAR</span>
                  )}
                  <div className="text-3xl font-bold text-[var(--pf-orange)] mb-1">{t.price}</div>
                  <div className="text-sm text-[var(--pf-text-muted)]">{t.tier}</div>
                </div>
              ))}
            </div>

            <Link href="/support" className="pf-btn pf-btn-primary">
              Find Artists to Support
              <ArrowRight className="inline ml-2" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="pf-container">
          <div className="pf-card p-12 text-center bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Own Your Music?
            </h2>
            <p className="text-xl text-[var(--pf-text-secondary)] mb-8 max-w-xl mx-auto">
              Upload today. Start earning tomorrow. No label required.
            </p>
            <Link href="/signup?role=artist" className="pf-btn pf-btn-primary text-lg px-10 py-4">
              Get Started Free
              <ArrowRight className="inline ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}