import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import { GlobalPlayer } from '@/components/GlobalPlayer'
import { Footer } from '@/components/Footer'
import { InstallPrompt, IOSInstallInstructions } from '@/components/InstallPrompt'
import { CompetitionModal } from '@/components/CompetitionModal'
import { SuperfanModal } from '@/components/SuperfanModal'
import { BusinessModal } from '@/components/BusinessModal'
import { KeyboardShortcuts } from '@/lib/keyboard-shortcuts'
import Script from 'next/script'

export const metadata: Metadata = {
  title: {
    default: 'Porterful - Music + Merch for Independent Artists',
    template: '%s | Porterful'
  },
  description: 'Stream music, buy tracks, shop merch. 80% goes to artists. No label. No middleman. Where artists own everything.',
  keywords: [
    'independent music',
    'artist merchandise',
    'music marketplace',
    'support artists',
    'buy music',
    'artist economy',
    'streaming alternative',
    'direct to fan',
    'music sales',
    'band merch',
    'independent artists',
    'music platform',
    'artist platform',
    'music download',
    'digital music'
  ],
  authors: [{ name: 'O D Porter', url: 'https://porterful.com' }],
  creator: 'Porterful',
  publisher: 'Porterful',
  metadataBase: new URL('https://porterful.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://porterful.com',
    siteName: 'Porterful',
    title: 'Porterful - Music + Merch for Independent Artists',
    description: 'Stream music, buy tracks, shop merch. 80% goes to artists. No label. No middleman. Where artists own everything.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Porterful - Music + Merch for Independent Artists',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Porterful - Music + Merch for Independent Artists',
    description: 'Stream music, buy tracks, shop merch. 80% goes to artists.',
    creator: '@porterful',
    site: '@porterful',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/logo.svg',
    apple: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Porterful',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Porterful',
  url: 'https://porterful.com',
  logo: 'https://porterful.com/logo.svg',
  description: 'Stream music, buy tracks, shop merch. 80% goes to artists. No label. No middleman.',
  sameAs: [
    'https://twitter.com/porterful',
    'https://instagram.com/od.porter',
    'https://youtube.com/@odporter',
    'https://discord.gg/porterful',
    'https://tiktok.com/@Porterful',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@porterful.com',
    contactType: 'customer service',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ff6b00' },
    { media: '(prefers-color-scheme: dark)', color: '#ff6b00' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Porterful" />
        <meta name="application-name" content="Porterful" />
        <meta name="msapplication-TileColor" content="#ff6b00" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className="antialiased">
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script src="/pwa.js" strategy="afterInteractive" />
        <Providers>
          <KeyboardShortcuts />
          <Navbar />
          <main className="min-h-screen pb-24 pt-16 md:pt-20">
            {children}
          </main>
          <Footer />
          <CompetitionModal />
          <SuperfanModal />
          <BusinessModal />
          <GlobalPlayer />
          <InstallPrompt />
          <IOSInstallInstructions />
          </Providers>
      </body>
    </html>
  )
}