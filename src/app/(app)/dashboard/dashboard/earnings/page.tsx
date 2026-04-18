'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, ArrowUp, ArrowDown, ShoppingCart, Users } from 'lucide-react';

interface EarningsData {
  seller: {
    total_earned_cents: number;
    order_count: number;
    recent_sales: Array<{
      id: string;
      amount: number;
      seller_total: number;
      product_id: string;
      buyer_email: string;
      created_at: string;
      stripe_checkout_session_id: string;
    }>;
  };
  superfan: {
    total_earned_cents: number;
    available_cents: number;
    tier: string;
  } | null;
  purchases: Array<{
    id: string;
    amount: number;
    product_id: string;
    created_at: string;
  }>;
  referral: {
    total_earned_cents: number;
    pending_cents: number;
    paid_cents: number;
    history: Array<{
      id: string;
      commission_cents: number;
      status: string;
      created_at: string;
      order_id: string;
    }>;
  };
}

function formatCents(c: number) {
  return (c / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

const PRODUCT_LABELS: Record<string, string> = {
  'credit-klimb': 'Credit Klimb',
  'nlds-membership': 'NLDS Deal Access',
  'teachyoung': 'TeachYoung',
  'family-os': 'Family Legacy OS',
};

export default function EarningsDashboard() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/dashboard/earnings', { credentials: 'include' })
      .then(r => {
        if (r.status === 401) {
          window.location.href = '/login';
          return null;
        }
        return r.json();
      })
      .then(d => {
        if (d) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        setError('Failed to load earnings');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[var(--pf-orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 text-gray-400">
        {error || 'No earnings data yet'}
      </div>
    );
  }

  const { seller, superfan, referral, purchases } = data;
  const hasSales = seller.order_count > 0;
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Seller Earnings */}
        <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Earned</p>
              <p className="text-2xl font-black text-white">{formatCents(seller.total_earned_cents)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <TrendingUp className="w-4 h-4" />
            {seller.order_count} sale{seller.order_count !== 1 ? 's' : ''} recorded
          </div>
        </div>

        {/* Superfan Earnings */}
        <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--pf-orange)]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--pf-orange)]" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Superfan Earnings</p>
              <p className="text-2xl font-black text-white">
                {superfan ? formatCents(superfan.total_earned_cents) : '$0.00'}
              </p>
            </div>
          </div>
          {superfan ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="px-2 py-0.5 bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] text-xs font-bold rounded-full">
                {superfan.tier?.toUpperCase() || 'SUPPORTER'}
              </span>
              <span>{formatCents(superfan.available_cents)} available</span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Not a superfan yet</p>
          )}
        </div>

        {/* Purchases */}
        <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Purchases</p>
              <p className="text-2xl font-black text-white">{data.purchases.length}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Items bought through Porterful</p>
        </div>
      </div>

      {/* Referral Commissions */}
      {data.referral && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Referral Commissions</p>
              <p className="text-2xl font-black text-white">{formatCents(data.referral.total_earned_cents)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Pending</p>
              <p className="text-lg font-bold text-yellow-400">{formatCents(data.referral.pending_cents)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Paid Out</p>
              <p className="text-lg font-bold text-green-400">{formatCents(data.referral.paid_cents)}</p>
            </div>
          </div>
          {data.referral.history.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-500/20">
              <p className="text-xs text-gray-500 mb-2">{data.referral.recent.length} referral commission(s)</p>
              {data.referral.recent.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeAgo(entry.created_at)}
                  </span>
                  <span className="text-sm font-bold text-green-400">+{formatCents(entry.amount_cents)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    entry.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    entry.status === 'withdrawn' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>{entry.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Sales */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Sales</h2>
        {!hasSales ? (
          <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-lg font-bold mb-2">No sales yet</h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">
              Create an offer link and share it. When someone buys through your link, the sale will appear here.
            </p>
            <a
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--pf-orange)] text-white font-bold rounded-xl hover:bg-[var(--pf-orange)]/90 transition"
            >
              Go to Store →
            </a>
          </div>
        ) : (
          <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--pf-border)]">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Product</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-4">Sale Amount</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-4">Your Earnings</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-4">Buyer</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--pf-border)]">
                {seller.recent_sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[var(--pf-bg)] transition">
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">
                        {PRODUCT_LABELS[sale.product_id] || sale.product_id || 'Product'}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-300">{formatCents(sale.amount)}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-green-400 font-bold">+{formatCents(sale.seller_total)}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-400 text-sm">
                        {sale.buyer_email ? sale.buyer_email.split('@')[0] : 'Anonymous'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-gray-500 text-sm flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {timeAgo(sale.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
