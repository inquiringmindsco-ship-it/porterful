'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIOSInstalled = ('standalone' in window.navigator) && (window.navigator as any).standalone
      setIsInstalled(isStandalone || isIOSInstalled)
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after 5 seconds (don't annoy immediately)
      setTimeout(() => {
        setShowPrompt(true)
      }, 5000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Track if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    
    setShowPrompt(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt) return null

  // Check if dismissed this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-gradient-to-r from-[var(--pf-orange)] to-purple-600 rounded-xl shadow-2xl z-50 p-4 text-white">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-bold mb-1">Install Porterful</h3>
          <p className="text-sm text-white/80 mb-3">
            Add to home screen for quick access and offline support.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-white text-[var(--pf-orange)] rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-white/20 rounded-lg font-medium hover:bg-white/30 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-white/60 hover:text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// iOS Install Instructions Component
export function IOSInstallInstructions() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone
    
    if (isIOS && isSafari && !isStandalone) {
      // Show after 10 seconds
      const timer = setTimeout(() => {
        const dismissed = sessionStorage.getItem('ios-prompt-dismissed')
        if (!dismissed) setShow(true)
      }, 10000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  if (!show) return null

  const handleDismiss = () => {
    setShow(false)
    sessionStorage.setItem('ios-prompt-dismissed', 'true')
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl shadow-2xl z-50 p-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--pf-orange)]/10 flex items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--pf-orange)" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-bold mb-1 text-[var(--pf-text)]">Add to Home Screen</h3>
          <p className="text-sm text-[var(--pf-text-secondary)] mb-3">
            Tap <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mx-1"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="15,3 12,6 9,3"/><line x1="12" y1="6" x2="12" y2="15"/></svg> then "Add to Home Screen"
          </p>
          <button
            onClick={handleDismiss}
            className="text-sm text-[var(--pf-orange)] hover:underline"
          >
            Got it
          </button>
        </div>
        <button onClick={handleDismiss} className="text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}