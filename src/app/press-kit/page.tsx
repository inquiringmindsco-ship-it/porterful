'use client';

import Link from 'next/link';
import { Download, Mail, Globe, Users, Zap, Heart } from 'lucide-react';

export default function PressKitPage() {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Press Kit</h1>
          <p className="text-xl text-[var(--pf-text-secondary)]">
            Everything you need to write about Porterful
          </p>
        </div>

        {/* Quick Facts */}
        <div className="pf-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Quick Facts</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-[var(--pf-text-muted)] uppercase tracking-wider mb-1">Founded</p>
              <p className="text-2xl font-bold">2024</p>
              <p className="text-sm text-[var(--pf-text-secondary)]">New Orleans, LA</p>
            </div>
            <div>
              <p className="text-sm text-[var(--pf-text-muted)] uppercase tracking-wider mb-1">Mission</p>
              <p className="text-2xl font-bold">Artist Economy</p>
              <p className="text-sm text-[var(--pf-text-secondary)]">Where creators own everything</p>
            </div>
            <div>
              <p className="text-sm text-[var(--pf-text-muted)] uppercase tracking-wider mb-1">Revenue Split</p>
              <p className="text-2xl font-bold">80%</p>
              <p className="text-sm text-[var(--pf-text-secondary)]">To artists on merch</p>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="pf-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">About Porterful</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-[var(--pf-text-secondary)] mb-4">
              Porterful is a four-sided marketplace connecting artists, superfans, small businesses, and brands. 
              Unlike traditional music platforms where artists receive fractions of a cent per stream, 
              Porterful ensures artists earn from every transaction—not just their own merch.
            </p>
            <p className="text-[var(--pf-text-secondary)] mb-4">
              The platform's "Proud to Pay" model lets fans directly support artists with transparent pricing. 
              Superfans can earn referral income by sharing artists they love. Businesses can list products 
              in the marketplace, with a portion of each sale going to artists.
            </p>
            <p className="text-[var(--pf-text-secondary)]">
              Founded by O D Porter in 2024, Porterful is based in St. Louis, Missouri — with roots in Miami and New Orleans.
            </p>
          </div>
        </div>

        {/* Founders */}
        <div className="pf-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Founder</h2>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-4xl shrink-0">
              🎤
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">O D Porter</h3>
              <p className="text-[var(--pf-orange)] mb-3">Founder & CEO</p>
              <p className="text-[var(--pf-text-secondary)]">
                Musician, entrepreneur, and advocate for independent artists. O D created Porterful 
                after experiencing firsthand how traditional platforms fail to compensate creators fairly.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="pf-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--pf-orange)]/20 flex items-center justify-center shrink-0">
                <Heart className="text-[var(--pf-orange)]" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Proud to Pay</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Fans choose how much to pay. $1 stream minimum, or support at $5, $10, $20+ tiers.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <Users className="text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Superfan Referrals</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Fans earn 5% on merch referrals, 3% on marketplace items.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                <Globe className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Marketplace</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Businesses list products; every purchase supports an artist.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                <Zap className="text-green-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Artist Radio</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Stream music directly. Premium features for supporters.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Downloads */}
        <div className="pf-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Downloads</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <a 
              href="/press/porterful-logo-dark.svg" 
              className="flex items-center gap-4 p-4 bg-[var(--pf-bg)] rounded-xl hover:bg-[var(--pf-surface)] transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--pf-orange)]/20 flex items-center justify-center">
                <Download className="text-[var(--pf-orange)]" size={20} />
              </div>
              <div>
                <p className="font-medium">Logo (Dark)</p>
                <p className="text-sm text-[var(--pf-text-muted)]">SVG, PNG</p>
              </div>
            </a>
            <a 
              href="/press/porterful-logo-light.svg" 
              className="flex items-center gap-4 p-4 bg-[var(--pf-bg)] rounded-xl hover:bg-[var(--pf-surface)] transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--pf-orange)]/20 flex items-center justify-center">
                <Download className="text-[var(--pf-orange)]" size={20} />
              </div>
              <div>
                <p className="font-medium">Logo (Light)</p>
                <p className="text-sm text-[var(--pf-text-muted)]">SVG, PNG</p>
              </div>
            </a>
            <a 
              href="/press/porterful-press-kit.zip" 
              className="flex items-center gap-4 p-4 bg-[var(--pf-bg)] rounded-xl hover:bg-[var(--pf-surface)] transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--pf-orange)]/20 flex items-center justify-center">
                <Download className="text-[var(--pf-orange)]" size={20} />
              </div>
              <div>
                <p className="font-medium">Full Press Kit</p>
                <p className="text-sm text-[var(--pf-text-muted)]">ZIP (logos, screenshots, bios)</p>
              </div>
            </a>
            <a 
              href="/press/porterful-screenshots.zip" 
              className="flex items-center gap-4 p-4 bg-[var(--pf-bg)] rounded-xl hover:bg-[var(--pf-surface)] transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--pf-orange)]/20 flex items-center justify-center">
                <Download className="text-[var(--pf-orange)]" size={20} />
              </div>
              <div>
                <p className="font-medium">Screenshots</p>
                <p className="text-sm text-[var(--pf-text-muted)]">PNG (homepage, dashboard, mobile)</p>
              </div>
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="pf-card p-8">
          <h2 className="text-2xl font-bold mb-6">Press Contact</h2>
          <div className="flex flex-wrap gap-4">
            <a 
              href="mailto:press@porterful.com" 
              className="pf-btn pf-btn-primary flex items-center gap-2"
            >
              <Mail size={18} />
              press@porterful.com
            </a>
            <a 
              href="https://twitter.com/porterful" 
              target="_blank" 
              rel="noopener"
              className="pf-btn pf-btn-secondary"
            >
              @porterful
            </a>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="mt-8 text-center">
          <Link href="/blog" className="text-[var(--pf-orange)] hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}