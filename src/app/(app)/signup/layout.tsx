import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Signup - Porterful',
  description: 'Create a Porterful account as an artist, fan, business, or brand.',
  alternates: { canonical: '/signup' },
}

function LoadingSignup() {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--pf-orange)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--pf-text-muted)]">Loading your account…</p>
      </div>
    </div>
  )
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSignup />}>{children}</Suspense>
}
