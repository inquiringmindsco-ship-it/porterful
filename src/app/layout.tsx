import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/app/providers'
import { Navbar } from '@/components/Navbar'
import { MobileBottomNav } from '@/components/MobileBottomNav'
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
  // Neutral dark for the iOS/Android browser chrome + PWA standalone
  // top bar so it doesn't lock to brand orange and follow accent
  // changes inside the app.
  themeColor: '#0F0F0F',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialUser = await getServerUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/brand/porterful_official_app_icon_option_1.png" />
        <link rel="apple-touch-icon" href="/brand/porterful_official_app_icon_option_1.png" />
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
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  )
}
