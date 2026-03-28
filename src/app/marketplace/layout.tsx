import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marketplace - Artist Marketplace',
  description: 'Browse the Porterful marketplace for music, merch, and exclusive content from independent artists.',
  keywords: ['marketplace', 'artist marketplace', 'music marketplace', 'merch marketplace'],
  openGraph: {
    title: 'Marketplace - Porterful',
    description: 'Browse music and merch from independent artists.',
    images: ['/og-image.png'],
  },
}

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}