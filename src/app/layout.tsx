import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/app/providers'
import { AudioProvider } from '@/lib/audio-context'
import { AudioErrorBoundary } from '@/components/AudioErrorBoundary'
import { GlobalPlayer } from '@/components/GlobalPlayer'
import { getServerUser } from '@/lib/supabase-auth'

export const metadata: Metadata = {
  title: 'Porterful',
  description: 'Music. Land. Mind. Law. Commerce. Credit.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialUser = await getServerUser()

  return (
    <html lang="en" className="dark" suppressHydrationWarning style={{ background: '#0a0a0a' }}>
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=2" />
      </head>
      <body suppressHydrationWarning style={{ margin: 0, padding: 0, background: 'var(--pf-bg)', overflow: 'visible' }}>
        <Providers initialUser={initialUser}>
          <AudioProvider>
            <AudioErrorBoundary>
              <GlobalPlayer />
            </AudioErrorBoundary>
            {children}
          </AudioProvider>
        </Providers>
      </body>
    </html>
  )
}
