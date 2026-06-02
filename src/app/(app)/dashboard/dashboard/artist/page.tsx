'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Legacy redirect: this route exists for backwards compatibility
// The canonical route is /dashboard/artist
// Users hitting this URL will be redirected to the canonical path

export default function DashboardDashboardArtistRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/artist')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-[var(--pf-text-muted)]">Redirecting to artist dashboard...</p>
    </div>
  )
}
