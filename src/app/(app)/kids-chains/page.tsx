'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Loader2, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

const SIZES = {
  small:  { label: 'Small',  dims: '~2" wide',  desc: 'Great for kids, lightweight', price: 10 },
  medium: { label: 'Medium', dims: '~3" wide',  desc: 'Standard, most popular',   price: 15 },
  large:  { label: 'Large',  dims: '~4" wide',  desc: 'Bold statement piece',      price: 20 },
};

const FONTS = {
  bold:   { label: 'Bold / Streetwear', font: 'Arial Black',      desc: 'Clean, chunky, street style' },
  luxury: { label: 'Luxury / Serif',    font: 'Georgia',           desc: 'Elegant, high-end feel' },
  script: { label: 'Script / Mono',      font: 'DejaVu Sans Mono', desc: 'Connected cursive, industrial' },
};

export default function KidsChainsPage() {
  const [name, setName] = useState('');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [font, setFont] = useState<'bold' | 'luxury' | 'script'>('bold');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const price = SIZES[size].price;

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('cancelled') === '1') {
      setError('Checkout cancelled. No charge was made.');
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter a name.'); return; }
    if (name.trim().length > 20) { setError('Name must be 20 characters or less.'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/kids-chains-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), size, font }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Custom 3D Name Chains | Porterful Kids</title>
        <meta name="description" content="Custom 3D printed name chains — made to order. Gold finish, kids crafts, personalized jewelry." />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white">
        {/* Header */}
        <div className="border-b border-[var(--pf-border)]">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-white font-bold text-lg">Porterful</Link>
            <Link href="/kids-chains" className="text-amber-400 text-sm font-medium">Custom Chains</Link>
          </div>
        </div>

        {/* Hero */}
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
          <div className="inline-block bg-amber-900/40 border border-amber-700 rounded-full px-4 py-1.5 mb-6">
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Made to Order</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-4">
            Custom 3D Name Chains
          </h1>
          <p className="text-[var(--pf-text-muted)] text-lg max-w-xl mx-auto">
            3D printed, painted gold, made just for you. Each one hand-finished by our team.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-2 gap-10">

            {/* Left — Product info */}
            <div>
              <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-6 mb-6">
                <h2 className="text-white font-bold text-lg mb-4">How it works</h2>
                <ol className="space-y-4">
                  {[
                    { step: '1', title: 'You order', desc: 'Choose name, size & font. We\'ll start printing immediately.' },
                    { step: '2', title: 'We print', desc: 'Your name is 3D printed with precision settings.' },
                    { step: '3', title: 'Hand-finished', desc: 'Spray-painted gold with gloss coat for real jewelry look.' },
                    { step: '4', title: 'Packaged & shipped', desc: 'Packed in a protective sleeve, shipped to your door.' },
                  ].map(({ step, title, desc }) => (
                    <li key={step} className="flex gap-4">
                      <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                        {step}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">{title}</div>
                        <div className="text-[var(--pf-text-muted)] text-xs mt-0.5">{desc}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-6">
                <h2 className="text-white font-bold text-lg mb-4">Product details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--pf-text-muted)]">Material</span>
                    <span className="text-white">3D printed PLA, gold spray finish</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--pf-text-muted)]">Chain loop</span>
                    <span className="text-white">Built-in ring for any standard chain</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--pf-text-muted)]">Turnaround</span>
                    <span className="text-white">3–5 business days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--pf-text-muted)]">Sizes</span>
                    <span className="text-white">2", 3", or 4" wide</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--pf-text-muted)]">Fonts</span>
                    <span className="text-white">3 styles to choose from</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Order form */}
            <div>
              <form
                onSubmit={handleSubmit}
                className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-6"
              >
                <h2 className="text-white font-bold text-xl mb-6">Place your order</h2>

                {/* Name input */}
                <div className="mb-6">
                  <label className="block text-[var(--pf-text-secondary)] text-sm font-medium mb-2">
                    Name on the chain <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9 &'-]/g, ''))}
                    placeholder="e.g. JAYDEN"
                    maxLength={20}
                    required
                    className="w-full bg-stone-800 border border-[var(--pf-border)] rounded-xl px-4 py-3 text-white text-lg font-mono tracking-wider placeholder:text-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <div className="text-stone-500 text-xs mt-1 text-right">{name.length}/20</div>
                </div>

                {/* Font selector */}
                <div className="mb-6">
                  <label className="block text-[var(--pf-text-secondary)] text-sm font-medium mb-2">Font style</label>
                  <div className="space-y-2">
                    {Object.entries(FONTS).map(([key, f]) => (
                      <label
                        key={key}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          font === key
                            ? 'border-amber-500 bg-amber-900/20'
                            : 'border-[var(--pf-border)] bg-[var(--pf-surface)] hover:border-stone-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="font"
                          value={key}
                          checked={font === key}
                          onChange={() => setFont(key as "bold" | "luxury" | "script")}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          font === key ? 'border-amber-500' : 'border-stone-600'
                        }`}>
                          {font === key && <div className="w-2 h-2 bg-amber-500 rounded-full" />}
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">{f.label}</div>
                          <div className="text-[var(--pf-text-muted)] text-xs">{f.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Size selector */}
                <div className="mb-8">
                  <label className="block text-[var(--pf-text-secondary)] text-sm font-medium mb-2">Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(SIZES).map(([key, s]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSize(key as "small" | "medium" | "large")}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                          size === key
                            ? 'border-amber-500 bg-amber-900/20'
                            : 'border-[var(--pf-border)] bg-[var(--pf-surface)] hover:border-stone-600'
                        }`}
                      >
                        <div className="text-white font-bold text-sm">{s.label}</div>
                        <div className="text-[var(--pf-text-muted)] text-xs">{s.dims}</div>
                        <div className="text-amber-400 font-bold text-sm mt-1">${s.price}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price summary */}
                <div className="bg-[var(--pf-surface)] rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--pf-text-secondary)] text-sm">Your custom chain</span>
                    <span className="text-3xl font-black text-white">${price}</span>
                  </div>
                  <div className="text-stone-500 text-xs mt-1">+ free shipping · US only</div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-[var(--pf-surface)] disabled:text-[var(--pf-text-muted)] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirecting to checkout...
                    </>
                  ) : (
                    <>
                      Order Now — ${price}
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 mt-4 text-stone-500 text-xs">
                  <span>🔒 Secured by Stripe</span>
                  <span>·</span>
                  <span>3–5 day turnaround</span>
                </div>
              </form>

              <p className="text-stone-500 text-xs text-center mt-4">
                Orders go directly to our production team. You&apos;ll receive an order confirmation via email.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
