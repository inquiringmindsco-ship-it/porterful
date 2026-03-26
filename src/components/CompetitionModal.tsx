'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CompetitionIcons } from './CompetitionIcons';

const FOUNDING_LIMIT = 100;

interface CompetitionData {
  artistsJoined: number;
  competitionLive: boolean;
}

export function CompetitionModal({ onClose }: { onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);
  const [data, setData] = useState<CompetitionData>({ artistsJoined: 0, competitionLive: false });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/competition');
      if (res.ok) {
        const json = await res.json();
        setData({
          artistsJoined: json.foundingWindow?.artistsJoined || 0,
          competitionLive: json.competitionLive || false,
        });
      }
    } catch (err) {
      console.error('Failed to fetch competition data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const closed = localStorage.getItem('competition_modal_closed');
    if (!closed && !hasClosed) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasClosed]);

  const handleClose = () => {
    setIsOpen(false);
    setHasClosed(true);
    localStorage.setItem('competition_modal_closed', 'true');
    onClose?.();
  };

  const spotsLeft = FOUNDING_LIMIT - data.artistsJoined;
  const percentFilled = (data.artistsJoined / FOUNDING_LIMIT) * 100;

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
          {CompetitionIcons.close(20)}
        </button>

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[var(--pf-orange)] to-purple-600 px-6 py-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full text-white text-sm font-medium mb-4">
            {CompetitionIcons.rocket(16)}
            <span>{data.competitionLive ? 'Live Now' : 'Coming Soon'}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            $10K Sign<br />Yourself Challenge
          </h2>
          <p className="text-white/80 text-sm">
            First {FOUNDING_LIMIT} artists to join lock in 2X prizes
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--pf-text-muted)]">Founding Artists</span>
              <span className="font-bold text-[var(--pf-orange)]">
                {loading ? '...' : `${data.artistsJoined}/${FOUNDING_LIMIT}`}
              </span>
            </div>
            <div className="h-3 bg-[var(--pf-surface)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--pf-orange)] to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(percentFilled, 100)}%` }}
              />
            </div>
            <p className="text-xs text-[var(--pf-text-muted)] mt-2 text-center">
              {loading ? 'Loading...' : `${spotsLeft > 0 ? spotsLeft : 0} spots remaining`}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center text-[var(--pf-orange)]">
                {CompetitionIcons.check(14)}
              </div>
              <span>2X bonus prizes for your first 30 days</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center text-[var(--pf-orange)]">
                {CompetitionIcons.check(14)}
              </div>
              <span>Permanent "Founding Artist" badge</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center text-[var(--pf-orange)]">
                {CompetitionIcons.check(14)}
              </div>
              <span>Exclusive Discord channel access</span>
            </div>
          </div>

          {/* Tiers Preview */}
          <div className="bg-[var(--pf-surface)] rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              {CompetitionIcons.trophy(16)}
              <span className="font-semibold text-sm">Milestone Prizes</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--pf-text-muted)]">First to $100</span>
                <span className="font-bold text-[var(--pf-orange)]">$150</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--pf-text-muted)]">First to $500</span>
                <span className="font-bold text-[var(--pf-orange)]">$250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--pf-text-muted)]">First to $1K</span>
                <span className="font-bold text-[var(--pf-orange)]">$500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--pf-text-muted)]">First to $10K</span>
                <span className="font-bold text-[var(--pf-orange)]">$2,500</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <Link 
              href="/signup?role=artist" 
              onClick={handleClose}
              className="w-full py-3 px-4 bg-[var(--pf-orange)] text-white rounded-xl font-bold text-center hover:bg-[var(--pf-orange)]/90 transition-colors"
            >
              Claim Founding Artist Status
            </Link>
            <button 
              onClick={handleClose}
              className="w-full py-2 text-[var(--pf-text-muted)] text-sm hover:text-[var(--pf-text)] transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Small link */}
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
