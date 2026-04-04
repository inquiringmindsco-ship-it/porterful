'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Trophy, Star, Users, Check, Rocket, Crown } from 'lucide-react';

const FOUNDING_LIMIT = 50;

interface CompetitionData {
  artistsJoined: number;
  competitionLive: boolean;
  prizePool?: number;
}

export function ArtistModal({ onClose }: { onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);
  const [data, setData] = useState<CompetitionData>({ artistsJoined: 0, competitionLive: false });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/competition');
      if (res.ok) {
        const json = await res.json();
        setData({
          artistsJoined: json.foundingWindow?.artistsJoined || 0,
          competitionLive: json.competitionLive || false,
          prizePool: json.prizePool?.balance || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch competition data:', err);
    }
  }, []);

  useEffect(() => {
    // Check if user already closed
    const closed = localStorage.getItem('artist_modal_closed');
    if (closed) {
      return;
    }
    
    fetchData();
    
    // Show after 2 seconds
    const timer = setTimeout(() => setIsOpen(true), 2000);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleClose = () => {
    setIsOpen(false);
    setHasClosed(true);
    localStorage.setItem('artist_modal_closed', 'true');
    onClose?.();
  };

  const spotsLeft = FOUNDING_LIMIT - data.artistsJoined;
  const percentFilled = Math.min((data.artistsJoined / FOUNDING_LIMIT) * 100, 100);

  if (!isOpen || hasClosed) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[var(--pf-bg)] rounded-2xl shadow-2xl border border-[var(--pf-border)] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[var(--pf-surface)] hover:bg-[var(--pf-border)] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[var(--pf-orange)] to-purple-600 px-6 py-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full text-white text-sm font-medium mb-4">
            <Crown size={14} />
            <span>Founding Artist Window</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Join the<br />Artist Competition
          </h2>
          <p className="text-white/80 text-sm">
            First {FOUNDING_LIMIT} artists lock in 2X prizes for 30 days
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--pf-text-muted)]">Founding Artists</span>
              <span className="font-bold text-[var(--pf-orange)]">
                {data.artistsJoined}/{FOUNDING_LIMIT}
              </span>
            </div>
            <div className="h-3 bg-[var(--pf-surface)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--pf-orange)] to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${percentFilled}%` }}
              />
            </div>
            <p className="text-xs text-[var(--pf-text-muted)] mt-2 text-center">
              {spotsLeft > 0 ? `${spotsLeft} spots remaining` : 'Window closed'}
            </p>
          </div>

          {/* Tiers */}
          <div className="bg-[var(--pf-surface)] rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} className="text-[var(--pf-orange)]" />
              <span className="font-semibold text-sm">4 Tiers - Win Bonus Cash</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--pf-text-muted)]">Bronze (0-$500)</span>
                <span className="font-bold text-amber-500">Up to $250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--pf-text-muted)]">Silver ($500-$5K)</span>
                <span className="font-bold text-[var(--pf-text-muted)]">Up to $1,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--pf-text-muted)]">Gold ($5K-$25K</span>
                <span className="font-bold text-yellow-500">Up to $5,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--pf-text-muted)]">Platinum ($25K+)</span>
                <span className="font-bold text-purple-500">Up to $25,000</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center text-[var(--pf-orange)]">
                <Check size={14} />
              </div>
              <span><strong>2X bonus prizes</strong> for your first 30 days</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center text-[var(--pf-orange)]">
                <Check size={14} />
              </div>
              <span><strong>"Founding Artist" badge</strong> forever</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center text-[var(--pf-orange)]">
                <Check size={14} />
              </div>
              <span><strong>80% of every sale</strong> - keep more money</span>
            </div>
          </div>

          {/* Rules disclaimer */}
          <p className="text-xs text-[var(--pf-text-muted)] mb-4">
            <Link href="/competition" onClick={handleClose} className="hover:text-[var(--pf-orange)] underline">
              Competition rules
            </Link>{' '}
            apply. Payouts may be made over time. We reserve the right to modify or cancel the competition.
          </p>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <Link 
              href="/signup?role=artist" 
              onClick={handleClose}
              className="w-full py-3 px-4 bg-[var(--pf-orange)] text-white rounded-xl font-bold text-center hover:bg-[var(--pf-orange)]/90 transition-colors"
            >
              Start Selling as an Artist
            </Link>
            <button 
              onClick={handleClose}
              className="w-full py-2 text-[var(--pf-text-muted)] text-sm hover:text-[var(--pf-text)] transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Link to full competition */}
          <p className="text-xs text-center text-[var(--pf-text-muted)] mt-4">
            <Link href="/competition" onClick={handleClose} className="hover:text-[var(--pf-orange)]">
              View full competition details →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}