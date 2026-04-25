'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { AudioProvider } from '@/lib/audio-context'
import { ThemeProvider } from '@/lib/theme-context'
import { AccentProvider } from '@/lib/accent-context'
import { WalletProvider } from '@/lib/wallet-context'
import { PayoutProvider } from '@/lib/payout-context'
import { CartProvider } from '@/lib/cart-context'
import { ToastProvider } from '@/components/Toast'
import { createBrowserSupabaseClient } from '@/lib/create-browser-client'
import { initSentry, captureAuthError } from '@/lib/sentry'

// Initialize Sentry on client
if (typeof window !== 'undefined') {
  initSentry()
}

const SupabaseContext = createContext<{
  supabase: ReturnType<typeof createBrowserSupabaseClient>
  user: User | null
  session: Session | null
  loading: boolean
}>({
  supabase: null as unknown as ReturnType<typeof createBrowserSupabaseClient>,
  user: null,
  session: null,
  loading: true,
})

export function Providers({
  children,
  initialUser = null,
}: {
  children: React.ReactNode
  initialUser?: User | null
}) {
  const [supabase] = useState(() => createBrowserSupabaseClient())
  const [user, setUser] = useState<User | null>(initialUser)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(!initialUser)
  const sessionRef = useRef<string | null>(null)

  useEffect(() => {
    const validateSession = async () => {
      try {
        const { data: { session: validSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session validation error:', error)
          // Don't clear SSR-confirmed user on transient errors
          if (!initialUser) {
            setSession(null)
            setUser(null)
            sessionRef.current = null
          }
        } else if (validSession) {
          // Session confirmed — update state
          setSession(validSession)
          setUser(validSession.user ?? null)
          sessionRef.current = validSession.access_token
        }
        // If no session but we have initialUser from SSR, trust SSR for now
        // Client cookies may not be fully synced yet
      } catch (err) {
        console.error('Session validation failed:', err)
        captureAuthError(err, { step: 'session-validation' })
        // Don't clear SSR-confirmed user on transient errors
        if (!initialUser) {
          setSession(null)
          setUser(null)
          sessionRef.current = null
        }
      }
      setLoading(false)
    }

    validateSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
        sessionRef.current = null
      } else if ((event as string) === 'SESSION_EXPIRED') {
        try {
          const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession()
          if (!error && refreshedSession) {
            setSession(refreshedSession)
            setUser(refreshedSession.user)
            sessionRef.current = refreshedSession.access_token
          } else {
            setSession(null)
            setUser(null)
            sessionRef.current = null
          }
        } catch {
          setSession(null)
          setUser(null)
          sessionRef.current = null
        }
      } else if (session) {
        // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED, INITIAL_SESSION with real session
        setSession(session)
        setUser(session.user)
        sessionRef.current = session.access_token
      }
      // INITIAL_SESSION with null session: don't overwrite server-confirmed initialUser
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && supabase) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession()
          
          // If session changed while tab was hidden, sync state
          if (currentSession?.access_token !== sessionRef.current) {
            if (currentSession) {
              setSession(currentSession)
              setUser(currentSession.user)
              sessionRef.current = currentSession.access_token
            }
            // If null and token changed: SIGNED_OUT event will clear — don't race it
          }
        } catch (err) {
          console.error('Session re-validation failed:', err)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [supabase])

  return (
    <SupabaseContext.Provider value={{ supabase, user, session, loading }}>
      <ThemeProvider>
        <AccentProvider>
          <AudioProvider>
            <CartProvider>
              <WalletProvider>
                <PayoutProvider>
                  <ToastProvider>
                    {children}
                  </ToastProvider>
                </PayoutProvider>
              </WalletProvider>
            </CartProvider>
          </AudioProvider>
        </AccentProvider>
      </ThemeProvider>
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => useContext(SupabaseContext)
