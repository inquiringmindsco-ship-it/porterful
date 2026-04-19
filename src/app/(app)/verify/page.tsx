'use client';

import { useRouter } from 'next/navigation';
import { VerificationForm } from '@/components/VerificationBadge';

export default function VerifyPage() {
  const router = useRouter();

  const handleComplete = async () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-xl font-bold mb-6">Verify</h1>
        <VerificationForm onComplete={handleComplete} />
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-text)] transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
