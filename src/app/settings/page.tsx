'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'referrals' | 'payouts' | 'notifications'>('profile');
  const [profile, setProfile] = useState({
    name: 'O D Porter',
    email: 'porter.jonathanj@gmail.com',
    phone: '504-298-5783',
    bio: 'New Orleans artist and creator.',
    location: 'New Orleans, LA',
    website: 'https://porterful.com',
    twitter: '@porterful',
    instagram: '@porterful',
  });

  const referralCode = 'PF-PORTERF';
  const referralStats = {
    totalReferrals: 47,
    activeReferrals: 32,
    totalEarnings: 892.50,
    pendingPayout: 342.75,
    paidOut: 549.75,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>
          <Link 
            href="/dashboard"
            className="text-[#ff6b00] hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'profile', label: 'Profile', icon: '👤' },
                { id: 'referrals', label: 'Referrals', icon: '💜' },
                { id: 'payouts', label: 'Payouts', icon: '💳' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#ff6b00]/20 text-[#ff6b00]'
                      : 'text-gray-400 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-[#ff6b00]/20 flex items-center justify-center text-4xl">
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <button className="bg-[#ff6b00] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#ff8533] transition-colors">
                      Upload Photo
                    </button>
                    <p className="text-gray-500 text-sm mt-2">JPG, PNG. Max 5MB.</p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                      className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Twitter</label>
                    <input
                      type="text"
                      value={profile.twitter}
                      onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Instagram</label>
                    <input
                      type="text"
                      value={profile.instagram}
                      onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors"
                    />
                  </div>
                </div>

                <button className="mt-6 bg-[#ff6b00] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#ff8533] transition-colors">
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'referrals' && (
              <div className="space-y-6">
                {/* Referral Code */}
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h2 className="text-xl font-bold mb-4">Your Referral Code</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-[#0a0a0a] border border-[#ff6b00] rounded-lg px-6 py-4 text-2xl font-mono font-bold text-[#ff6b00]">
                      {referralCode}
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(referralCode)}
                      className="bg-[#ff6b00] text-white px-6 py-4 rounded-lg font-semibold hover:bg-[#ff8533] transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-gray-400 mt-4">
                    Share this code. When people shop using it, you earn 5% on merch and 3% on marketplace items.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 text-center">
                    <div className="text-3xl font-bold text-[#ff6b00]">{referralStats.totalReferrals}</div>
                    <div className="text-gray-500">Total Referrals</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 text-center">
                    <div className="text-3xl font-bold">{referralStats.activeReferrals}</div>
                    <div className="text-gray-500">Active (30 days)</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 text-center">
                    <div className="text-3xl font-bold text-green-400">${referralStats.totalEarnings.toFixed(2)}</div>
                    <div className="text-gray-500">Total Earned</div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 text-center">
                    <div className="text-3xl font-bold">${referralStats.pendingPayout.toFixed(2)}</div>
                    <div className="text-gray-500">Pending</div>
                  </div>
                </div>

                {/* Share Links */}
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h2 className="text-xl font-bold mb-4">Share Your Link</h2>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      readOnly
                      value={`https://porterful.com?ref=${referralCode}`}
                      className="flex-1 bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-3"
                    />
                    <button 
                      onClick={() => navigator.clipboard.writeText(`https://porterful.com?ref=${referralCode}`)}
                      className="bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payouts' && (
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-6">Payout Settings</h2>
                
                <div className="bg-[#0a0a0a] rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#635bff] rounded flex items-center justify-center text-white font-bold">
                      S
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Stripe Account</p>
                      <p className="text-gray-500 text-sm">Connect to receive payouts</p>
                    </div>
                    <button className="bg-[#ff6b00] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#ff8533] transition-colors">
                      Connect Stripe
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-6">
                  <h3 className="font-semibold mb-4">Payout History</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-[#0a0a0a] rounded-lg">
                      <div>
                        <p className="font-semibold">Mar 15, 2026</p>
                        <p className="text-gray-500 text-sm">Bank Transfer</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">$124.50</p>
                        <p className="text-green-400 text-sm">Completed</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#0a0a0a] rounded-lg">
                      <div>
                        <p className="font-semibold">Mar 1, 2026</p>
                        <p className="text-gray-500 text-sm">Bank Transfer</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">$425.25</p>
                        <p className="text-green-400 text-sm">Completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  {[
                    { id: 'orders', label: 'Order Updates', desc: 'Get notified when you make a sale' },
                    { id: 'referrals', label: 'Referral Earnings', desc: 'When someone uses your code' },
                    { id: 'payouts', label: 'Payout Updates', desc: 'When payouts are processed' },
                    { id: 'marketing', label: 'Marketing Emails', desc: 'News, features, and tips' },
                  ].map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{pref.label}</p>
                        <p className="text-gray-500 text-sm">{pref.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff6b00]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}