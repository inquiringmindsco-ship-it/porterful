/**
 * Playback Resume Hook
 * Restores audio playback after returning from Stripe checkout
 */

'use client'

import { useEffect, useCallback } from 'react'
import { useAudio } from '@/lib/audio-context'
import { getCheckoutState, clearCheckoutState, shouldResumePlayback } from '@/lib/checkout-state'

export function usePlaybackResume() {
  const { playTrack, setVolume, currentTrack, seek } = useAudio()

  const resumePlayback = useCallback(() => {
    const state = getCheckoutState()
    if (!state) return false

    // Only resume if we have a track ID and user was playing
    if (state.trackId && shouldResumePlayback()) {
      // Resume the track
      playTrack({
        id: state.trackId,
        title: state.trackTitle,
        artist: state.artistName,
        audio_url: state.audioUrl || '',
      })
      
      // Seek to saved position (seconds) after a short delay
      setTimeout(() => {
        if (state.currentTime > 0) {
          seek(state.currentTime)
        }
      }, 500)
      
      // Restore volume
      if (state.volume >= 0 && state.volume <= 1) {
        setVolume(state.volume * 100)
      }
      
      // Clear the saved state
      clearCheckoutState()
      return true
    }
    
    clearCheckoutState()
    return false
  }, [playTrack, setVolume, seek])

  return { resumePlayback, shouldResume: shouldResumePlayback }
}
