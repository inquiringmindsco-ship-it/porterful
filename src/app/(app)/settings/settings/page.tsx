'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { User, Code, CreditCard, Bell, ExternalLink } from 'lucide-react';
import { useAccent } from '@/lib/accent-context';

export default function SettingsPage() {
  const { supabase, user } = useSupabase();
  const { accent, presets, setAccent, resetAccent } = useAccent();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'account' | 'referrals' | 'payouts' | 'notifications'>('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [message, setMessage] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    role: '',
    name: '',
    email: '',
    avatar_url: '',
  });

  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
  });
  const activeAccent = presets.find((preset) => preset.hex === accent) ?? presets[0];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadProfile();
    loadReferrals();
  }, [user]);

  async function loadProfile() {
    if (!user || !supabase) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile({
        role: profileData.role || '',
        name: profileData.full_name || profileData.username || '',
        email: profileData.email || user.email || '',
        avatar_url: profileData.avatar_url || '',
      });
      setReferralCode(profileData.referral_code || '');
    }
    setLoading(false);
  }

  async function loadReferrals() {
    if (!user || !supabase) return;
    
    const { count } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', user.id);
    
    // For now just count — earnings would come from a join with orders
    setReferralStats({
      totalReferrals: count || 0,
      totalEarnings: 0, // TODO: join with referral_earnings
    });
  }

  async function saveProfile() {
    if (!user || !supabase) return;
    setSaving(true);
    setMessage('');

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.name,
          avatar_url: profile.avatar_url,
        })
        .eq('id', user.id)

      if (profileError) {
        throw profileError
      }

      await loadProfile();
      router.refresh();
      setMessage('Profile saved!');
    } catch (err: any) {
      setMessage('Error saving: ' + (err?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  }

  async function uploadProfilePhoto(file: File) {
    if (!user || !supabase) return;

    setPhotoUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'artist-images');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json().catch(() => ({}));

      if (!uploadRes.ok || uploadData.error) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      const url = uploadData.url as string;
      setProfile((prev) => ({ ...prev, avatar_url: url }));

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      await loadProfile();
      router.refresh();
      setMessage('Profile photo updated!');
    } catch (err: any) {
      setMessage('Error updating photo: ' + (err?.message || 'Unknown error'));
    } finally {
      setPhotoUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--pf-bg)] text-[var(--pf-text)] flex items-center justify-center">
        <p className="text-[var(--pf-text-muted)]">Loading your settings…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] text-[var(--pf-text)] py-8 px-4 sm:px-6 mobile-page-safe overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-[var(--pf-text-muted)]">Manage your account identity, preferences, and billing.</p>
          </div>
          <Link href="/dashboard" className="text-[var(--pf-orange)] hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'account', label: 'Account', icon: User },
                { id: 'referrals', label: 'Referrals', icon: Code },
                { id: 'payouts', label: 'Payouts', icon: CreditCard },
                { id: 'notifications', label: 'Notifications', icon: Bell },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[var(--pf-orange)]/20 text-[var(--pf-orange)]'
                        : 'text-[var(--pf-text-muted)] hover:bg-[var(--pf-surface)]'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">Public Artist Profile</h2>
                      <p className="text-[var(--pf-text-muted)] text-sm mt-1">
                        Edit your public artist name, bio, location, genres, image, and socials in one place.
                      </p>
                    </div>
                    <Link
                      href="/dashboard/dashboard/artist/edit"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--pf-orange)] text-white rounded-lg text-sm font-medium hover:bg-[var(--pf-orange-light)] transition-colors shrink-0"
                    >
                      <ExternalLink size={14} />
                      Edit Artist Profile
                    </Link>
                  </div>
                </div>

                <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
                  <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold">Accent Color</h2>
                      <p className="text-[var(--pf-text-muted)] text-sm mt-1">
                        Choose the Porterful accent used across your app interface.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-3 py-1.5 text-xs font-medium text-[var(--pf-text-muted)]">
                        <span
                          className="h-3 w-3 rounded-full border border-[var(--pf-border)]"
                          style={{ backgroundColor: activeAccent.hex }}
                        />
                        {activeAccent.name}
                      </span>
                      <button
                        type="button"
                        onClick={resetAccent}
                        className="rounded-lg border border-[var(--pf-border)] px-3 py-2 text-sm font-medium text-[var(--pf-text-secondary)] transition-colors hover:border-[var(--pf-orange)] hover:text-[var(--pf-text)]"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {presets.map((preset) => {
                      const isActive = preset.hex === accent
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setAccent(preset.hex)}
                          aria-pressed={isActive}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[var(--pf-orange)] ${
                            isActive
                              ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10'
                              : 'border-[var(--pf-border)] bg-[var(--pf-bg)] hover:border-[var(--pf-orange)]/50'
                          }`}
                        >
                          <span
                            className="h-10 w-10 shrink-0 rounded-lg border border-white/10 shadow-sm"
                            style={{ backgroundColor: preset.hex }}
                            aria-hidden="true"
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-[var(--pf-text)]">
                              {preset.name}
                            </span>
                            <span className="block text-xs text-[var(--pf-text-muted)]">
                              {preset.hex.toUpperCase()}
                            </span>
                          </span>
                          {isActive && (
                            <span className="ml-auto rounded-full bg-[var(--pf-orange)] px-2.5 py-1 text-[11px] font-semibold text-[#111111]">
                              Active
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold">Account Information</h2>
                      <p className="text-[var(--pf-text-muted)] text-sm mt-1">
                        These fields update your account identity only.
                      </p>
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center text-4xl overflow-hidden">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        profile.name?.charAt(0) || '?'
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={photoUploading}
                        className="bg-[var(--pf-orange)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--pf-orange-light)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                        {photoUploading ? 'Uploading...' : 'Upload Account Photo'}
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) void uploadProfilePhoto(file)
                          e.currentTarget.value = ''
                        }}
                        className="hidden"
                      />
                      <p className="text-[var(--pf-text-muted)] text-sm mt-2">
                        JPG, PNG. Max 5MB. This is your account image, not your public artist image.
                      </p>
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
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 text-[var(--pf-text-muted)] cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Role</label>
                      <input
                        type="text"
                        value={profile.role ? profile.role.replace(/_/g, ' ') : ''}
                        disabled
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 text-[var(--pf-text-muted)] cursor-not-allowed capitalize"
                      />
                    </div>
                  </div>

                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="mt-6 bg-[var(--pf-orange)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--pf-orange-light)] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'referrals' && (
              <div className="space-y-6">
                {/* Referral Code */}
                <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
                  <h2 className="text-xl font-bold mb-4">Your Referral Code</h2>
                  {referralCode ? (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-[var(--pf-bg)] border border-[#ff6b00] rounded-lg px-6 py-4 text-2xl font-mono font-bold text-[var(--pf-orange)]">
                          {referralCode}
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(referralCode)}
                          className="bg-[var(--pf-orange)] text-white px-6 py-4 rounded-lg font-semibold hover:bg-[var(--pf-orange-light)] transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-[var(--pf-text-muted)] mt-4">
                        Share this code. When people shop using it, referral rewards may apply on supported purchases.
                      </p>
                    </>
                  ) : (
                    <p className="text-[var(--pf-text-muted)]">No referral code yet.</p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)] text-center">
                    <div className="text-3xl font-bold text-[var(--pf-orange)]">{referralStats.totalReferrals}</div>
                    <div className="text-[var(--pf-text-muted)]">Total Referrals</div>
                  </div>
                  <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)] text-center">
                    <div className="text-lg font-semibold text-[var(--pf-text-secondary)]">Not connected yet</div>
                    <div className="text-[var(--pf-text-muted)] text-xs mt-2">Referral earnings will appear here once tracking and payout reporting are connected.</div>
                  </div>
                </div>

                {/* Share Link */}
                {referralCode && (
                  <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
                    <h2 className="text-xl font-bold mb-4">Share Your Link</h2>
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        readOnly
                        value={`https://porterful.com/store?ref=${encodeURIComponent(referralCode)}`}
                        className="flex-1 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(`https://porterful.com/store?ref=${encodeURIComponent(referralCode)}`)}
                        className="bg-[var(--pf-surface)] text-[var(--pf-text)] border border-[var(--pf-border)] px-4 py-3 rounded-lg hover:bg-[var(--pf-surface-hover)] transition-colors"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payouts' && (
              <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
                <h2 className="text-xl font-bold mb-6">Payout Settings</h2>

                <div className="bg-[var(--pf-bg)] rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#635bff] rounded flex items-center justify-center text-white font-bold">
                      S
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Stripe Account</p>
                      <p className="text-[var(--pf-text-muted)] text-sm">Stripe payouts are not live yet</p>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="bg-[var(--pf-surface-hover)] text-[var(--pf-text-muted)] px-4 py-2 rounded-lg font-semibold cursor-not-allowed opacity-80"
                    >
                      Stripe payouts coming soon
                    </button>
                  </div>
                  <p className="text-[var(--pf-text-muted)] text-sm mt-3">
                    Honest status: Stripe Connect is not live in this build yet.
                  </p>
                </div>

                <div className="border-t border-[var(--pf-border)] pt-6">
                  <h3 className="font-semibold mb-4">Payout History</h3>
                  <p className="text-[var(--pf-text-muted)] text-sm">No payouts yet. Stripe Connect is coming soon.</p>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-[var(--pf-surface)] rounded-xl p-6 border border-[var(--pf-border)]">
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
                        <p className="text-[var(--pf-text-muted)] text-sm">{pref.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-[var(--pf-surface)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--pf-orange)]"></div>
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
