'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompetitionIcons } from './CompetitionIcons';

const SUPERFAN_LIMIT = 200;

export function SuperfanModal({ onClose }: { onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);

  useEffect(() => {
    const closed = localStorage.getItem('superfan_modal_closed');
    if (!closed) {
      // Show after 3 seconds (after competition modal)
      const timer = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setHasClosed(true);
    localStorage.setItem('superfan_modal_closed', 'true');
    onClose?.();
  };

  if (!isOpen || hasClosed) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-md bg-[var(--pf-bg)] rounded-2xl shadow-2xl border border-[var(--pf-border)] overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[var(--pf-surface)] hover:bg-[var(--pf-border)] transition-colors"
        >
          {CompetitionIcons.close(20)}
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full text-white text-sm font-medium mb-4">
            {CompetitionIcons.star(16)}
            <span>New Program</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Become a<br />Superfan
          </h2>
          <p className="text-white/80 text-sm">
            Earn rewards while supporting your favorite artists
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* How it works */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 font-bold text-xs">1</span>
              </div>
              <span>Get your unique Superfan link when you sign up</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 font-bold text-xs">2</span>
              </div>
              <span>Share it with friends and fans</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 font-bold text-xs">3</span>
              </div>
              <span>Earn 3% of every sale they make</span>
            </div>
          </div>

          {/* Earnings preview */}
          <div className="bg-[var(--pf-surface)] rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              {CompetitionIcons.dollar(16)}
              <span className="font-semibold text-sm">Example Earnings</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--pf-text-muted)]">Friend buys $50 merch</span>
                <span className="font-bold text-purple-400">$1.50 to you</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--pf-text-muted)]">10 friends buy/month</span>
                <span className="font-bold text-purple-400">$150/month passive</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <Link 
              href="/signup?role=superfan" 
              onClick={handleClose}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-center hover:opacity-90 transition-opacity"
            >
              Sign Up as Superfan
            </Link>
            <button 
              onClick={handleClose}
              className="w-full py-2 text-[var(--pf-text-muted)] text-sm hover:text-[var(--pf-text)] transition-colors"
            >
              Maybe Later
            </button>
          </div>

          <p className="text-xs text-center text-[var(--pf-text-muted)] mt-4">
            <Link href="/superfan" onClick={handleClose} className="hover:text-purple-400">
              Learn more about Superfans →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
