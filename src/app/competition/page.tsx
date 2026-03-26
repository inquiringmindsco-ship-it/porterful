'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Trophy, DollarSign, Users, TrendingUp, Gift, Star, Zap, Crown, Target, Award, Clock, Lock, Check, Flame, Rocket, RefreshCw } from 'lucide-react';

// Configuration
const FOUNDING_ARTIST_LIMIT = 50;
const DAYS_TO_LAUNCH = 30;
const FOUNDER_DOUBLE_PRIZES_DAYS = 30;

const TIERS = [
  {
    name: 'Bronze',
    range: '$0 - $500 earned',
    color: 'from-amber-600 to-orange-700',
    borderColor: 'border-amber-600/30',
    milestones: [
      { threshold: 100, bonus: 150, label: 'First to $100' },
      { threshold: 500, bonus: 250, label: 'First to $500' },
    ],
  },
  {
    name: 'Silver',
    range: '$500 - $5,000 earned',
    color: 'from-gray-300 to-gray-500',
    borderColor: 'border-gray-400/30',
    milestones: [
      { threshold: 2500, bonus: 500, label: 'First to $2,500' },
      { threshold: 5000, bonus: 1000, label: 'First to $5,000' },
    ],
  },
  {
    name: 'Gold',
    range: '$5,000 - $25,000 earned',
    color: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-500/30',
    milestones: [
      { threshold: 10000, bonus: 2500, label: 'First to $10,000' },
      { threshold: 25000, bonus: 5000, label: 'First to $25,000' },
    ],
  },
  {
    name: 'Platinum',
    range: '$25,000+ earned',
    color: 'from-purple-400 to-purple-700',
    borderColor: 'border-purple-500/30',
    milestones: [
      { threshold: 50000, bonus: 10000, label: 'First to $50,000' },
      { threshold: 100000, bonus: 25000, label: 'First to $100,000' },
    ],
  },
];

// Mock data fallback
const MOCK_LEADERS = [
  { rank: 1, name: 'O D Porter', earnings: 1847, tier: 'Gold', isFounder: true },
  { rank: 2, name: 'Rob Soul', earnings: 892, tier: 'Silver', isFounder: true },
  { rank: 3, name: 'Gune', earnings: 654, tier: 'Silver', isFounder: true },
  { rank: 4, name: 'ATM Trap', earnings: 423, tier: 'Bronze', isFounder: false },
  { rank: 5, name: 'TTD Dex', earnings: 298, tier: 'Bronze', isFounder: false },
];

const FAQS = [
  {
    q: 'How do I become a Founding Artist?',
    a: 'Sign up and join within the Founding Artist Window. The first 50 artists to create an account and list a product become Founding Artists.',
  },
  {
    q: 'What happens when I hit a milestone?',
    a: 'Your bonus is automatically calculated based on your tier. First artist to hit each milestone wins. Once claimed, that milestone closes for everyone else.',
  },
  {
    q: 'When do I move to the next tier?',
    a: 'Once your total earnings hit the top of your current tier range, you reset and move up. Your milestones start fresh at the new tier.',
  },
  {
    q: 'How is the prize pool funded?',
    a: 'A portion of every sale on Porterful goes into the Artist Prize Pool. We add to it; artists earn from it. No extra cost to anyone.',
  },
  {
    q: 'Can I win multiple prizes?',
    a: 'Yes! Hit Bronze milestones, move to Silver, hit those too, keep going. There\'s no cap on how much you can earn.',
  },
];

interface CompetitionData {
  competitionLive: boolean;
  foundingWindow: {
    artistsJoined: number;
    artistLimit: number;
    spotsLeft: number;
    closesAt: string | null;
  };
  prizePool: {
    balance: number;
    totalEarned: number;
    totalPaidOut: number;
  };
  leaders: Array<{
    rank: number;
    artistId: string;
    name: string;
    earnings: number;
    tier: string;
    isFounder: boolean;
  }>;
  recentWins: Array<{
    artistName: string;
    milestone: number;
    bonus: number;
    tier: string;
    claimedAt: string;
  }>;
}

