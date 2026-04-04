'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Loader2, Package } from 'lucide-react';

export default function OrderSuccessPage() {
  const [status, setStatus] = useState<'verifying' | 'confirmed' | 'error'>('verifying');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('order_id');
    setOrderId(id || 'UNKNOWN');

    if (!id) {
      setStatus('error');
      return;
    }

    // Give Stripe a moment to process
    const timer = setTimeout(() => {
      setStatus('confirmed');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-6" />
            <h1 className="text-3xl font-black text-white mb-3">Processing your order...</h1>
            <p className="text-[var(--pf-text-muted)]">Confirming payment with Stripe. One moment.</p>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <div className="w-20 h-20 bg-emerald-900/50 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-4xl font-black text-white mb-3">Order Confirmed! 🎉</h1>
            <p className="text-[var(--pf-text-muted)] mb-2">
              Your custom name chain is being queued for production.
            </p>
            <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl px-4 py-3 mb-6 text-left">
              <div className="text-[var(--pf-text-muted)] text-xs mb-1">Order ID</div>
              <div className="text-amber-400 font-mono font-bold text-lg">{orderId}</div>
            </div>
            <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-4 mb-8 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span className="text-white font-semibold text-sm">What happens next</span>
              </div>
              <ol className="space-y-2 text-[var(--pf-text-muted)] text-xs">
                <li>1. Our team receives your order</li>
                <li>2. Your name is 3D printed with precision settings</li>
                <li>3. Hand-finished with gold spray paint</li>
                <li>4. Packaged and shipped to your door</li>
                <li>5. Delivered in 3–5 business days</li>
              </ol>
            </div>
            <Link
              href="/kids-chains"
              className="inline-block bg-amber-600 hover:bg-amber-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Order Another →
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-3xl font-black text-white mb-3">Something went wrong</h1>
            <p className="text-[var(--pf-text-muted)] mb-6">We couldn&apos;t confirm your order. Please contact support.</p>
            <Link href="/kids-chains" className="text-amber-400 hover:text-amber-300 underline">
              Return to order page
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
