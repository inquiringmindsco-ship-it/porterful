'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

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
        <div className="text-4xl mb-4 animate-pulse">⚡</div>
        <p style={{ color: 'var(--pf-muted)' }}>Taking you to Porterful...</p>
      </div>
    </div>
  )
}
