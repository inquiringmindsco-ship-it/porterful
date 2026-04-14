'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Copy, Check, Star, Shield, TrendingUp } from 'lucide-react';

interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  type: string;
  artist?: string;
}

interface StoreUser {
  username: string;
  displayName: string;
  lkId: string;
  role: string;
  bio?: string;
  referralCode: string;
  totalReferrals: number;
}

const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'credit-klimb',
    name: 'Credit Klimb',
    description: 'Professional credit repair guidance. Fix your credit, unlock financial freedom.',
    price: 49,
    image: '/og-image.png',
    type: 'service',
  },
  {
    id: 'nlds-membership',
    name: 'NLDS Deal Access',
    description: 'Weekly land deal drops. Tax deeds, land bank properties, government opportunities.',
    price: 25,
    image: '/og-image.png',
    type: 'subscription',
  },
  {
    id: 'teachyoung',
    name: 'TeachYoung',
    description: 'AI-powered learning for kids. Snap a photo, get a lesson. For Honor & Noble.',
    price: 19,
    image: '/og-image.png',
    type: 'app',
  },
  {
    id: 'family-os',
    name: 'Family Legacy OS',
    description: 'Preserve your family history. Build a lasting legacy for generations.',
    price: 39,
    image: '/og-image.png',
    type: 'service',
  },
];

function ProductCard({ product, username }: { product: StoreProduct; username: string }) {
  const [copied, setCopied] = useState(false);

  const referLink = `https://porterful.com/store/${username}?ref=${username}&product=${product.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl overflow-hidden hover:border-[var(--pf-orange)]/40 transition-all"
    >
      <div className="aspect-square bg-gradient-to-br from-[var(--pf-orange)]/10 to-purple-500/10 flex items-center justify-center">
        <div className="text-4xl">{
          product.id === 'credit-klimb' ? '🏦' :
          product.id === 'nlds-membership' ? '🗺️' :
          product.id === 'teachyoung' ? '📚' :
          product.id === 'family-os' ? '🌳' : '📦'
        }</div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-lg">{product.name}</h3>
          <span className="text-lg font-bold text-[var(--pf-orange)]">${product.price}</span>
        </div>
        <p className="text-sm text-[var(--pf-text-secondary)] mb-4 leading-relaxed">{product.description}</p>

        {/* Referral link */}
        <div className="mb-4">
          <p className="text-xs text-[var(--pf-text-muted)] mb-1.5">Your referral link</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={referLink}
              className="flex-1 px-3 py-2 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg text-xs font-mono text-[var(--pf-text-muted)] truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-[var(--pf-orange)] text-white rounded-lg hover:bg-[var(--pf-orange)]/90 transition flex items-center gap-1 text-sm font-medium"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-[var(--pf-text-muted)] mb-4">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            3% commission
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Secure payment
          </span>
        </div>

        {/* CTA */}
        <a
          href={referLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-2.5 bg-[var(--pf-bg)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)] text-center rounded-lg font-medium text-sm transition"
        >
          Preview & Buy →
        </a>
      </div>
    </motion.div>
  );
}

export default function UserStore() {
  const params = useParams();
  const username = (params.username as string || '').toLowerCase();
  const [user, setUser] = useState<StoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;

    // Look up user profile (client-side for now — calls session API)
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(sessionData => {
        if (sessionData.authenticated && sessionData.email) {
          // Use the logged-in user's data
          setUser({
            username: username,
            displayName: sessionData.email.split('@')[0],
            lkId: sessionData.lkId || '',
            role: 'user',
            referralCode: username,
            totalReferrals: 0,
          });
        } else {
          // Not logged in — show public store view
          setUser({
            username: username,
            displayName: username.charAt(0).toUpperCase() + username.slice(1),
            lkId: '',
            role: 'user',
            referralCode: username,
            totalReferrals: 0,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setNotFound(true);
      });
  }, [username]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--pf-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--pf-orange)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--pf-text-muted)]">Loading store...</p>
        </div>
      </main>
    );
  }

  if (notFound || !user) {
    return (
      <main className="min-h-screen bg-[var(--pf-bg)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
          <p className="text-[var(--pf-text-muted)] mb-6">
            We couldn't find a store for <strong>@{username}</strong>.
          </p>
          <Link href="/store" className="text-[var(--pf-orange)] hover:underline">
            ← Browse all products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--pf-bg)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--pf-orange)]/10 via-[var(--pf-bg)] to-purple-500/10 border-b border-[var(--pf-border)]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link href="/store" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Porterful Store
          </Link>

          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-3xl font-bold shrink-0">
              {user.displayName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black">@{user.username}</h1>
                {user.role === 'artist' && (
                  <span className="px-2 py-0.5 bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] text-xs font-bold rounded-full">
                    ARTIST
                  </span>
                )}
              </div>
              <p className="text-[var(--pf-text-muted)] mb-4">
                {user.bio || `${user.displayName}'s recommended products on Porterful`}
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium">{user.totalReferrals}</span>
                  <span className="text-[var(--pf-text-muted)]">referrals</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--pf-text-muted)]">
                  <TrendingUp className="w-4 h-4" />
                  3% earned per sale
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Products</h2>
          <span className="text-sm text-[var(--pf-text-muted)]">
            Earn commission on every sale
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STORE_PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} username={user.username} />
          ))}
        </div>

        {/* How it works */}
        <div className="mt-16 bg-gradient-to-r from-[var(--pf-orange)]/5 to-purple-500/5 rounded-2xl p-8 border border-[var(--pf-border)]">
          <h3 className="text-xl font-bold mb-4">How referral earnings work</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--pf-orange)]/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🔗</span>
              </div>
              <h4 className="font-bold mb-1">1. Copy your link</h4>
              <p className="text-sm text-[var(--pf-text-muted)]">Each product has your unique referral code built in</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--pf-orange)]/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📲</span>
              </div>
              <h4 className="font-bold mb-1">2. Share with anyone</h4>
              <p className="text-sm text-[var(--pf-text-muted)]">Send via text, social, email — however you want</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--pf-orange)]/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">💰</span>
              </div>
              <h4 className="font-bold mb-1">3. Earn 3% commission</h4>
              <p className="text-sm text-[var(--pf-text-muted)]">Get paid when someone purchases through your link</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
