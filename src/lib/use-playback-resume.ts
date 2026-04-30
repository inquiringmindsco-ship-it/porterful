/**
 * Playback Resume Hook
 * Restores audio playback after returning from Stripe checkout
 */

'use client'

import { useEffect, useCallback } from 'react'
import { useAudio } from '@/lib/audio-context'
import { getCheckoutState, clearCheckoutState, shouldResumePlayback } from '@/lib/checkout-state'
import { TRACKS } from '@/lib/data'

export function usePlaybackResume() {
  const { playTrack, setVolume, currentTrack, seek } = useAudio()

  const resumePlayback = useCallback(() => {
    const state = getCheckoutState()
    if (!state) return false

    // Only resume if we have a track ID and user was playing
    if (state.trackId && shouldResumePlayback()) {
      const catalogTrack = TRACKS.find((track) => (
        track.id === state.trackId
        || (track.title === state.trackTitle && track.artist === state.artistName)
      ))
      const legacyAudioUrl = (state as any).audio_url
      const audioUrl = state.audioUrl?.trim()
        || (typeof legacyAudioUrl === 'string' ? legacyAudioUrl.trim() : '')
        || catalogTrack?.audio_url
        || ''

      if (!audioUrl) {
        clearCheckoutState()
        return false
      }

      // Resume the track
      playTrack({
        id: state.trackId,
        title: state.trackTitle,
        artist: state.artistName,
        audio_url: audioUrl,
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
