'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';

export default function ClaimPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [product, setProduct] = useState(searchParams.get('product') || '');
  const [offer, setOffer] = useState(searchParams.get('offer') || '');
  const [sessionId, setSessionId] = useState(searchParams.get('session') || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, product, offer, session_id: sessionId }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Access granted. Redirecting...');
        if (data.redirect_url) {
          setTimeout(() => router.push(data.redirect_url), 1500);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Access claim failed. Please try again or contact support.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <main className="min-h-screen bg-[#08080B] flex flex-col items-center justify-center px-4 pt-16 md:pt-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#f97316]/10 border border-[#f97316]/20 mb-4">
            <Mail className="w-8 h-8 text-[#f97316]" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Claim Your Access</h1>
          <p className="text-gray-400 text-sm">
            Enter the email you used at checkout to claim access to your purchase.
          </p>
        </div>

        <form onSubmit={handleClaim} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 bg-[#111118] border border-[#1E1E26] rounded-xl text-white placeholder:text-gray-600 focus:border-[#f97316] focus:outline-none transition"
            />
          </div>

          {product && (
            <div className="bg-[#111118] border border-[#1E1E26] rounded-xl p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Claiming access to</div>
              <div className="text-white font-semibold capitalize">{product.replace(/-/g, ' ')}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || !email}
            className="w-full py-3 bg-[#f97316] text-black font-bold rounded-xl hover:bg-[#f97316]/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Verifying...</>
            ) : (
              'Claim Access →'
            )}
          </button>
        </form>

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-green-400 font-semibold text-sm">Access granted</p>
              <p className="text-gray-400 text-sm mt-1">{message}</p>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3"
          >
            <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-red-400 font-semibold text-sm">Claim failed</p>
              <p className="text-gray-400 text-sm mt-1">{message}</p>
            </div>
          </motion.div>
        )}

        <p className="text-center text-xs text-gray-600 mt-8">
          Need help? Contact <a href="mailto:support@porterful.com" className="text-gray-500 hover:text-gray-400">support@porterful.com</a>
        </p>
      </motion.div>
    </main>
  );
}
