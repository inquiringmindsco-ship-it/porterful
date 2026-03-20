import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import { Player } from '@/components/Player'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Porterful - The Artist Economy',
    template: '%s | Porterful'
  },
  description: 'Where artists own everything. Music, merch, marketplace — every purchase supports creators directly.',
  keywords: ['music', 'artists', 'merchandise', 'marketplace', 'independent', 'creator economy', 'streaming alternative'],
  authors: [{ name: 'Porterful' }],
  creator: 'Porterful',
  publisher: 'Porterful',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://porterful.com',
    siteName: 'Porterful',
    title: 'Porterful - The Artist Economy',
    description: 'Where artists own everything. Music, merch, marketplace — every purchase supports creators directly.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Porterful - The Artist Economy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Porterful - The Artist Economy',
    description: 'Where artists own everything. Music, merch, marketplace.',
    creator: '@porterful',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#ff6b00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
      </head>
      <body className="antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-screen pb-24">
            {children}
          </main>
          <Footer />
          <Player />
        </Providers>
      </body>
    </html>
  )
}