'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompetitionIcons } from './CompetitionIcons';

export function BusinessModal({ onClose }: { onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);

  useEffect(() => {
    const closed = localStorage.getItem('business_modal_closed');
    if (!closed) {
      // Show after 4 seconds (after superfan modal)
      const timer = setTimeout(() => setIsOpen(true), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setHasClosed(true);
    localStorage.setItem('business_modal_closed', 'true');
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
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full text-white text-sm font-medium mb-4">
            {CompetitionIcons.trending(16)}
            <span>For Businesses</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Partner with<br />Porterful
          </h2>
          <p className="text-white/80 text-sm">
            Reach thousands of music fans through our artists
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                {CompetitionIcons.check(14)}
              </div>
              <span>Sponsor artists and get featured</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                {CompetitionIcons.check(14)}
              </div>
              <span>Run campaigns in our marketplace</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                {CompetitionIcons.check(14)}
              </div>
              <span>Access artist fanbase data</span>
            </div>
          </div>

          {/* Pricing preview */}
          <div className="bg-[var(--pf-surface)] rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              {CompetitionIcons.gift(16)}
              <span className="font-semibold text-sm">Campaign Options</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--pf-text-muted)]">Artist Sponsorship</span>
                <span className="font-bold text-blue-400">From $500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--pf-text-muted)]">Marketplace Feature</span>
                <span className="font-bold text-blue-400">From $200</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <Link 
              href="/signup?role=business" 
              onClick={handleClose}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold text-center hover:opacity-90 transition-opacity"
            >
              Apply as Business Partner
            </Link>
            <button 
              onClick={handleClose}
              className="w-full py-2 text-[var(--pf-text-muted)] text-sm hover:text-[var(--pf-text)] transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
