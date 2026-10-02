import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f97316',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://porterful.com'),
  title: {
    default: 'Porterful — Music, Merch, and Direct Support',
    template: '%s | Porterful',
  },
  description: 'Music, merch, and direct support for independent artists. Upload your music, sell merch, and connect directly with fans.',
  keywords: ['independent music', 'artist platform', 'music streaming', 'merch', 'sell music', 'artist tools'],
  authors: [{ name: 'Porterful' }],
  creator: 'Porterful',
  publisher: 'Porterful',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://porterful.com',
    siteName: 'Porterful',
    title: 'Porterful — Where Artists Own Everything',
    description: 'Sell music and merch. Keep 80% of every sale. No label. No middleman.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Porterful — Where Artists Own Everything',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@porterful',
    creator: '@odporter',
    title: 'Porterful — Where Artists Own Everything',
    description: 'Sell music and merch. Keep 80% of every sale. No label. No middleman.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
