'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, Mail } from 'lucide-react';

export default function OfferSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const offerId = params.offerId as string;
  const token = searchParams.get('token') as string;
  const [offer, setOffer] = useState<{
    product_name: string;
    username: string;
    price_cents: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!offerId) { setLoading(false); return; }
    const url = token ? `/api/offers/${offerId}?token=${encodeURIComponent(token)}` : null;
    if (!url) { setLoading(false); return; }
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setOffer(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [offerId, token]);

  const amount = offer?.price_cents ? `$${(offer.price_cents / 100).toFixed(2)}` : null;

  if (loading) return (
    <main className="min-h-screen bg-[#08080B] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--pf-orange)]" />
    </main>
  );

  return (
    <main className="min-h-screen bg-[#08080B] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-20 w-20 text-green-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Payment Confirmed</h1>
        <p className="text-gray-400 mb-6">
          {offer
            ? `Your access to ${offer.product_name} via @${offer.username} is confirmed.`
            : 'Your purchase is confirmed.'}
        </p>

        <div className="bg-[#111118] border border-[#1E1E26] rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-green-400 mb-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold">Payment successful</span>
          </div>

          {amount && (
            <div className="flex items-center justify-between py-2 border-b border-[#1E1E26]">
              <span className="text-gray-400 text-sm">Amount paid</span>
              <span className="text-white font-bold" style={{ color: '#f97316' }}>{amount}</span>
            </div>
          )}

          {offer?.username && (
            <div className="flex items-center justify-between py-2 border-b border-[#1E1E26]">
              <span className="text-gray-400 text-sm">Seller</span>
              <span className="text-white font-semibold">@{offer.username}</span>
            </div>
          )}

          {offer?.product_name && (
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400 text-sm">Product</span>
              <span className="text-white font-semibold">{offer.product_name}</span>
            </div>
          )}
        </div>

        <div className="bg-[#0f0f1a] border border-[#1E1E26] rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-center gap-2 text-[#f97316] mb-2">
            <Mail className="w-4 h-4" />
            <span className="font-bold text-sm uppercase tracking-wider">Check your email</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            A receipt and <strong className="text-gray-300">Claim Your Access</strong> link has been sent to your inbox. Click the link to activate your product access.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/store"
            className="w-full py-3 bg-[var(--pf-orange)] text-white font-bold rounded-xl hover:bg-[var(--pf-orange)]/90 transition"
          >
            Back to Store
          </Link>
          <Link
            href="/claim"
            className="w-full py-3 bg-[#111118] border border-[#1E1E26] text-gray-300 font-medium rounded-xl hover:border-[var(--pf-orange)]/40 transition"
          >
            Already have a claim link? Claim Access →
          </Link>
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          Powered by <span className="text-gray-500">Porterful</span> + Likeness™
        </p>
      </motion.div>
    </main>
  );
}