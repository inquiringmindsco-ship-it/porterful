import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Discover Artists | Porterful',
  description: 'Discover independent artists on Porterful. Support creators directly through our music + commerce platform. Browse hip-hop, R&B, indie pop, and more.',
  keywords: ['independent artists', 'music artists', 'support artists', 'hip-hop artists', 'R&B artists', 'indie artists'],
  openGraph: {
    title: 'Discover Artists | Porterful',
    description: 'Discover independent artists on Porterful. Support creators directly.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Artists | Porterful',
    description: 'Discover and support independent artists on Porterful.',
  },
  alternates: {
    canonical: 'https://porterful.com/artists',
  },
}

export default function ArtistsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}