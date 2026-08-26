import { Metadata } from 'next'
import TrendingClient from './TrendingClient'

export const metadata: Metadata = {
  title: 'Trending Products - Hot Items from Independent Artists',
  description: 'Discover what is trending on Porterful. Curated top-selling merchandise from independent artists — apparel, accessories, home goods, and more. 80% goes to creators.',
  keywords: ['trending products', 'hot items', 'best selling merch', 'independent artist merchandise', 'trending apparel', 'top selling products', 'artist store', 'Porterful trending'],
  openGraph: {
    title: 'Trending Products | Porterful',
    description: 'Discover what is trending on Porterful. Top-selling merchandise from independent artists.',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trending Products | Porterful',
    description: 'Discover what is trending on Porterful. Top-selling merchandise from independent artists.',
  },
  alternates: {
    canonical: 'https://porterful.com/trending',
  },
}

export default function TrendingPage() {
  return <TrendingClient />
}
