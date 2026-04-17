'use client'

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { AudioProvider } from '@/lib/audio-context'
import { ThemeProvider } from '@/lib/theme-context'
import { WalletProvider } from '@/lib/wallet-context'
import { PayoutProvider } from '@/lib/payout-context'
import { CartProvider } from '@/lib/cart-context'
import { ToastProvider } from '@/components/Toast'
import { createBrowserSupabaseClient } from '@/lib/create-browser-client'

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
      if ((event as string) === 'SESSION_EXPIRED') {
        try {
          const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession()
          if (error || !refreshedSession) {
            console.warn('Session refresh failed, clearing session')
            setSession(null)
            setUser(null)
            sessionRef.current = null
          } else {
            setSession(refreshedSession)
            setUser(refreshedSession?.user ?? null)
            sessionRef.current = refreshedSession.access_token
          }
        } catch (err) {
          console.error('Session refresh error:', err)
          setSession(null)
          setUser(null)
          sessionRef.current = null
        }
      } else {
        setSession(session)
        setUser(session?.user ?? null)
        sessionRef.current = session?.access_token ?? null
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && supabase) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession()
          
          // If session changed unexpectedly, update state
          if (currentSession?.access_token !== sessionRef.current) {
            console.log('Session changed while away, updating state')
            setSession(currentSession)
            setUser(currentSession?.user ?? null)
            sessionRef.current = currentSession?.access_token ?? null
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
      </ThemeProvider>
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => useContext(SupabaseContext)
