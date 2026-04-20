import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/app/providers'
import { Navbar } from '@/components/Navbar'
import { AudioErrorBoundary } from '@/components/AudioErrorBoundary'
import { GlobalPlayer } from '@/components/GlobalPlayer'
import { getServerUser } from '@/lib/supabase-auth'
import { getThemeBootstrapScript, getThemeColor } from '@/lib/theme'

export const metadata: Metadata = {
  title: 'Porterful',
  description: 'Music. Land. Mind. Law. Commerce. Credit.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: getThemeColor('dark'),
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialUser = await getServerUser()

  return (
    <html lang="en" suppressHydrationWarning style={{ background: getThemeColor('dark') }}>
      <head>
        <meta name="theme-color" content={getThemeColor('dark')} />
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=2" />
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeBootstrapScript(),
          }}
        />
      </head>
      <body suppressHydrationWarning style={{ margin: 0, padding: 0, background: 'var(--pf-bg)', overflow: 'visible' }}>
        <Providers initialUser={initialUser}>
          <Navbar />
          {children}
          <AudioErrorBoundary>
            <GlobalPlayer />
          </AudioErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
