'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff6b00]/10 to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            The Artist Economy
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Porterful is a four-sided marketplace where artists earn from ALL purchases—not just their merch. Because creators deserve a retirement plan too.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                No 401(k) for Artists
              </h2>
              <p className="text-gray-300 mb-4">
                Local artists don't have pensions. Touring musicians don't get royalties. Independent creators are one bad month away from quitting.
              </p>
              <p className="text-gray-300 mb-4">
                We built Porterful to change that. When you shop on Porterful, artists earn—whether it's their merch or not. Every purchase contributes to artist earnings.
              </p>
              <p className="text-[#ff6b00] font-semibold">
                This isn't a marketplace. It's a retirement plan.
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800">
              <div className="text-6xl mb-4">🎸</div>
              <h3 className="text-2xl font-bold mb-2">Artist-First Revenue</h3>
              <p className="text-gray-400 mb-4">
                Artists keep 80% of their merch sales, plus they earn from marketplace purchases made by their fans.
              </p>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#ff6b00]">80%</div>
                  <div className="text-sm text-gray-500">Artist keeps</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#ff6b00]">5%</div>
                  <div className="text-sm text-gray-500">Platform fee</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#ff6b00]">15%</div>
                  <div className="text-sm text-gray-500">Processing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-[#111]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Four Sides, One Mission</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-[#ff6b00]/50 transition-colors">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-bold mb-2">Artists</h3>
              <p className="text-gray-400 text-sm">
                Upload merch, music, and exclusive content. Earn from every purchase—not just yours.
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-[#ff6b00]/50 transition-colors">
              <div className="text-4xl mb-4">💜</div>
              <h3 className="text-xl font-bold mb-2">Superfans</h3>
              <p className="text-gray-400 text-sm">
                Share referral codes, earn 5% on merch and 3% on marketplace. Build your artist's success.
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-[#ff6b00]/50 transition-colors">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-xl font-bold mb-2">Small Businesses</h3>
              <p className="text-gray-400 text-sm">
                List products in our marketplace. Artists promote you. You get sales. Win-win.
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-[#ff6b00]/50 transition-colors">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Brands</h3>
              <p className="text-gray-400 text-sm">
                Sponsor artists, run campaigns, reach engaged audiences through authentic partnerships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Why It Matters</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-5xl font-bold text-[#ff6b00] mb-2">97%</div>
              <p className="text-gray-400">of musicians earn less than $40k/year</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#ff6b00] mb-2">$0</div>
              <p className="text-gray-400">typical retirement savings for independent artists</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#ff6b00] mb-2">∞</div>
              <p className="text-gray-400">potential for passive income through superfans</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-r from-[#ff6b00]/20 to-[#ff6b00]/5 rounded-2xl p-12 border border-[#ff6b00]/30">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Artist Economy?</h2>
          <p className="text-gray-300 mb-6">
            Whether you're an artist, a fan, a business, or a brand—there's a place for you here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="bg-[#ff6b00] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#ff8533] transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/artists" 
              className="bg-transparent border border-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors"
            >
              Browse Artists
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}