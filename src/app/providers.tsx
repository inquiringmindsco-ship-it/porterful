'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { User, Session } from '@supabase/supabase-js'
import { AudioProvider } from '@/lib/audio-context'
import { ThemeProvider } from '@/lib/theme-context'

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

  useEffect(() => {
    // Check for env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url') {
      // Demo mode - no Supabase configured
      console.log('Running in demo mode - Supabase not configured')
      setLoading(false)
      return
    }
    
    // Create Supabase client
    const client = createBrowserClient(supabaseUrl, supabaseKey)
    setSupabase(client)

    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <SupabaseContext.Provider value={{ supabase, user, session, loading }}>
      <ThemeProvider>
        <AudioProvider>
          {children}
        </AudioProvider>
      </ThemeProvider>
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => useContext(SupabaseContext)