'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Zap } from 'lucide-react'

export default function RefPage() {
  const params = useParams()
  const linkId = params?.linkId as string

  useEffect(() => {
    if (linkId) {
      // Store the referral linkId in a cookie (30 days)
      document.cookie = `porterful_affiliate_ref=${linkId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
    }
  }, [linkId])

  // Redirect to homepage after setting cookie — with ref param for attribution
  useEffect(() => {
    window.location.href = `/?ref=${linkId}`
  }, [linkId])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--pf-bg)' }}>
      <div className="text-center">
        <div className="mb-4 flex justify-center animate-pulse text-[var(--pf-orange)]">
          <Zap className="h-10 w-10" />
        </div>
        <p style={{ color: 'var(--pf-muted)' }}>Taking you to Porterful...</p>
      </div>
    </div>
  )
}