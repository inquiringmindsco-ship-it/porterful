import { Metadata } from 'next'
import ShopClient from './ShopClient'

export const metadata: Metadata = {
  title: 'Shop Merch - Official Artist Merchandise',
  description: 'Browse official merchandise from your favorite independent artists. T-shirts, hoodies, vinyl, posters, and more. 80% goes directly to artists.',
  keywords: ['artist merchandise', 'band merch', 'music merch', 'vinyl', 't-shirts', 'hoodies', 'independent artist merch', 'artist shop'],
  openGraph: {
    title: 'Shop Merch - Porterful',
    description: 'Official artist merchandise. Support independent artists directly.',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Merch - Porterful',
    description: 'Official artist merchandise. Support independent artists directly.',
  },
  alternates: {
    canonical: 'https://porterful.com/store',
  },
}

export default function ShopPage() {
  return <ShopClient />
}
