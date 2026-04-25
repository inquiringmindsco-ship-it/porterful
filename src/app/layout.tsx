import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/app/providers'
import { Navbar } from '@/components/Navbar'
import { AudioErrorBoundary } from '@/components/AudioErrorBoundary'
import { GlobalPlayer } from '@/components/GlobalPlayer'
import { getServerUser } from '@/lib/supabase-auth'
import { getThemeBootstrapScript } from '@/lib/theme'

export const metadata: Metadata = {
  title: {
    default: 'Porterful',
    template: '%s | Porterful'
  },
  description: 'Music. Land. Mind. Law. Commerce. Credit.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialUser = await getServerUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=2" />
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeBootstrapScript(),
          }}
        />
      </head>
      <body suppressHydrationWarning style={{ margin: 0, padding: 0, overflow: 'visible' }}>
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
