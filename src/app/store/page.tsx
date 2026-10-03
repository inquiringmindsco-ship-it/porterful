import type { Metadata } from 'next'
import { StoreClient } from './StoreClient'

export const metadata: Metadata = {
  title: 'Shop — Music & Merch from Independent Artists',
  description: 'Shop music, apparel, tech, and home goods from independent artists. 80% of every sale goes directly to creators. Browse the Porterful marketplace.',
  alternates: { canonical: 'https://porterful.com/shop' },
  openGraph: {
    title: 'Porterful Store — Independent Artist Merch & Music',
    description: 'Shop music and merch from independent artists. 80% of every sale goes directly to creators.',
    url: 'https://porterful.com/shop',
    siteName: 'Porterful',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://porterful.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Porterful Store — Independent Artist Merch & Music',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Porterful Store — Independent Artist Merch & Music',
    description: 'Shop music and merch from independent artists. 80% goes to creators.',
    images: ['https://porterful.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function StorePage() {
  return <StoreClient />
}
