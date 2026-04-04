import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Signup - Join Porterful',
  description: 'Join Porterful as an artist or fan. Start selling music and merchandise or discover independent artists.',
}

function LoadingSignup() {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--pf-orange)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--pf-text-muted)]">Loading...</p>
      </div>
    </div>
  )
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSignup />}>{children}</Suspense>
}