export default function CompetitionPage() {
  const [data, setData] = useState<CompetitionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faqs] = useState(FAQS);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 0, mins: 0 });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/competition');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch competition data:', err);
      // Use defaults on error - this allows page to still show
      if (!data) {
        setError('Using preview data');
        setData({
          competitionLive: false,
          foundingWindow: { artistsJoined: 12, artistLimit: 50, spotsLeft: 38, closesAt: null },
          prizePool: { balance: 0, totalEarned: 0, totalPaidOut: 0 },
          leaders: MOCK_LEADERS,
          recentWins: [],
        });
      }
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Countdown timer
  useEffect(() => {
    const closeDate = new Date();
    closeDate.setDate(closeDate.getDate() + DAYS_TO_LAUNCH);
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = closeDate.getTime() - now.getTime();
      
      if (diff <= 0 || (data?.foundingWindow?.spotsLeft || 50) <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.foundingWindow?.spotsLeft]);

  const isLive = data?.competitionLive || false;
  const foundersCount = data?.foundingWindow?.artistsJoined || 0;
  const spotsLeft = data?.foundingWindow?.spotsLeft || 50;
  const percentFilled = (foundersCount / FOUNDING_ARTIST_LIMIT) * 100;
  const poolBalance = data?.prizePool?.balance || 0;
  const leaders = data?.leaders?.length ? data.leaders : MOCK_LEADERS;

  return (
    <div className="min-h-screen bg-[var(--pf-bg)]">
      {/* Pre-Launch Banner */}
      {!isLive && (
        <section className="bg-gradient-to-r from-[var(--pf-orange)] to-purple-600 py-4">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-white text-center">
              <div className="flex items-center gap-2">
                <Rocket size={20} />
                <span className="font-bold">Founding Artist Window</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {spotsLeft} spots left
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {timeLeft.days}d {timeLeft.hours}h until launch
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-br from-[var(--pf-bg)] via-[var(--pf-bg-secondary)] to-[var(--pf-bg)]">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--pf-orange)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {!isLive ? (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)]/20 border border-[var(--pf-orange)]/30 rounded-full text-[var(--pf-orange)] text-sm font-medium mb-8">
                <Flame size={16} />
                <span>Coming Soon — {spotsLeft} Founding Spots Left</span>
              </div>
              
              <h1 className="text-4xl md:text-7xl font-bold mb-6">
                $10,000 Launch<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pf-orange)] to-purple-500">
                  Competition
                </span>
              </h1>
              
              <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto mb-8">
                First {FOUNDING_ARTIST_LIMIT} artists lock in double prizes for 30 days.
                <br />Then the real race begins.
              </p>

              {/* Founding Artist Progress */}
              <div className="max-w-md mx-auto mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[var(--pf-text-muted)]">Founding Artists</span>
                  <span className="font-bold text-[var(--pf-orange)]">{foundersCount}/{FOUNDING_ARTIST_LIMIT}</span>
                </div>
                <div className="h-4 bg-[var(--pf-surface)] rounded-full overflow-hidden border border-[var(--pf-border)]">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--pf-orange)] to-purple-500 transition-all duration-500"
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--pf-text-muted)] mt-2">
                  Competition launches when we hit {FOUNDING_ARTIST_LIMIT} artists or in {timeLeft.days} days
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/signup?role=artist" className="px-8 py-4 bg-[var(--pf-orange)] text-white rounded-xl font-bold text-lg hover:bg-[var(--pf-orange)]/90 transition-colors inline-flex items-center justify-center gap-2">
                  <Star size={20} />
                  Claim Founding Artist Status
                </Link>
                <Link href="/superfan" className="px-8 py-4 bg-[var(--pf-surface)] border border-[var(--pf-border)] text-white rounded-xl font-bold text-lg hover:bg-[var(--pf-surface-hover)] transition-colors inline-flex items-center justify-center gap-2">
                  <Users size={20} />
                  Become a Superfan
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-medium mb-8 animate-pulse">
                <Trophy size={16} />
                <span>🔥 COMPETITION IS LIVE — $10,000 PRIZE POOL UNLOCKED</span>
              </div>
              
              <h1 className="text-4xl md:text-7xl font-bold mb-6">
                The Race Is On.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pf-orange)] to-purple-500">
                  Win Big.
                </span>
              </h1>
              
              <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto mb-8">
                First artists to hit milestone sales earn bonus cash from the prize pool.
                <br />Keep moving up tiers. Stack your wins.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup?role=artist" className="px-8 py-4 bg-[var(--pf-orange)] text-white rounded-xl font-bold text-lg hover:bg-[var(--pf-orange)]/90 transition-colors inline-flex items-center justify-center gap-2">
                  <Trophy size={20} />
                  Join the Competition
                </Link>
                <Link href="#leaderboard" className="px-8 py-4 bg-[var(--pf-surface)] border border-[var(--pf-border)] text-white rounded-xl font-bold text-lg hover:bg-[var(--pf-surface-hover)] transition-colors inline-flex items-center justify-center gap-2">
                  <Target size={20} />
                  View Leaderboard
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Founding Artist Benefits */}
      {!isLive && (
        <section className="py-16 bg-[var(--pf-bg-secondary)]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Become a <span className="text-[var(--pf-orange)]">Founding Artist</span>?
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-[var(--pf-bg)] rounded-2xl p-6 border border-[var(--pf-orange)]/30">
                <div className="text-3xl mb-4">💰</div>
                <h3 className="font-bold mb-2">2X Prizes</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Double prizes for your first 30 days in the competition
                </p>
              </div>
              <div className="bg-[var(--pf-bg)] rounded-2xl p-6 border border-[var(--pf-border)]">
                <div className="text-3xl mb-4">🏆</div>
                <h3 className="font-bold mb-2">Permanent Badge</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  "Founding Artist" badge on your profile forever
                </p>
              </div>
              <div className="bg-[var(--pf-bg)] rounded-2xl p-6 border border-[var(--pf-border)]">
                <div className="text-3xl mb-4">💬</div>
                <h3 className="font-bold mb-2">Exclusive Discord</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Private channel with other founding artists
                </p>
              </div>
              <div className="bg-[var(--pf-bg)] rounded-2xl p-6 border border-[var(--pf-border)]">
                <div className="text-3xl mb-4">📢</div>
                <h3 className="font-bold mb-2">Launch Feature</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  Listed on competition page as founding member
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Prize Tiers */}
      <section className="py-16 md:py-24 bg-[var(--pf-bg)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Milestone <span className="text-[var(--pf-orange)]">Prizes</span>
            </h2>
            <p className="text-[var(--pf-text-secondary)] max-w-xl mx-auto">
              {!isLive 
                ? 'Once live, first artists to hit these milestones win bonus cash.' 
                : 'First to hit each milestone wins. Move up tiers to unlock bigger prizes.'}
            </p>
          </div>

          <div className="space-y-8">
            {TIERS.map((tier) => (
              <div key={tier.name} className={`bg-[var(--pf-surface)] rounded-3xl p-6 md:p-8 border ${tier.borderColor}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                    {tier.name === 'Bronze' && <Award size={28} />}
                    {tier.name === 'Silver' && <Star size={28} />}
                    {tier.name === 'Gold' && <Crown size={28} />}
                    {tier.name === 'Platinum' && <Trophy size={28} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{tier.name} Tier</h3>
                    <p className="text-[var(--pf-text-muted)]">{tier.range}</p>
                  </div>
                  {!isLive && (
                    <div className="ml-auto">
                      <Lock size={24} className="text-[var(--pf-text-muted)]" />
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {tier.milestones.map((milestone, i) => {
                    const isUnlocked = isLive;
                    return (
                      <div 
                        key={i}
                        className={`bg-[var(--pf-bg)] rounded-xl p-4 border border-[var(--pf-border)] ${
                          !isUnlocked ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold">{milestone.label}</div>
                            <div className="text-sm text-[var(--pf-text-muted)]">
                              {isUnlocked ? (
                                <span className="text-green-400">● Live</span>
                              ) : (
                                <span>🔒 Locked</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${isUnlocked ? 'text-[var(--pf-orange)]' : 'text-[var(--pf-text-muted)]'}`}>
                              ${milestone.bonus.toLocaleString()}
                            </div>
                            <div className="text-xs text-[var(--pf-text-muted)]">
                              bonus cash
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-[var(--pf-text-secondary)] text-sm">
            <p>* Founding Artists earn 2X bonus value for first 30 days after competition launch</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-[var(--pf-bg-secondary)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How the <span className="text-[var(--pf-orange)]">Competition</span> Works
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, icon: Star, title: 'Join as Founding Artist', desc: 'Lock in double prizes for 30 days', color: 'from-[var(--pf-orange)] to-orange-600' },
              { step: 2, icon: Trophy, title: 'List Your Products', desc: 'Upload music, merch, or both', color: 'from-purple-500 to-purple-700' },
              { step: 3, icon: TrendingUp, title: 'Climb the Tiers', desc: 'Move up Bronze → Silver → Gold → Platinum', color: 'from-blue-500 to-blue-700' },
              { step: 4, icon: DollarSign, title: 'Win Bonuses', desc: 'First to hit milestones earn cash', color: 'from-green-500 to-green-700' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 relative`}>
                  <item.icon className="text-white" size={28} />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[var(--pf-bg)] border-2 border-[var(--pf-border)] text-white font-bold text-sm flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Pool */}
      <section className="py-16 bg-[var(--pf-bg-secondary)]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[var(--pf-orange)]/20 via-purple-500/10 to-[var(--pf-bg)] rounded-3xl p-8 md:p-12 border border-[var(--pf-border)]">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How the <span className="text-[var(--pf-orange)]">Prize Pool</span> Works
              </h2>
              <p className="text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
                The prize pool grows from a small % of every sale on Porterful. 
                The more artists sell, the bigger the rewards.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[var(--pf-bg)]/50 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">💵</div>
                <h3 className="font-bold mb-2">Every Sale Adds</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  10% of each sale goes into the artist prize pool
                </p>
              </div>
              <div className="bg-[var(--pf-bg)]/50 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-bold mb-2">Milestones Pay Out</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  First to hit milestones withdraw from the pool
                </p>
              </div>
              <div className="bg-[var(--pf-bg)]/50 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">📈</div>
                <h3 className="font-bold mb-2">Pool Keeps Growing</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">
                  More sales = bigger future prizes for everyone
                </p>
              </div>
            </div>

            <div className="bg-[var(--pf-bg)]/50 rounded-xl p-6 text-center">
              <div className="text-sm text-[var(--pf-text-muted)] mb-2">Current Prize Pool Balance</div>
              <div className="text-5xl font-bold text-[var(--pf-orange)]">
                ${poolBalance.toLocaleString()}
              </div>
              <div className="text-sm text-[var(--pf-text-muted)] mt-2">
                {loading ? 'Loading...' : error ? 'Preview mode' : 'Live balance'}
                <button onClick={fetchData} className="ml-2 text-[var(--pf-orange)] hover:underline inline-flex items-center gap-1">
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section id="leaderboard" className="py-16 md:py-24 bg-[var(--pf-bg)]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Artist <span className="text-[var(--pf-orange)]">Leaderboard</span>
              </h2>
              <p className="text-[var(--pf-text-secondary)]">
                {isLive ? 'Live rankings by total earnings' : 'Preview — updates when competition goes live'}
              </p>
            </div>
            {!isLive && (
              <Link href="/signup?role=artist" className="px-4 py-2 bg-[var(--pf-orange)] text-white rounded-lg font-medium text-sm hover:bg-[var(--pf-orange)]/90 transition-colors">
                Join the Race
              </Link>
            )}
          </div>

          <div className="bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-border)] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[var(--pf-bg)] border-b border-[var(--pf-border)] text-sm font-medium text-[var(--pf-text-muted)]">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Artist</div>
              <div className="col-span-3 text-right">Earnings</div>
              <div className="col-span-3 text-right">Tier</div>
            </div>
            
            {/* Rows */}
            {leaders.map((leader, i) => (
              <div 
                key={leader.artistId || i}
                className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--pf-border)] last:border-0 hover:bg-[var(--pf-bg)] transition-colors ${
                  i === 0 ? 'bg-[var(--pf-orange)]/5' : ''
                }`}
              >
                <div className="col-span-1 flex items-center">
                  {i === 0 && <Trophy className="text-yellow-500 mr-2" size={18} />}
                  <span className={`font-bold ${i === 0 ? 'text-yellow-500' : ''}`}>#{leader.rank || i + 1}</span>
                </div>
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-500 flex items-center justify-center text-white font-bold">
                    {leader.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {leader.name || 'Unknown'}
                      {leader.isFounder && (
                        <span className="text-xs bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] px-2 py-0.5 rounded-full">
                          Founder
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-span-3 text-right font-bold text-[var(--pf-orange)]">
                  ${(leader.earnings || 0).toLocaleString()}
                </div>
                <div className="col-span-3 text-right">
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    leader.tier === 'Platinum' ? 'bg-purple-500/20 text-purple-400' :
                    leader.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                    leader.tier === 'Silver' ? 'bg-gray-400/20 text-gray-300' :
                    'bg-amber-600/20 text-amber-500'
                  }`}>
                    {leader.tier || 'Bronze'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 text-[var(--pf-text-muted)] text-sm">
            <p>{isLive ? 'Rankings update in real-time' : 'Full leaderboard unlocks when competition goes live'}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-[var(--pf-bg-secondary)]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked <span className="text-[var(--pf-orange)]">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-medium"
                >
                  {faq.q}
                  <span className={`transform transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-[var(--pf-text-secondary)]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[var(--pf-orange)] to-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {isLive ? 'Join the Competition Now' : 'Lock In Founding Artist Status'}
          </h2>
          <p className="text-white/80 text-xl mb-8 max-w-2xl mx-auto">
            {isLive 
              ? 'First to market advantage is gone — but milestones reset every tier. Start now.'
              : `${spotsLeft} founding spots remaining. Double prizes for your first 30 days.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=artist" className="px-8 py-4 bg-white text-[var(--pf-orange)] rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2">
              <Zap size={20} />
              {isLive ? 'Start Selling' : 'Claim Founding Status'}
            </Link>
            <Link href="/superfan" className="px-8 py-4 bg-white/10 text-white border border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2">
              <Users size={20} />
              Become a Superfan
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[var(--pf-bg)] border-t border-[var(--pf-border)]">
        <div className="max-w-6xl mx-auto px-6 text-center text-[var(--pf-text-muted)] text-sm">
          <p>© {new Date().getFullYear()} Porterful. The Artist Economy.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/terms" className="hover:text-[var(--pf-orange)]">Terms</Link>
            <Link href="/privacy" className="hover:text-[var(--pf-orange)]">Privacy</Link>
            <Link href="/faq" className="hover:text-[var(--pf-orange)]">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
