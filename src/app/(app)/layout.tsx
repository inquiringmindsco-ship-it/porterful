import type { Metadata } from 'next'
import Script from 'next/script'
import '../globals.css'
import { Footer } from '@/components/Footer'
import { TrackLockedToast } from '@/components/TrackLockedToast'
import { KeyboardShortcuts } from '@/lib/keyboard-shortcuts'

const ICON_VERSION = '20260608a'

export const metadata: Metadata = {
  title: 'Porterful',
  description: 'Stream music, shop merch, and support artists directly.',
  keywords: [
    'independent music', 'artist merchandise', 'music marketplace', 'support artists',
    'buy music', 'artist economy', 'streaming alternative', 'direct to fan',
    'music sales', 'band merch', 'independent artists', 'music platform',
  ],
  authors: [{ name: 'O D Porter', url: 'https://porterful.com' }],
  creator: 'Porterful',
  publisher: 'Porterful',
  metadataBase: new URL('https://porterful.com'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://porterful.com',
    siteName: 'Porterful',
    title: 'Porterful - Music + Merch for Independent Artists',
    description: 'Stream music, shop merch, and support artists directly.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Porterful' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Porterful',
    description: 'Stream music, shop merch, and support artists directly.',
    creator: '@porterful',
    site: '@porterful',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: `/favicon.ico?v=${ICON_VERSION}`, type: 'image/x-icon' },
      { url: `/favicon-porterful.ico?v=${ICON_VERSION}`, type: 'image/x-icon' },
      { url: `/favicon-porterful-32.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '32x32' },
      { url: `/favicon-porterful-16.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '16x16' },
      { url: `/icon.svg?v=${ICON_VERSION}`, type: 'image/svg+xml' },
    ],
    apple: [{ url: `/apple-touch-icon.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '180x180' }],
  },
  manifest: `/manifest.json?v=${ICON_VERSION}`,
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Porterful' },
  formatDetection: { telephone: false, email: false, address: false },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Porterful',
  url: 'https://porterful.com',
  description: 'Stream music, shop merch, and support artists directly.',
  sameAs: [
    'https://twitter.com/porterful',
    'https://instagram.com/od.porter',
    'https://youtube.com/@odporter',
    'https://discord.gg/porterful',
    'https://tiktok.com/@Porterful',
  ],
  contactPoint: { '@type': 'ContactPoint', email: 'support@porterful.com', contactType: 'customer service' },
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        strategy="afterInteractive"
      />
      <Script src="/pwa.js" strategy="afterInteractive" />
      <KeyboardShortcuts />
      <main className="min-h-screen pb-24 pt-16 md:pt-20">
        {children}
      </main>
      <Footer />
      <TrackLockedToast />
    </>
  )
}
