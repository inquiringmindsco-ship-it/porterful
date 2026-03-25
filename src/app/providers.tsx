'use client'

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { User, Session } from '@supabase/supabase-js'
import { AudioProvider } from '@/lib/audio-context'
import { ThemeProvider } from '@/lib/theme-context'
import { WalletProvider } from '@/lib/wallet-context'
import { PayoutProvider } from '@/lib/payout-context'
import { CartProvider } from '@/lib/cart-context'
import { ToastProvider } from '@/components/Toast'

const SupabaseContext = createContext<{
  supabase: ReturnType<typeof createBrowserClient> | null
  user: User | null
  session: Session | null
  loading: boolean
}>({
  supabase: null,
  user: null,
  session: null,
  loading: true,
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const sessionRef = useRef<string | null>(null)

  // Initialize Supabase client
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url') {
      console.log('Running in demo mode - Supabase not configured')
      setLoading(false)
      return
    }
    
    const client = createBrowserClient(supabaseUrl, supabaseKey)
    setSupabase(client)

    // Validate and set initial session
    const validateSession = async () => {
      try {
        const { data: { session: validSession }, error } = await client.auth.getSession()
        
        if (error) {
          console.error('Session validation error:', error)
          setSession(null)
          setUser(null)
          sessionRef.current = null
        } else {
          setSession(validSession)
          setUser(validSession?.user ?? null)
          sessionRef.current = validSession?.access_token ?? null
        }
      } catch (err) {
        console.error('Session validation failed:', err)
        setSession(null)
        setUser(null)
        sessionRef.current = null
      }
      setLoading(false)
    }

    validateSession()

    // Listen for auth changes with proper error handling
    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      // Handle SESSION_EXPIRED by attempting refresh
      if ((event as string) === 'SESSION_EXPIRED') {
        try {
          const { data: { session: refreshedSession }, error } = await client.auth.refreshSession()
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

  // Re-validate session when window regains focus (prevents stale sessions after errors)
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
