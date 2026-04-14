'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, Shield, TrendingUp, Plus, Loader2, Link2 } from 'lucide-react';

const STORE_PRODUCTS = [
  { id: 'credit-klimb', name: 'Credit Klimb', description: 'Professional credit repair guidance. Fix your credit, unlock financial freedom.', price: 49, emoji: '🏦' },
  { id: 'nlds-membership', name: 'NLDS Deal Access', description: 'Weekly land deal drops. Tax deeds, land bank properties, government opportunities.', price: 25, emoji: '🗺️' },
  { id: 'teachyoung', name: 'TeachYoung', description: 'AI-powered learning for kids. Snap a photo, get a lesson. For Honor & Noble.', price: 19, emoji: '📚' },
  { id: 'family-os', name: 'Family Legacy OS', description: 'Preserve your family history. Build a lasting legacy for generations.', price: 39, emoji: '🌳' },
];

function ProductCard({ product, username }: { product: typeof STORE_PRODUCTS[0]; username: string }) {
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [offerLink, setOfferLink] = useState<string | null>(null);
  const [offerId, setOfferId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateOffer = async () => {
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (data.offer_id) {
        setOfferId(data.offer_id);
        setOfferLink(data.offer_url || data.offer_link);
      } else {
        setError(data.error || 'Failed to create offer');
      }
    } catch {
      setError('Network error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl overflow-hidden hover:border-[var(--pf-orange)]/40 transition-all"
    >
      <div className="aspect-square bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-500/10 flex items-center justify-center">
        <div className="text-4xl">{product.emoji}</div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-lg">{product.name}</h3>
          <span className="text-lg font-bold text-[var(--pf-orange)]">${product.price}</span>
        </div>
        <p className="text-sm text-[var(--pf-text-secondary)] mb-4 leading-relaxed">{product.description}</p>

        {/* Commission info */}
        <div className="flex items-center gap-4 text-xs text-[var(--pf-text-muted)] mb-4">
          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 3% commission</span>
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure payment</span>
        </div>

        {/* Offer link (after creation) */}
        {offerLink ? (
          <div className="mb-4 p-3 bg-[var(--pf-bg)] border border-green-500/30 rounded-xl">
            <p className="text-xs text-green-400 font-medium mb-2 flex items-center gap-1">
              <Check className="w-3 h-3" /> Offer link created!
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={offerLink}
                className="flex-1 px-2 py-1.5 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg text-xs font-mono text-[var(--pf-text-muted)] truncate"
              />
              <button
                onClick={() => handleCopy(offerLink)}
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-1 text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <a
              href={offerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block w-full py-2 text-center bg-[var(--pf-orange)] text-white rounded-lg font-bold text-sm hover:bg-[var(--pf-orange)]/90 transition"
            >
              Preview Your Offer →
            </a>
          </div>
        ) : (
          <>
            {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
            <button
              onClick={handleCreateOffer}
              disabled={creating}
              className="w-full py-2.5 bg-[var(--pf-orange)] text-white rounded-xl hover:bg-[var(--pf-orange)]/90 disabled:opacity-50 transition flex items-center justify-center gap-2 text-sm font-bold mb-3"
            >
              {creating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
              ) : (
                <><Plus className="w-4 h-4" /> Create Offer</>
              )}
            </button>
          </>
        )}

        <p className="text-xs text-center text-gray-600 mb-3">Earn commission when someone purchases through your link</p>

        {/* Preview link */}
        <a
          href={`/offer/PREVIEW-${product.id.toUpperCase()}?preview=1`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-2 bg-[var(--pf-bg)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]/40 text-center rounded-lg font-medium text-sm text-gray-400 hover:text-white transition"
        >
          Preview offer page →
        </a>
      </div>
    </motion.div>
  );
}

export default function UserStore() {
  const params = useParams();
  const username = (params.username as string || '').toLowerCase();
  const [user, setUser] = useState<{ username: string; displayName: string; lkId: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(sessionData => {
        if (sessionData.authenticated) {
          setUser({ username, displayName: sessionData.email?.split('@')[0] || username, lkId: sessionData.lkId || '' });
        } else {
          setUser({ username, displayName: username.charAt(0).toUpperCase() + username.slice(1), lkId: '' });
        }
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [username]);

  if (loading) return (
    <main className="min-h-screen bg-[var(--pf-bg)] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[var(--pf-orange)] border-t-transparent rounded-full animate-spin" />
    </main>
  );

  return (
    <main className="min-h-screen bg-[var(--pf-bg)]">
      <div className="bg-gradient-to-r from-[var(--pf-orange)]/10 via-[var(--pf-bg)] to-purple-500/10 border-b border-[var(--pf-border)]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link href="/store" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Porterful Store
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-2xl font-bold shrink-0">
              {user?.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black">@{user?.username}</h1>
              <p className="text-[var(--pf-text-muted)]">Create offers and earn commission on every sale</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Your Products</h2>
          <span className="text-sm text-[var(--pf-text-muted)]">Click "Create Offer" → copy link → share → earn</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STORE_PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} username={user?.username || username} />
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-[var(--pf-orange)]/5 to-purple-500/5 rounded-2xl p-8 border border-[var(--pf-border)]">
          <h3 className="text-xl font-bold mb-4">How offer earnings work</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Create offer', desc: 'Click "Create Offer" on any product — your price is locked in' },
              { step: '2', title: 'Copy your link', desc: 'Your unique offer link is generated with your identity embedded' },
              { step: '3', title: 'Earn 3% commission', desc: 'When someone buys through your link, you earn automatically' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--pf-orange)]/10 flex items-center justify-center mx-auto mb-3 text-xl font-bold">{step}</div>
                <h4 className="font-bold mb-1">{title}</h4>
                <p className="text-sm text-[var(--pf-text-muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
