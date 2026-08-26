import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trending Products - Hot Items from Independent Artists',
  description: 'Discover what\'s hot in independent artist merchandise. Trending t-shirts, hoodies, accessories and more. 80% of every sale goes directly to creators.',
  keywords: ['trending merchandise', 'hot products', 'artist merch', 'best selling', 'popular products', 'independent artist products'],
  openGraph: {
    title: 'Trending Now - Porterful',
    description: 'Discover what\'s hot in independent artist merchandise.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trending Now - Porterful',
    description: 'Discover what\'s hot in independent artist merchandise.',
  },
  alternates: {
    canonical: 'https://porterful.com/trending',
  },
}

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
