'use client'

import { useState, useEffect } from 'react'
import { useAudio } from '@/lib/audio-context'
import Link from 'next/link'
import { Lock, X, Headphones, ArrowRight } from 'lucide-react'

export function TrackLockedToast() {
  const [locked, setLocked] = useState(false)
  const [lockedTrackId, setLockedTrackId] = useState<string | null>(null)
  const { currentTrack, hasPurchased } = useAudio()

  useEffect(() => {
    const handleLocked = (e: CustomEvent) => {
      setLockedTrackId(e.detail.trackId)
      setLocked(true)
    }
    
    window.addEventListener('track-locked', handleLocked as EventListener)
    return () => window.removeEventListener('track-locked', handleLocked as EventListener)
  }, [])

  if (!locked || !lockedTrackId) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-4">
      <div className="bg-[var(--pf-surface)] border border-[var(--pf-orange)] rounded-xl p-4 shadow-xl shadow-[var(--pf-orange)]/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--pf-orange)]/20 flex items-center justify-center shrink-0">
            <Headphones size={20} className="text-[var(--pf-orange)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold mb-1">Listen to More?</h4>
            <p className="text-sm text-[var(--pf-text-secondary)] mb-3">
              You can preview any track for 90 seconds free. Unlock to listen without limits.
            </p>
            <div className="flex gap-2">
              <Link 
                href="/proud-to-pay" 
                className="flex-1 py-2 px-3 bg-[var(--pf-orange)] text-white rounded-lg font-medium text-center text-sm hover:bg-[var(--pf-orange-dark)] transition-colors flex items-center justify-center gap-1"
              >
                Proud to Pay
                <ArrowRight size={14} />
              </Link>
              <button 
                onClick={() => setLocked(false)}
                className="py-2 px-3 border border-[var(--pf-border)] rounded-lg hover:bg-[var(--pf-bg)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
