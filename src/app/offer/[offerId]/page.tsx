'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

interface OfferData {
  offer_id: string;
  product_id: string;
  product_name: string;
  price_cents: number;
  username: string;
  lk_id: string;
  status: string;
}

// Buyer landing page — self-contained token, no DB required
export default function OfferPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const offerId = params.offerId as string;
  const token = searchParams.get('token') as string;
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!offerId) return;
    const url = token ? `/api/offers/${offerId}?token=${encodeURIComponent(token)}` : `/api/offers/${offerId}`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setNotFound(true); }
        else { setOffer(data); }
        setLoading(false);
      })
      .catch(() => { setLoading(false); setNotFound(true); });
  }, [offerId, token]);

  const handleBuy = async () => {
    if (!offer) return;
    setBuying(true);
    setError('');
    try {
      const res = await fetch('/api/offers/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId: offer.offer_id, token }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setError(data.error || 'Checkout failed'); setBuying(false); }
    } catch { setBuying(false); setError('Network error'); }
  };

  if (loading) return (
    <main className="min-h-screen bg-[#08080B] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--pf-orange)]" />
    </main>
  );

  if (notFound || !offer) return (
    <main className="min-h-screen bg-[#08080B] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-2">Offer Not Found</h1>
        <p className="text-gray-400 mb-6">This link may have expired or been shared incorrectly.</p>
        <Link href="/" className="text-[var(--pf-orange)] hover:underline">← Go to Porterful</Link>
      </div>
    </main>
  );

  const price = (offer.price_cents / 100).toFixed(0);
  const product = offer.product_id;

  return (
    <main className="min-h-screen bg-[#08080B] flex flex-col items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Porterful
          </Link>
        </div>

        <div className="bg-[#111118] border border-[#1E1E26] rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 p-6 text-center border-b border-[#1E1E26]">
            <div className="text-5xl mb-3">{
              product === 'credit-klimb' ? '🏦' :
              product === 'nlds-membership' ? '🗺️' :
              product === 'teachyoung' ? '📚' :
              product === 'family-os' ? '🌳' : '📦'
            }</div>
            <h1 className="text-2xl font-black text-white mb-1">{offer.product_name}</h1>
            <p className="text-sm text-gray-400">Shared by <span className="text-[var(--pf-orange)] font-medium">@{offer.username}</span></p>
          </div>

          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-5xl font-black text-white mb-1">${price}</div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-3 h-3" />
                <span>Price set by @{offer.username}</span>
              </div>
            </div>

            <div className="bg-[#0D0D14] rounded-xl p-4 mb-6 text-sm text-gray-300 leading-relaxed">
              {product === 'credit-klimb' && <p>Professional credit repair guidance. Assessment, dispute templates, and monthly coaching.</p>}
              {product === 'nlds-membership' && <p>Weekly land deal drops. Tax deeds, land bank properties, and government opportunities.</p>}
              {product === 'teachyoung' && <p>AI-powered learning for kids (ages 5-14). Snap a photo of anything — get a full lesson, quiz, and activities.</p>}
              {product === 'family-os' && <p>Preserve your family history and build a lasting legacy. Family tree builder, story capture, and digital memorial.</p>}
            </div>

            <div className="flex flex-col gap-2 mb-6">
              {['Secure payment via Stripe', 'Instant access after purchase', '30-day satisfaction guarantee'].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />{item}
                </div>
              ))}
            </div>

            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

            <button
              onClick={handleBuy}
              disabled={buying}
              className="w-full py-4 bg-[var(--pf-orange)] hover:bg-[var(--pf-orange)]/90 disabled:opacity-50 text-white font-black rounded-xl transition flex items-center justify-center gap-2 text-lg"
            >
              {buying ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <>Buy Now — ${price} <ArrowLeft className="w-5 h-5 rotate-180" /></>}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">Powered by <span className="text-gray-500">Porterful</span> — The Likeness™ Economy</p>
      </motion.div>
    </main>
  );
}
