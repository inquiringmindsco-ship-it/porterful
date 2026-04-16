import type { Metadata } from 'next'
import Script from 'next/script'
import '../globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { InstallPrompt, IOSInstallInstructions } from '@/components/InstallPrompt'
import { ArtistModal } from '@/components/ArtistModal'
import { TrackLockedToast } from '@/components/TrackLockedToast'
import { KeyboardShortcuts } from '@/lib/keyboard-shortcuts'

export const metadata: Metadata = {
  title: {
    default: 'Porterful - Music + Merch for Independent Artists',
    template: '%s | Porterful'
  },
  description: 'Stream music, buy tracks, shop merch. 80% goes to artists. No label. No middleman. Where artists own everything.',
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
    description: 'Stream music, buy tracks, shop merch. 80% goes to artists.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Porterful' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Porterful',
    description: 'Stream music, buy tracks, shop merch. 80% goes to artists.',
    creator: '@porterful',
    site: '@porterful',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/icon.svg?v=2', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png?v=2', type: 'image/png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Porterful' },
  formatDetection: { telephone: false, email: false, address: false },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Porterful',
  url: 'https://porterful.com',
  description: 'Stream music, buy tracks, shop merch. 80% goes to artists.',
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
      <Navbar />
      <main className="min-h-screen pb-24 pt-16 md:pt-20">
        {children}
      </main>
      <Footer />
      <ArtistModal />
      <TrackLockedToast />
      <InstallPrompt />
      <IOSInstallInstructions />
    </>
  )
}
