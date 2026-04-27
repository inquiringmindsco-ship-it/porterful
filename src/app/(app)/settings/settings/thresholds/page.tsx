'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, DollarSign, TrendingUp, AlertCircle, Check, Info } from 'lucide-react';

export default function ThresholdsPage() {
  const [thresholds, setThresholds] = useState({
    merch: 25,
    music: 10,
    marketplace: 50,
    superfans: 5,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const estimatedPayouts = {
    merch: 892.50,
    music: 234.00,
    marketplace: 156.75,
    superfans: 42.50,
  };

  const pendingTotal = Object.values(estimatedPayouts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] text-white py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/settings/settings" className="p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Payout Thresholds</h1>
            <p className="text-[var(--pf-text-secondary)]">Set minimum amounts before payouts are processed</p>
          </div>
        </div>

        {/* Pending Balance Card */}
        <div className="pf-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Pending Payouts</h2>
            <div className="text-3xl font-bold text-[var(--pf-orange)]">${pendingTotal.toFixed(2)}</div>
          </div>
          <p className="text-sm text-[var(--pf-text-muted)] mb-4">
            This is your current balance waiting to be paid out once thresholds are met.
          </p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <Check size={16} />
              <span>Stripe connected</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--pf-text-muted)]">
              <Info size={16} />
              <span>Payouts on the 1st & 15th</span>
            </div>
          </div>
        </div>

        {/* Threshold Settings */}
        <div className="pf-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Set Your Thresholds</h2>
          <p className="text-sm text-[var(--pf-text-secondary)] mb-6">
            When your earnings in each category reach the threshold, they'll automatically be included in the next payout. Lower thresholds = more frequent payouts, but each payout incurs a small processing fee.
          </p>

          <div className="space-y-6">
            {/* Merch Threshold */}
            <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Merch Sales</label>
                <span className="text-[var(--pf-orange)] font-bold">${estimatedPayouts.merch.toFixed(2)} pending</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={thresholds.merch}
                    onChange={(e) => setThresholds({ ...thresholds, merch: parseInt(e.target.value) })}
                    className="w-full h-2 bg-[var(--pf-bg)] rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--pf-orange)' }}
                  />
                  <div className="flex justify-between text-xs text-[var(--pf-text-muted)] mt-1">
                    <span>$10</span>
                    <span>$100</span>
                  </div>
                </div>
                <div className="w-20 text-right font-bold">${thresholds.merch}</div>
              </div>
              {estimatedPayouts.merch >= thresholds.merch && (
                <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                  <Check size={14} /> Ready for payout
                </p>
              )}
            </div>

            {/* Music Threshold */}
            <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Music Sales</label>
                <span className="text-[var(--pf-orange)] font-bold">${estimatedPayouts.music.toFixed(2)} pending</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={thresholds.music}
                    onChange={(e) => setThresholds({ ...thresholds, music: parseInt(e.target.value) })}
                    className="w-full h-2 bg-[var(--pf-bg)] rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--pf-orange)' }}
                  />
                  <div className="flex justify-between text-xs text-[var(--pf-text-muted)] mt-1">
                    <span>$5</span>
                    <span>$50</span>
                  </div>
                </div>
                <div className="w-20 text-right font-bold">${thresholds.music}</div>
              </div>
              {estimatedPayouts.music >= thresholds.music && (
                <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                  <Check size={14} /> Ready for payout
                </p>
              )}
            </div>

            {/* Marketplace Threshold */}
            <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Marketplace Referrals</label>
                <span className="text-[var(--pf-orange)] font-bold">${estimatedPayouts.marketplace.toFixed(2)} pending</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="range"
                    min="25"
                    max="200"
                    step="25"
                    value={thresholds.marketplace}
                    onChange={(e) => setThresholds({ ...thresholds, marketplace: parseInt(e.target.value) })}
                    className="w-full h-2 bg-[var(--pf-bg)] rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--pf-orange)' }}
                  />
                  <div className="flex justify-between text-xs text-[var(--pf-text-muted)] mt-1">
                    <span>$25</span>
                    <span>$200</span>
                  </div>
                </div>
                <div className="w-20 text-right font-bold">${thresholds.marketplace}</div>
              </div>
              {estimatedPayouts.marketplace >= thresholds.marketplace && (
                <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                  <Check size={14} /> Ready for payout
                </p>
              )}
            </div>

            {/* Superfans Threshold */}
            <div className="p-4 rounded-lg bg-[var(--pf-surface)]">
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Superfan Earnings</label>
                <span className="text-[var(--pf-orange)] font-bold">${estimatedPayouts.superfans.toFixed(2)} pending</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={thresholds.superfans}
                    onChange={(e) => setThresholds({ ...thresholds, superfans: parseInt(e.target.value) })}
                    className="w-full h-2 bg-[var(--pf-bg)] rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--pf-orange)' }}
                  />
                  <div className="flex justify-between text-xs text-[var(--pf-text-muted)] mt-1">
                    <span>$5</span>
                    <span>$50</span>
                  </div>
                </div>
                <div className="w-20 text-right font-bold">${thresholds.superfans}</div>
              </div>
              {estimatedPayouts.superfans >= thresholds.superfans && (
                <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                  <Check size={14} /> Ready for payout
                </p>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleSave}
              className="pf-btn pf-btn-primary flex items-center gap-2"
            >
              {saved ? (
                <>
                  <Check size={18} />
                  Saved!
                </>
              ) : (
                <>
                  <DollarSign size={18} />
                  Save Thresholds
                </>
              )}
            </button>
            {saved && (
              <span className="text-sm text-green-400">Your payout thresholds have been updated.</span>
            )}
          </div>
        </div>

        {/* Processing Info */}
        <div className="pf-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">How Payouts Work</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp size={18} className="text-[var(--pf-orange)]" />
                Payout Schedule
              </h3>
              <ul className="space-y-2 text-sm text-[var(--pf-text-secondary)]">
                <li>• Payouts processed on the 1st and 15th of each month</li>
                <li>• Takes 2-3 business days to reach your bank</li>
                <li>• Minimum $0.25 Stripe fee per payout</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <AlertCircle size={18} className="text-[var(--pf-orange)]" />
                Tips
              </h3>
              <ul className="space-y-2 text-sm text-[var(--pf-text-secondary)]">
                <li>• Lower thresholds = more frequent, smaller payouts</li>
                <li>• Higher thresholds = less fees, larger payouts</li>
                <li>• All pending balance is paid when any threshold is met</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Revenue Split Reminder */}
        <div className="bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 rounded-xl p-6">
          <h3 className="font-bold mb-2">Remember the Revenue Split</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[var(--pf-orange)]">67%</div>
              <div className="text-sm text-[var(--pf-text-muted)]">You (Seller)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">20%</div>
              <div className="text-sm text-[var(--pf-text-muted)]">Artist Fund</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">3%</div>
              <div className="text-sm text-[var(--pf-text-muted)]">Superfan</div>
            </div>
            <div>
              <div className="text-2xl font-bold">10%</div>
              <div className="text-sm text-[var(--pf-text-muted)]">Platform</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}