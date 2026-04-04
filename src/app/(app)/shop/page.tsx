'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Truck, Shield, RefreshCw, Sparkles } from 'lucide-react';
import { FEATURED_PRODUCTS, type Product } from '@/lib/products';

// ─── Chain Builder (moved from original page) ───────────────────────────────

const METALS = [
  { id: 'silver', label: 'Sterling Silver', price: 45, hex: 'bg-gray-300' },
  { id: 'gold', label: '14K Gold Vermeil', price: 55, hex: 'bg-yellow-400' },
  { id: 'rosegold', label: 'Rose Gold', price: 50, hex: 'bg-pink-400' },
];

const LENGTHS = [
  { value: 16, label: '16"', desc: 'Choker' },
  { value: 18, label: '18"', desc: 'Standard' },
  { value: 20, label: '20"', desc: 'Loose' },
  { value: 22, label: '22"', desc: 'Extended' },
];

function IdentityBuilder() {
  const [name, setName] = useState('');
  const [metal, setMetal] = useState(METALS[0]);
  const [length, setLength] = useState(18);
  const [loading, setLoading] = useState(false);

  const maxChars = 12;
  const displayName = name.trim() || 'YOUR NAME';
  const price = metal.price;

  const handleCheckout = useCallback(async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: `chain-${metal.id}-${length}`,
            name: `Custom Name Chain — ${displayName}`,
            price,
            type: 'physical',
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
            metal: metal.label,
            length,
          }],
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  }, [name, metal, length, displayName, price]);

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Preview */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className={`text-4xl lg:text-6xl font-bold tracking-wider mb-8 transition-colors duration-300 ${
            metal.id === 'gold' ? 'text-yellow-400' :
            metal.id === 'rosegold' ? 'text-pink-400' :
            'text-[var(--pf-text-secondary)]'
          }`}>
            {displayName.toUpperCase()}
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className={`w-28 h-0.5 rounded-full ${metal.hex}`} />
            <div className={`w-3 h-3 rounded-full ${metal.hex}`} />
            <div className={`w-28 h-0.5 rounded-full ${metal.hex}`} />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            metal.id === 'gold' ? 'bg-yellow-400/20 text-yellow-400' :
            metal.id === 'rosegold' ? 'bg-pink-400/20 text-pink-400' :
            'bg-gray-400/20 text-[var(--pf-text-secondary)]'
          }`}>
            {metal.label}
          </span>
          <span className="text-white/50 text-sm">{length}&quot; chain</span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-6">
        {/* Name input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--pf-text-secondary)]">Your Name</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, maxChars))}
              placeholder="Type any name..."
              className="w-full px-5 py-3.5 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl text-lg font-medium focus:outline-none focus:border-yellow-400/60 transition-colors placeholder:text-[var(--pf-text-secondary)]"
              maxLength={maxChars}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--pf-text-secondary)]">
              {name.length}/{maxChars}
            </span>
          </div>
        </div>

        {/* Metal selector */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--pf-text-secondary)]">Metal</label>
          <div className="grid grid-cols-3 gap-2">
            {METALS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMetal(m)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  metal.id === m.id
                    ? 'border-yellow-400/60 bg-yellow-400/5'
                    : 'border-[var(--pf-border)] hover:border-[var(--pf-text-secondary)]'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${m.hex} mx-auto mb-1.5 shadow-lg`} />
                <p className="text-xs font-medium">{m.label}</p>
                <p className="text-xs text-[var(--pf-text-secondary)]">${m.price}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Length selector */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--pf-text-secondary)]">Chain Length</label>
          <div className="grid grid-cols-4 gap-2">
            {LENGTHS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLength(l.value)}
                className={`p-2.5 rounded-xl border-2 transition-all text-center ${
                  length === l.value
                    ? 'border-yellow-400/60 bg-yellow-400/5'
                    : 'border-[var(--pf-border)] hover:border-[var(--pf-text-secondary)]'
                }`}
              >
                <p className="font-medium text-sm">{l.label}</p>
                <p className="text-xs text-[var(--pf-text-secondary)]">{l.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Summary + CTA */}
        <div className="p-5 rounded-xl bg-[var(--pf-bg)] border border-[var(--pf-border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--pf-text-secondary)]">Custom Name Chain</span>
            <span className="font-bold text-lg">${price}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={!name.trim() || loading}
            className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
              !name.trim() || loading
                ? 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] cursor-not-allowed'
                : 'bg-yellow-500/90 hover:bg-yellow-400 text-black'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Add to Cart — ${price} <ArrowRight size={16} /></>
            )}
          </button>
          <p className="text-xs text-center text-[var(--pf-text-secondary)] mt-2">Ships in 5–7 days · Free shipping</p>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);

  const handleBuy = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: product.id,
            name: product.name,
            price: product.price,
            type: 'physical',
            quantity: 1,
            image: product.image,
          }],
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  }, [product]);

  return (
    <div className="group rounded-2xl overflow-hidden bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-border-hover)] transition-all">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <p className="text-xs text-[var(--pf-text-secondary)] uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-bold text-base mb-1 leading-tight">{product.name}</h3>
        <p className="text-sm text-[var(--pf-text-secondary)] mb-4 line-clamp-2 leading-snug">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">${product.price}</span>
          <button
            onClick={handleBuy}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[var(--pf-bg)] border border-[var(--pf-border)] hover:border-yellow-400/50 text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Buy <ArrowRight size={14} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Shop Page ──────────────────────────────────────────────────────────

export default function ShopPage() {
  // Split products into categories
  const essentialsProducts = FEATURED_PRODUCTS.filter(p => p.category !== 'Book');
  const bookProduct = FEATURED_PRODUCTS.find(p => p.id === 'book-tiigh');

  return (
    <div className="min-h-screen pb-24">

      {/* BACK NAV */}
      <div className="border-b border-[var(--pf-border)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors">
            <ArrowLeft size={16} />
            Back to Porterful
          </Link>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--pf-bg)] to-[var(--pf-surface)]">
        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-widest text-yellow-400/70 mb-4">Porterful Shop</p>
            <h1 className="text-5xl lg:text-6xl font-bold leading-none mb-4">
              Culture.<br />Commerce.
            </h1>
            <p className="text-lg text-[var(--pf-text-secondary)] max-w-md">
              Music, identity, and the things that matter. Curated by O D Porter.
            </p>
          </div>
        </div>
      </section>

      {/* ── CATEGORY GRID ── */}
      <section className="border-t border-[var(--pf-border)]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Music */}
            <Link href="/music" className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black aspect-square flex flex-col justify-end p-6 border border-[var(--pf-border)] hover:border-[var(--pf-border-hover)] transition-all">
              <div className="absolute inset-0 opacity-20">
                <Image src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800" alt="" fill className="object-cover" />
              </div>
              <div className="relative">
                <p className="text-xs uppercase tracking-widest text-yellow-400/60 mb-2">Category</p>
                <h2 className="text-2xl font-bold mb-1">Music</h2>
                <p className="text-sm text-[var(--pf-text-muted)] mb-4">Music that matters. Own it.</p>
                <div className="flex items-center gap-1.5 text-sm font-medium text-yellow-400/80 group-hover:text-yellow-400 transition-colors">
                  Browse <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            {/* Identity */}
            <a href="#identity" className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black aspect-square flex flex-col justify-end p-6 border border-[var(--pf-border)] hover:border-[var(--pf-border-hover)] transition-all">
              <div className="absolute inset-0 opacity-20">
                <Image src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800" alt="" fill className="object-cover" />
              </div>
              <div className="relative">
                <p className="text-xs uppercase tracking-widest text-yellow-400/60 mb-2">Category</p>
                <h2 className="text-2xl font-bold mb-1">Identity</h2>
                <p className="text-sm text-[var(--pf-text-muted)] mb-4">Your name. In metal.</p>
                <div className="flex items-center gap-1.5 text-sm font-medium text-yellow-400/80 group-hover:text-yellow-400 transition-colors">
                  Build yours <ArrowRight size={14} />
                </div>
              </div>
            </a>

            {/* Essentials */}
            <Link href="/music" className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black aspect-square flex flex-col justify-end p-6 border border-[var(--pf-border)] hover:border-[var(--pf-border-hover)] transition-all">
              <div className="absolute inset-0 opacity-20">
                <Image src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800" alt="" fill className="object-cover" />
              </div>
              <div className="relative">
                <p className="text-xs uppercase tracking-widest text-yellow-400/60 mb-2">Category</p>
                <h2 className="text-2xl font-bold mb-1">Essentials</h2>
                <p className="text-sm text-[var(--pf-text-muted)] mb-4">Books, merch, culture.</p>
                <div className="flex items-center gap-1.5 text-sm font-medium text-yellow-400/80 group-hover:text-yellow-400 transition-colors">
                  Shop now <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            {/* Featured — The Book */}
            <Link href="#featured" className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black aspect-square flex flex-col justify-end p-6 border border-[var(--pf-border)] hover:border-[var(--pf-border-hover)] transition-all">
              <div className="absolute inset-0 opacity-30">
                <Image src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800" alt="" fill className="object-cover" />
              </div>
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-xs font-medium text-yellow-400">$25</span>
              </div>
              <div className="relative">
                <p className="text-xs uppercase tracking-widest text-yellow-400/60 mb-2">Featured</p>
                <h2 className="text-2xl font-bold mb-1">The Book</h2>
                <p className="text-sm text-[var(--pf-text-muted)] mb-4">There It Is, Here It Go</p>
                <div className="flex items-center gap-1.5 text-sm font-medium text-yellow-400/80 group-hover:text-yellow-400 transition-colors">
                  Get it <ArrowRight size={14} />
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCT — THE BOOK ── */}
      {bookProduct && (
        <section id="featured" className="border-t border-[var(--pf-border)]">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <p className="text-xs uppercase tracking-widest text-yellow-400/60 mb-8 text-center">Featured Release</p>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Book cover */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl max-w-sm mx-auto lg:mx-0">
                <Image
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=90"
                  alt="There It Is, Here It Go book cover"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white/60 text-sm">by O D Porter</p>
                </div>
              </div>

              {/* Info + CTA */}
              <div>
                <p className="text-sm uppercase tracking-widest text-yellow-400/70 mb-3">Memoir</p>
                <h2 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  There It Is,<br />Here It Go
                </h2>
                <p className="text-[var(--pf-text-secondary)] text-lg mb-8 max-w-lg leading-relaxed">
                  A powerful memoir from O D Porter — raw, honest, and deeply personal. The story of an artist from St. Louis who refused to quit. 240 pages, published 2024.
                </p>

                <div className="flex items-baseline gap-3 mb-8">
                  <span className="text-5xl font-bold">$25</span>
                  <span className="text-[var(--pf-text-secondary)]">+ free shipping</span>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={async () => {
                      const res = await fetch('/api/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          items: [{
                            id: bookProduct.id,
                            name: bookProduct.name,
                            price: bookProduct.price,
                            type: 'physical',
                            quantity: 1,
                            image: bookProduct.image,
                          }],
                        }),
                      });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                    }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-500/90 hover:bg-yellow-400 text-black font-bold rounded-full transition-colors"
                  >
                    Get the Book
                    <ArrowRight size={18} />
                  </button>
                  <Link href="/music" className="inline-flex items-center gap-2 px-8 py-4 border border-[var(--pf-border)] hover:border-[var(--pf-text-secondary)] rounded-full transition-colors">
                    Listen to O D Porter
                  </Link>
                </div>

                {/* Guarantees */}
                <div className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t border-[var(--pf-border)]">
                  {[
                    { icon: Truck, label: 'Free Shipping', sub: 'On all orders' },
                    { icon: Shield, label: 'Solid Build', sub: 'Premium quality' },
                    { icon: RefreshCw, label: 'Easy Returns', sub: '30-day policy' },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-[var(--pf-surface)] flex items-center justify-center mx-auto mb-2">
                        <Icon size={18} className="text-yellow-400/70" />
                      </div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-[var(--pf-text-secondary)]">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── IDENTITY BUILDER ── */}
      <section id="identity" className="border-t border-[var(--pf-border)] bg-[var(--pf-surface)]/30">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-yellow-400/60 mb-2">Custom Piece</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-2">Your Name. In Metal.</h2>
            <p className="text-[var(--pf-text-secondary)] max-w-md mx-auto">
              Sterling silver, 14K gold vermeil, or rose gold. Handcrafted to order. Yours alone.
            </p>
          </div>
          <IdentityBuilder />
        </div>
      </section>

      {/* ── PRODUCT GRID — ESSENTIALS ── */}
      {essentialsProducts.length > 0 && (
        <section className="border-t border-[var(--pf-border)]">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-yellow-400/60 mb-2">Curated</p>
                <h2 className="text-2xl lg:text-3xl font-bold">Essentials</h2>
              </div>
              <Link href="/music" className="text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors flex items-center gap-1.5">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {essentialsProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BOTTOM CTA ── */}
      <section className="border-t border-[var(--pf-border)]">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">More from O D Porter</h2>
          <p className="text-[var(--pf-text-secondary)] mb-8 max-w-md mx-auto">
            Music, merch, and more. Everything built for the culture.
          </p>
          <Link href="/music" className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-border-hover)] rounded-full transition-colors font-medium">
            Explore Music
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}
