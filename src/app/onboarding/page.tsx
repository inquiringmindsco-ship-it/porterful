'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Music, ShoppingBag, Store, Building2, ArrowRight, Check, Star } from 'lucide-react';

const ROLES = [
  { 
    id: 'supporter', 
    icon: Star, 
    title: 'Supporter', 
    description: 'Shop, listen, and support artists',
    color: 'from-[var(--pf-orange)] to-amber-600',
    features: ['Browse marketplace', 'Stream music', 'Support artists', 'Earn as Superfan']
  },
  { 
    id: 'artist', 
    icon: Music, 
    title: 'Artist', 
    description: 'Sell merch, upload music, earn from everything',
    color: 'from-purple-500 to-purple-700',
    features: ['Upload music', 'Sell merchandise', 'Track earnings', 'Build fanbase']
  },
  { 
    id: 'business', 
    icon: Store, 
    title: 'Business', 
    description: 'List products in our marketplace',
    color: 'from-blue-500 to-blue-700',
    features: ['List products', 'Reach music fans', 'Artist promotions', 'Track sales']
  },
  { 
    id: 'brand', 
    icon: Building2, 
    title: 'Brand', 
    description: 'Sponsor artists and run campaigns',
    color: 'from-green-500 to-green-700',
    features: ['Sponsor artists', 'Run campaigns', 'Analytics dashboard', 'Brand exposure']
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const handleContinue = () => {
    if (step === 1 && selectedRole) {
      setStep(2);
    } else if (step === 2) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-[var(--pf-orange)]' : 'bg-[var(--pf-border)]'}`} />
          <div className="w-16 h-0.5 bg-[var(--pf-border)]" />
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-[var(--pf-orange)]' : 'bg-[var(--pf-border)]'}`} />
        </div>

        {step === 1 && (
          <>
            {/* Step 1: Choose Role */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">What brings you here?</h1>
              <p className="text-[var(--pf-text-secondary)] max-w-lg mx-auto">
                Choose your role to personalize your experience. You can always change this later.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    selectedRole === role.id
                      ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10'
                      : 'border-[var(--pf-border)] hover:border-[var(--pf-border-hover)] bg-[var(--pf-surface)]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shrink-0`}>
                      <role.icon className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{role.title}</h3>
                      <p className="text-sm text-[var(--pf-text-secondary)] mb-3">{role.description}</p>
                      <ul className="space-y-1">
                        {role.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-[var(--pf-text-muted)]">
                            <Check size={14} className="text-green-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleContinue}
                disabled={!selectedRole}
                className={`pf-btn pf-btn-primary text-lg px-10 py-4 ${
                  !selectedRole ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Continue <ArrowRight className="inline ml-2" size={20} />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Step 2: Quick Tips */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">You're all set!</h1>
              <p className="text-[var(--pf-text-secondary)] max-w-lg mx-auto">
                Here's a quick overview of how Porterful works.
              </p>
            </div>

            <div className="pf-card p-8 mb-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center shrink-0">
                    <span className="text-[var(--pf-orange)] font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Every purchase supports artists</h3>
                    <p className="text-sm text-[var(--pf-text-secondary)]">
                      Whether you're buying toothpaste or a t-shirt, 20% goes to artists. Choose who you want to support.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <span className="text-purple-400 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Proud to Pay for music</h3>
                    <p className="text-sm text-[var(--pf-text-secondary)]">
                      Set your own price for music. $1 minimum, or pay more to directly support artists you love.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-blue-400 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Become a Superfan</h3>
                    <p className="text-sm text-[var(--pf-text-secondary)]">
                      Share referral codes and earn 5% on merch, 3% on marketplace items. Passive income for supporting artists.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <span className="text-green-400 font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">This is the artist retirement plan</h3>
                    <p className="text-sm text-[var(--pf-text-secondary)]">
                      No 401(k) for artists? We built one. Every dollar flows to creators.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleContinue}
                className="pf-btn pf-btn-primary text-lg px-10 py-4"
              >
                Go to Dashboard <ArrowRight className="inline ml-2" size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}