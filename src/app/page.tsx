'use client';

import Link from 'next/link';
import { Play, Headphones, ArrowRight, Music, Star, Users, DollarSign, Upload } from 'lucide-react';
import { useSupabase } from '@/app/providers';
import { TRACKS, ARTISTS, PRODUCTS } from '@/lib/data';

export default function Home() {
  const { user } = useSupabase();
  const featuredTracks = TRACKS.slice(0, 3);
  const featuredProducts = PRODUCTS.filter(p => p.category === 'merch' || p.category === 'music').slice(0, 3);
  const artist = ARTISTS[0];

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

              {/* CTAs - Show different buttons based on login state */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                {user ? (
                  // Logged in - show Upload Music and Dashboard
                  <>
                    <Link href="/dashboard/upload" className="pf-btn pf-btn-primary text-lg px-8 py-4">
                      <Upload className="inline mr-2" size={20} />
                      Upload Music
                    </Link>
                    <Link href="/marketplace" className="pf-btn pf-btn-secondary text-lg px-8 py-4">
                      <Headphones className="inline mr-2" size={20} />
                      Browse Shop
                    </Link>
                  </>
                ) : (
                  // Not logged in - show Browse and Listen
                  <>
                    <Link href="/marketplace" className="pf-btn pf-btn-primary text-lg px-8 py-4">
                      <Headphones className="inline mr-2" size={20} />
                      Browse Shop
                    </Link>
                    <Link href="/digital" className="pf-btn pf-btn-secondary text-lg px-8 py-4">
                      <Music className="inline mr-2" size={20} />
                      Listen Now
                    </Link>
                  </>
                )}
              </div>
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

      {/* Featured Products */}
      <section className="py-20">
        <div className="pf-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Featured Releases</h2>
              <p className="text-[var(--pf-text-secondary)]">Support artists directly</p>
            </div>
            <Link href="/marketplace" className="text-[var(--pf-orange)] hover:underline">
              View all <ArrowRight className="inline ml-1" size={16} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Link 
                key={product.id}
                href={`/product/${product.id}`}
                className="pf-card group overflow-hidden"
              >
                <div className="aspect-square bg-[var(--pf-surface)] overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-[var(--pf-text-muted)] uppercase tracking-wider mb-1">
                    {product.type}
                  </p>
                  <h3 className="font-semibold group-hover:text-[var(--pf-orange)] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-[var(--pf-text-secondary)]">{product.artist || product.brand}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold">${product.price}</span>
                    <div className="flex items-center gap-1 text-sm text-[var(--pf-text-muted)]">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      {product.rating}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Proud to Pay */}
      <section className="py-20 bg-[var(--pf-bg-secondary)]">
        <div className="pf-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Pay What You Want
            </h2>
            <p className="text-xl text-[var(--pf-text-secondary)] mb-8">
              Music isn't free. Artists set their price. You choose what to pay.
            </p>

            <div className="pf-card p-8 mb-8">
              <p className="text-2xl font-bold mb-2">$5 minimum</p>
              <p className="text-[var(--pf-text-secondary)]">
                Artists keep 80%. No middleman.
              </p>
            </div>

            <Link href="/digital" className="pf-btn pf-btn-primary">
              Listen Now
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
              {user ? 'Ready to Upload?' : 'Ready to Own Your Music?'}
            </h2>
            <p className="text-xl text-[var(--pf-text-secondary)] mb-8 max-w-xl mx-auto">
              {user 
                ? 'Upload your tracks and start earning from your music today.'
                : 'Upload today. Start earning tomorrow. No label required.'
              }
            </p>
            {user ? (
              <Link href="/dashboard/upload" className="pf-btn pf-btn-primary text-lg px-10 py-4">
                <Upload className="inline mr-2" size={20} />
                Upload Your First Track
              </Link>
            ) : (
              <Link href="/signup?role=artist" className="pf-btn pf-btn-primary text-lg px-10 py-4">
                Get Started Free
                <ArrowRight className="inline ml-2" size={20} />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}// trigger
