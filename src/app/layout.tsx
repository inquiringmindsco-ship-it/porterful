import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Providers } from '@/app/providers'
import { Navbar } from '@/components/Navbar'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { AudioErrorBoundary } from '@/components/AudioErrorBoundary'
import { GlobalPlayer } from '@/components/GlobalPlayer'
import { getServerUser } from '@/lib/supabase-auth'
import { getThemeBootstrapScript } from '@/lib/theme'

const ICON_VERSION = 'v3-20260914'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://porterful.com'),
  title: {
    default: 'Porterful — Music, Merch, and Direct Support',
    template: '%s | Porterful'
  },
  description: 'Music, merch, and direct support for independent artists.',
  openGraph: {
    type: 'website',
    url: 'https://porterful.com',
    siteName: 'Porterful',
    title: 'Porterful — Music, Merch, and Direct Support',
    description: 'Music, merch, and direct support for independent artists.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Porterful — Music, Merch, and Direct Support',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Porterful — Music, Merch, and Direct Support',
    description: 'Music, merch, and direct support for independent artists.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: `/favicon.ico?v=${ICON_VERSION}`, type: 'image/x-icon', sizes: 'any' },
      { url: `/favicon-32x32.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '32x32' },
      { url: `/favicon-16x16.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '16x16' },
      { url: `/icon.svg?v=${ICON_VERSION}`, type: 'image/svg+xml' },
    ],
    apple: [
      { url: `/apple-touch-icon.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Porterful',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
        <link rel="icon" href={`/favicon.ico?v=${ICON_VERSION}`} sizes="any" />
        <link rel="icon" href={`/favicon-porterful.ico?v=${ICON_VERSION}`} sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href={`/favicon-porterful-32.png?v=${ICON_VERSION}`} />
        <link rel="icon" type="image/png" sizes="16x16" href={`/favicon-porterful-16.png?v=${ICON_VERSION}`} />
        <link rel="icon" type="image/svg+xml" href={`/icon.svg?v=${ICON_VERSION}`} />
        <link rel="apple-touch-icon" href={`/apple-touch-icon.png?v=${ICON_VERSION}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeBootstrapScript(),
          }}
        />
      </head>
      <body className={geistSans.variable} suppressHydrationWarning style={{ margin: 0, padding: 0, overflow: 'visible' }}>
        <Providers initialUser={initialUser}>
          <Navbar />
          <div data-tour-id="porterful-shell">{children}</div>
          <AudioErrorBoundary>
            <GlobalPlayer />
          </AudioErrorBoundary>
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  )
}
