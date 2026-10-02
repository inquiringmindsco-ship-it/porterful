import type { Metadata } from 'next'
import { HomeClient } from './HomeClient'

export const metadata: Metadata = {
  title: 'Porterful — Music, Merch, and Direct Support',
  description: 'Music, merch, and direct support for independent artists. Upload your music, sell merch, and connect directly with fans.',
  openGraph: {
    title: 'Porterful — Where Artists Own Everything',
    description: 'Sell music and merch. Keep 80% of every sale. No label. No middleman.',
    url: 'https://porterful.com',
    siteName: 'Porterful',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://porterful.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Porterful — Where Artists Own Everything',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Porterful — Where Artists Own Everything',
    description: 'Sell music and merch. Keep 80% of every sale. No label. No middleman.',
    images: ['https://porterful.com/og-image.png'],
    creator: '@odporter',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function HomePage() {
  return <HomeClient />
}
