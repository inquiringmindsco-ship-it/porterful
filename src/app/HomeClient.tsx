'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Play, Headphones, Music, Star, Users, DollarSign, Upload, ShoppingCart, Package, Radio, Disc3, ArrowUp } from 'lucide-react';
import { useSupabase } from '@/app/providers';
import { TRACKS } from '@/lib/data';
import { ArtistSearch } from '@/components/ArtistSearch';

export function HomeClient() {
  const { user } = useSupabase();
  const featuredTracks = TRACKS.slice(0, 6);
  const totalPlays = TRACKS.reduce((sum, track) => sum + (track.plays || 0), 0);
  const formattedPlays = totalPlays >= 1000000 ? `${(totalPlays / 1000000).toFixed(1)}M+` : `${(totalPlays / 1000).toFixed(0)}K+`;
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-[var(--pf-bg)] via-[var(--pf-bg-secondary)] to-[var(--pf-bg)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--pf-orange)]/5 via-transparent to-purple-500/5" />
        
        <div className="relative z-10 w-full py-12 md:py-20">
          <div className="pf-container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left - Text */}
              <div className="text-center md:text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 rounded-full text-[var(--pf-orange)] text-sm font-medium mb-6">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Now Streaming
                </div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 leading-tight">
                  <span className="block sm:inline">Where Artists </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pf-orange)] to-purple-500 block sm:inline">
                    Own Everything
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-[var(--pf-text-secondary)] mb-6 max-w-lg mx-auto md:mx-0">
                  Sell music and merch. Keep <span className="text-[var(--pf-orange)] font-semibold">80%</span> of every sale.
                  No label. No middleman. Just you and your fans.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-8">
                  <Link 
                    href="/digital" 
                    className="pf-btn pf-btn-primary text-base sm:text-lg px-6 py-3 flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    <Headphones size={20} />
                    <span>Listen Now</span>
                  </Link>
                  <Link 
                    href="/shop" 
                    className="pf-btn pf-btn-secondary text-base sm:text-lg px-6 py-3 flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    <ShoppingCart size={20} />
                    <span>Shop Merch & Music</span>
                  </Link>
                  <Link 
                    href="/signup?role=artist" 
                    className="pf-btn pf-btn-outline text-base sm:text-lg px-6 py-3 flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    <Upload size={20} />
                    <span>Sell Your Music</span>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex gap-6 justify-center md:justify-start">
                  <div className="text-center md:text-left">
                    <div className="text-2xl md:text-3xl font-bold text-[var(--pf-orange)]">{TRACKS.length}</div>
                    <div className="text-sm text-[var(--pf-text-muted)]">Tracks</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-2xl md:text-3xl font-bold text-[var(--pf-orange)]">80%</div>
                    <div className="text-sm text-[var(--pf-text-muted)]">To Artists</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-2xl md:text-3xl font-bold text-[var(--pf-orange)]">$0</div>
                    <div className="text-sm text-[var(--pf-text-muted)]">To Start</div>
                  </div>
                </div>

                {/* Social proof / As seen in */}
                <div className="mt-6 pt-6 border-t border-[var(--pf-border)]">
                  <p className="text-xs text-[var(--pf-text-muted)] uppercase tracking-wider mb-3 text-center md:text-left">Trusted by independent artists</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
                    <div className="flex items-center gap-1.5 text-[var(--pf-text-secondary)]">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="text-green-500" width="14" height="14"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      <span className="text-xs font-medium">Stripe Verified</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--pf-text-secondary)]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span className="text-xs font-medium">Bank-level Security</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--pf-text-secondary)]">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="text-[var(--pf-orange)]" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      <span className="text-xs font-medium">{formattedPlays} Streams</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--pf-text-secondary)]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span className="text-xs font-medium">24/7 Support</span>
                    </div>
                  </div>
                </div>

                {/* Mobile album strip — gives visual interest without full grid */}
                <div className="flex md:hidden gap-3 overflow-x-auto pb-2 -mx-4 px-4 mt-4 scrollbar-hide">
                  {TRACKS.slice(0, 6).map((track) => (
                    <Link
                      key={track.id}
                      href={`/album/${track.album.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden shadow-md hover:ring-2 hover:ring-[var(--pf-orange)]/50 transition-all"
                    >
                      <Image
                        src={track.image}
                        alt={track.album || track.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right - Featured Album Art */}
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--pf-orange)]/20 to-purple-500/20 blur-3xl rounded-full" />
                  <div className="relative grid grid-cols-2 gap-4">
                    {[
                      TRACKS.find(t => t.album === 'Ambiguous'),
                      TRACKS.find(t => t.album === 'From Feast to Famine'),
                      TRACKS.find(t => t.album === 'One Day'),
                      TRACKS.find(t => t.album === 'God Is Good'),
                    ].filter(Boolean).map((track, i) => (
                      <div
                        key={track!.id}
                        className={`aspect-square rounded-xl overflow-hidden shadow-2xl ${i === 0 ? 'col-span-2' : ''} relative`}
                      >
                        <Image
                          src={track!.image}
                          alt={track!.album || track!.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                            priority={i === 0}
                          fetchPriority={i === 0 ? 'high' : 'low'}
                          fetchPriority={i === 0 ? 'high' : 'low'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* How It Works */}
      <section className="py-16 md:py-24 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            For Artists, <span className="text-[var(--pf-orange)]">By Artists</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-[var(--pf-bg)] rounded-2xl p-6 border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors">
              <div className="w-14 h-14 rounded-xl bg-[var(--pf-orange)]/10 flex items-center justify-center mb-4">
                <Music className="text-[var(--pf-orange)]" size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2">Upload Your Music</h3>
              <p className="text-[var(--pf-text-secondary)] text-sm">
                Upload tracks, set your price. Fans can buy individual songs or tip more to support.
              </p>
            </div>
            
            <div className="bg-[var(--pf-bg)] rounded-2xl p-6 border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors">
              <div className="w-14 h-14 rounded-xl bg-[var(--pf-orange)]/10 flex items-center justify-center mb-4">
                <Package className="text-[var(--pf-orange)]" size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2">Sell Your Merch</h3>
              <p className="text-[var(--pf-text-secondary)] text-sm">
                Connect Printful or submit designs. We handle printing and shipping. You keep the profit.
              </p>
            </div>
            
            <div className="bg-[var(--pf-bg)] rounded-2xl p-6 border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors">
              <div className="w-14 h-14 rounded-xl bg-[var(--pf-orange)]/10 flex items-center justify-center mb-4">
                <DollarSign className="text-[var(--pf-orange)]" size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2">Earn 80%</h3>
              <p className="text-[var(--pf-text-secondary)] text-sm">
                No label taking 90%. You keep 80% of every sale. Platform takes 10%, artists fund gets 10%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Superfan Section */}
      <section className="py-16 md:py-24 bg-[var(--pf-bg)]">
        <div className="pf-container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[var(--pf-orange)]/10 via-purple-500/5 to-[var(--pf-bg)] rounded-3xl p-8 md:p-12 border border-[var(--pf-border)]">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)]/20 border border-[var(--pf-orange)]/30 rounded-full text-[var(--pf-orange)] text-sm font-medium mb-4">
                  <span className="text-lg">⭐</span>
                  New: Superfan Program
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Become a <span className="text-[var(--pf-orange)]">Superfan</span>
                </h2>
                <p className="text-[var(--pf-text-secondary)] text-lg max-w-2xl mx-auto">
                  Earn rewards when your favorite artists succeed. Share your link, fans buy, you earn.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[var(--pf-bg)]/50 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">🎁</div>
                  <h3 className="font-bold mb-2">Earn Rewards</h3>
                  <p className="text-sm text-[var(--pf-text-secondary)]">Get 3% of every sale made through your unique Superfan link</p>
                </div>
                <div className="bg-[var(--pf-bg)]/50 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">👑</div>
                  <h3 className="font-bold mb-2">Exclusive Access</h3>
                  <p className="text-sm text-[var(--pf-text-secondary)]">Unlock special badges, early drops, and behind-the-scenes content</p>
                </div>
                <div className="bg-[var(--pf-bg)]/50 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">💫</div>
                  <h3 className="font-bold mb-2">Support Artists</h3>
                  <p className="text-sm text-[var(--pf-text-secondary)]">Your success directly funds the artists you love</p>
                </div>
              </div>
              
              <div className="text-center">
                <Link href="/signup/superfan" className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--pf-orange)] text-white rounded-xl font-bold hover:bg-[var(--pf-orange)]/90 transition-colors">
                  Join the Superfan Program
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artist */}
      <section className="py-16 md:py-24 bg-[var(--pf-bg)]">
        <div className="pf-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              Featured Artist
            </h2>
            <Link href="/artist/od-porter" className="text-[var(--pf-orange)] hover:underline text-sm font-medium">
              View Profile →
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl overflow-hidden border border-[var(--pf-border)]">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Artist Info */}
              <div className="p-6 md:p-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    O
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">O D Porter</h3>
                      <span className="text-blue-400">✓</span>
                    </div>
                    <p className="text-sm text-[var(--pf-text-secondary)]">St. Louis, MO</p>
                  </div>
                </div>
                
                <p className="text-[var(--pf-text-secondary)] mb-6">
                  Independent artist and founder. Born in Miami, raised in NOLA & STL. 
                  Building a platform where artists own everything.
                </p>
                
                <div className="flex gap-4 mb-6">
                  <div>
                    <div className="text-2xl font-bold text-[var(--pf-orange)]">{TRACKS.length}</div>
                    <div className="text-xs text-[var(--pf-text-muted)]">Tracks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--pf-orange)]">{new Set(TRACKS.map(t => t.album)).size}</div>
                    <div className="text-xs text-[var(--pf-text-muted)]">Albums</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--pf-orange)]">{formattedPlays}</div>
                    <div className="text-xs text-[var(--pf-text-muted)]">Plays</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Link href="/artist/od-porter" className="pf-btn pf-btn-primary">
                    <Users size={18} className="mr-2" />
                    Follow Artist
                  </Link>
                  <Link href="/digital" className="pf-btn pf-btn-secondary">
                    <Play size={18} className="mr-2" />
                    Play Music
                  </Link>
                </div>
              </div>
              
              {/* Latest Releases */}
              <div className="p-6 md:p-10 bg-[var(--pf-surface)]">
                <h4 className="text-sm font-semibold text-[var(--pf-text-muted)] mb-4">LATEST RELEASES</h4>
                <div className="space-y-3">
                  {featuredTracks.slice(0, 5).map(track => (
                    // Derive album slug from album name (e.g. "Ambiguous" → "ambiguous")
                    <Link 
                      key={track.id}
                      href={`/album/${track.album.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--pf-bg)] transition-colors group"
                    >
                      <div className="w-12 h-12 rounded relative shrink-0">
                        <Image src={track.image} alt={track.title} fill sizes="48px" className="object-cover rounded" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-[var(--pf-orange)] transition-colors">
                          {track.title}
                        </p>
                        <p className="text-sm text-[var(--pf-text-muted)] truncate">{track.artist}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-[var(--pf-text-muted)]">{track.duration}</span>
                        <span className="text-xs text-[var(--pf-orange)] font-medium">${track.price}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 md:py-24 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Explore Porterful
          </h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
            <Link href="/digital" className="group bg-[var(--pf-bg)] rounded-xl p-6 border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[var(--pf-orange)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--pf-orange)]/20 transition-colors">
                <Music size={24} className="text-[var(--pf-orange)]" />
              </div>
              <h3 className="font-bold mb-1">Music</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Stream and buy tracks</p>
            </Link>
            
            <Link href="/artists" className="group bg-[var(--pf-bg)] rounded-xl p-6 border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[var(--pf-orange)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--pf-orange)]/20 transition-colors">
                <Users size={24} className="text-[var(--pf-orange)]" />
              </div>
              <h3 className="font-bold mb-1">Artists</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Discover artists</p>
            </Link>
            
            <Link href="/shop" className="group bg-[var(--pf-bg)] rounded-xl p-6 border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[var(--pf-orange)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--pf-orange)]/20 transition-colors">
                <ShoppingCart size={24} className="text-[var(--pf-orange)]" />
              </div>
              <h3 className="font-bold mb-1">Marketplace</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Merch and products</p>
            </Link>
            
            <Link href="/radio" className="group bg-[var(--pf-bg)] rounded-xl p-6 border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[var(--pf-orange)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--pf-orange)]/20 transition-colors">
                <Radio size={24} className="text-[var(--pf-orange)]" />
              </div>
              <h3 className="font-bold mb-1">Radio</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">24/7 streaming</p>
            </Link>
            
            <Link href="/playlists" className="group bg-[var(--pf-bg)] rounded-xl p-6 border border-[var(--pf-border)] hover:border-[var(--pf-orange)] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[var(--pf-orange)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--pf-orange)]/20 transition-colors">
                <Disc3 size={24} className="text-[var(--pf-orange)]" />
              </div>
              <h3 className="font-bold mb-1">Playlists</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Curated collections</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[var(--pf-orange)] to-purple-600">
        <div className="pf-container text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            Ready to Own Your Music?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Join Porterful as an artist. Upload your music, sell merch, and keep 80% of everything.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=artist" className="px-8 py-4 bg-white text-[var(--pf-orange)] rounded-xl font-bold hover:bg-gray-100 transition-colors">
              Start as Artist
            </Link>
            <Link href="/digital" className="px-8 py-4 bg-white/10 text-white border border-white/30 rounded-xl font-bold hover:bg-white/20 transition-colors">
              Browse Music
            </Link>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <button
        onClick={scrollTop}
        className={`fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full bg-[var(--pf-orange)] text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-[var(--pf-orange-dark)] active:scale-95 ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}